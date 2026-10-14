/* الترويسة والتذييل الموحّدان + روابط التواصل من config.js */
;(function () {
  var cfg = window.SITE_CONFIG || {}
  var root = document.body.getAttribute('data-root') || '.'
  var page = document.body.getAttribute('data-page') || ''

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  // الشعار المؤقت — يُستبدل تلقائياً إذا وُضع مسار في config.logo
  var LOGO_SVG =
    '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#ffffff"/>' +
    '<rect x="9" y="10" width="22" height="20" rx="3" fill="none" stroke="#17325a" stroke-width="2.4"/>' +
    '<path d="M13 16h14M13 20h9" stroke="#2c5c9c" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M21 25.5l2.6 2.5 5-5.5" fill="none" stroke="#1f7a4d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

  function logo() {
    return cfg.logo ? '<img src="' + esc(root + '/' + cfg.logo) + '" alt="">' : LOGO_SVG
  }

  var links = [
    ['home', 'index.html', 'الرئيسية'],
    ['verify', 'v/', 'التحقق من الترخيص'],
    ['contact', 'contact.html', 'تواصل معنا']
  ]
  function nav(cls) {
    return links
      .map(function (l) {
        return '<a href="' + root + '/' + l[1] + '"' + (l[0] === page && cls ? ' class="active"' : '') + '>' + l[2] + '</a>'
      })
      .join('')
  }

  var header = document.getElementById('site-header')
  if (header) {
    header.className = 'site-header'
    header.innerHTML =
      '<div class="wrap"><a class="brand" href="' + root + '/index.html">' +
      '<span class="brand-logo">' + logo() + '</span>' +
      '<span class="brand-text"><b>' + esc(cfg.product) + '</b><small>' + esc(cfg.company) + '</small></span></a>' +
      '<nav class="site-nav">' + nav(true) + '</nav></div>'
  }
  var footer = document.getElementById('site-footer')
  if (footer) {
    footer.className = 'site-footer'
    footer.innerHTML =
      '<div class="wrap"><div class="foot-brand"><b>' + esc(cfg.product) + '</b><span>' + esc(cfg.company) + '</span>' +
      (cfg.tagline ? '<small>' + esc(cfg.tagline) + '</small>' : '') + '</div>' +
      '<nav>' + nav(false) + '</nav>' +
      '<div class="copy">© ' + new Date().getFullYear() + ' ' + esc(cfg.company) + '</div></div>'
  }

  // طرق التواصل: الحقول الفارغة لا تظهر
  var c = cfg.contact || {}
  var ICONS = {
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/></svg>'
  }
  var digits = function (s) {
    return String(s).replace(/[^\d]/g, '')
  }
  var CONTACTS = [
    ['whatsapp', 'واتساب', function (v) { return 'https://wa.me/' + digits(v) }, function (v) { return '+' + digits(v) }],
    ['phone', 'اتصال هاتفي', function (v) { return 'tel:' + String(v).replace(/[^\d+]/g, '') }, String],
    ['email', 'البريد الإلكتروني', function (v) { return 'mailto:' + v }, String],
    ['instagram', 'إنستغرام', function (v) { return 'https://instagram.com/' + String(v).replace(/^@/, '') }, function (v) { return '@' + String(v).replace(/^@/, '') }],
    ['facebook', 'فيسبوك', String, function () { return 'صفحتنا على فيسبوك' }]
  ].filter(function (x) {
    return String(c[x[0]] || '').trim() !== ''
  })

  window.SiteContacts = CONTACTS.map(function (x) {
    var v = String(c[x[0]]).trim()
    return { key: x[0], label: x[1], href: x[2](v), text: x[3](v), icon: ICONS[x[0]] }
  })

  var list = document.getElementById('contact-list')
  if (list) {
    if (!window.SiteContacts.length) {
      list.innerHTML = '<div class="card note">سيتم إضافة طرق التواصل قريباً.</div>'
    } else {
      list.innerHTML = window.SiteContacts.map(function (x) {
        var ext = /^https?:/.test(x.href) ? ' target="_blank" rel="noopener"' : ''
        return (
          '<a class="card contact-item" href="' + esc(x.href) + '"' + ext + '>' +
          '<span class="ico">' + x.icon + '</span>' +
          '<span><b>' + esc(x.label) + '</b><span class="ltr">' + esc(x.text) + '</span></span></a>'
        )
      }).join('')
    }
  }
})()
