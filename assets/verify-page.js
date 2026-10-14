/* صفحة التحقق: تقرأ الرمز بعد # وتعرض النتيجة */
;(function () {
  var badge = document.getElementById('badge')
  var details = document.getElementById('details')

  function show(kind, mark, title, sub) {
    badge.className = 'badge ' + kind
    badge.innerHTML = ''
    var m = document.createElement('span')
    m.className = 'mark'
    m.textContent = mark
    badge.appendChild(m)
    badge.appendChild(document.createTextNode(title))
    if (sub) {
      var s = document.createElement('small')
      s.textContent = sub
      badge.appendChild(s)
    }
  }
  function date(d) {
    return d ? String(d).slice(0, 10) : 'دائم'
  }

  async function run() {
    details.hidden = true
    var token = location.hash.replace(/^#/, '')
    var r = await window.JardLicense.verify(token)
    if (r.status === 'none')
      return show('wait', 'i', 'امسح رمز QR من البرنامج', 'افتح «الترخيص والتحقق» في برنامج جَرْد وامسح الرمز بكاميرا الجوال.')
    if (r.status === 'unsupported')
      return show('bad', '!', 'تعذّر التحقق', 'افتح الرابط بمتصفح حديث (Chrome أو Safari).')
    if (r.status === 'unlicensed') return show('bad', '✗', 'ترخيص غير صالح', 'هذه النسخة غير مُرخّصة.')
    if (r.status === 'invalid')
      return show('bad', '✗', 'ترخيص غير صالح', 'بيانات الترخيص غير صحيحة أو تم التلاعب بها.')
    if (r.status === 'expired')
      show('bad', '✗', 'ترخيص غير صالح', 'انتهت صلاحية الترخيص بتاريخ ' + date(r.payload.expiresAt))
    else show('ok', '✓', 'ترخيص صالح', 'نسخة أصلية مُرخّصة من SMT TECHNOLOGIES')

    var p = r.payload
    document.getElementById('d-customer').textContent = p.customer
    document.getElementById('d-edition').textContent = p.edition
    document.getElementById('d-expires').textContent = date(p.expiresAt)
    document.getElementById('d-machine').textContent = window.JardLicense.maskMachine(p.machineId)
    details.hidden = false
  }
  window.addEventListener('hashchange', run)
  run()
})()
