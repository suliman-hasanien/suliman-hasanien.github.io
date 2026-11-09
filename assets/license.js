/*
 * التحقق من ترخيص جَرْد داخل المتصفح.
 * يحتوي على المفتاح العام فقط — لا يمكن إنشاء تراخيص به، فقط التحقق منها.
 */
;(function (g) {
  var PUBLIC_KEY =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyUqpzLxHERkYVjFGK8gmh9OcKPHnUoq3v4c/glGVwxggu2M3N0SE05RPcFT7VAYOiTbL0CEcTZ78MwaqtejTzrH5wsiCqnRADsdjVK0TSj0J9SfBeVksczKLLQqk1hr6oapbekOJyeP9abAhxjdNOvhpM8A+SFirhfnwI31T3R63s+C/8f9IfXF6OckNmcIoNJFaDe5HR73MAKcSeauTGnQX5xbYxGYEq3YU2AzwdG3xDLZMD4GngBl9+M1OJwUnWQy7p23PBEyUE4Si1bXezWDGPWrQZPbK2OuPJ/MoEcr1wMYHvsVX9v/qQz/7+nCv+egHISUC7VNDFkU3jOUNgwIDAQAB'
  var STD_FEATURES = ['inventory', 'sales', 'purchases', 'reports']

  function b64urlToBytes(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/')
    while (s.length % 4) s += '='
    var bin = atob(s)
    var out = new Uint8Array(bin.length)
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
  }

  /** يفك الرمز إلى الحمولة الأصلية والتوقيع؛ يرمي خطأ إذا كانت الصيغة غير صحيحة */
  function decode(token) {
    var parts = String(token).split('.')
    if (parts.length !== 2) throw new Error('format')
    var a = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(b64urlToBytes(parts[0])))
    if (!Array.isArray(a) || a.length !== 6) throw new Error('format')
    var features = typeof a[3] === 'number' ? STD_FEATURES.concat(['devices:' + a[3]]) : a[3]
    return {
      payload: {
        customer: a[0],
        machineId: a[1],
        edition: a[2],
        features: features,
        issuedAt: a[4],
        expiresAt: a[5]
      },
      sig: b64urlToBytes(parts[1])
    }
  }

  /** نفس ترتيب المفاتيح المستخدم عند التوقيع في أداة الإصدار */
  function canonical(p) {
    return JSON.stringify({
      customer: p.customer,
      machineId: p.machineId,
      edition: p.edition,
      features: p.features,
      issuedAt: p.issuedAt,
      expiresAt: p.expiresAt
    })
  }

  /**
   * النتيجة: { status: 'valid' | 'expired' | 'revoked' | 'invalid' | 'unlicensed' | 'unsupported', payload? }
   */
  async function verify(token) {
    if (!token) return { status: 'none' }
    if (token === '0') return { status: 'unlicensed' }
    if (!(g.crypto && g.crypto.subtle)) return { status: 'unsupported' }
    var d
    try {
      d = decode(token)
    } catch (e) {
      return { status: 'invalid' }
    }
    var ok = false
    try {
      var key = await g.crypto.subtle.importKey(
        'spki',
        b64urlToBytes(PUBLIC_KEY),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
      )
      ok = await g.crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        key,
        d.sig,
        new TextEncoder().encode(canonical(d.payload))
      )
    } catch (e) {
      ok = false
    }
    if (!ok) return { status: 'invalid' }
    var id = await licenseId(d.sig)
    if (await isRevoked(id)) return { status: 'revoked', payload: d.payload, id: id }
    if (d.payload.expiresAt && new Date(d.payload.expiresAt).getTime() < Date.now())
      return { status: 'expired', payload: d.payload }
    return { status: 'valid', payload: d.payload }
  }

  /** رقم الترخيص = أول 12 حرف من SHA-256 للتوقيع (نفس البرنامج وأداة الإلغاء) */
  async function licenseId(sigBytes) {
    var h = new Uint8Array(await g.crypto.subtle.digest('SHA-256', sigBytes))
    var hex = ''
    for (var i = 0; i < 6; i++) hex += ('0' + h[i].toString(16)).slice(-2)
    return hex.toUpperCase()
  }

  /**
   * قائمة الإلغاء (revoked.json جنب الموقع، موقّعة بالمفتاح الخاص). أي مشكلة
   * (مش موجودة، توقيع غلط) = مش ملغى.
   */
  async function isRevoked(id) {
    try {
      var res = await fetch(new URL('../revoked.json', location.href).toString(), { cache: 'no-store' })
      if (!res.ok) return false
      var d = await res.json()
      if (!d || d.v !== 1 || !Array.isArray(d.ids) || typeof d.sig !== 'string') return false
      var text = JSON.stringify({ v: 1, issuedAt: d.issuedAt, ids: d.ids.slice().sort() })
      var key = await g.crypto.subtle.importKey('spki', b64urlToBytes(PUBLIC_KEY), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
      var sig = b64urlToBytes(d.sig.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''))
      var ok = await g.crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, new TextEncoder().encode(text))
      return ok && d.ids.map(function (x) { return String(x).toUpperCase() }).indexOf(id) >= 0
    } catch (e) {
      return false
    }
  }

  /** يُظهر أول وآخر مقطع من رمز الجهاز فقط: 29956-****-CBF9A */
  function maskMachine(id) {
    var p = String(id || '').split('-')
    if (p.length < 2) return '****'
    return p[0] + '-****-' + p[p.length - 1]
  }

  g.JardLicense = { verify: verify, maskMachine: maskMachine }
})(typeof window !== 'undefined' ? window : globalThis)
