/* تفاعلات الصفحات: تكبير الصور، ظهور العناصر عند التمرير، زر الرجوع للأعلى */
;(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // ===== تكبير الصور (Lightbox) =====
  var imgs = Array.prototype.slice.call(document.querySelectorAll('img[data-zoom]'))
  if (imgs.length) {
    var box = document.createElement('div')
    box.className = 'lb'
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-modal', 'true')
    box.setAttribute('aria-label', 'عرض الصورة')
    box.hidden = true
    box.innerHTML =
      '<button class="lb-close" type="button" aria-label="إغلاق">×</button>' +
      '<button class="lb-nav lb-prev" type="button" aria-label="الصورة السابقة">›</button>' +
      '<figure class="lb-fig"><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-nav lb-next" type="button" aria-label="الصورة التالية">‹</button>'
    document.body.appendChild(box)
    var bImg = box.querySelector('img')
    var bCap = box.querySelector('figcaption')
    var cur = 0
    var lastFocus = null

    var show = function (i) {
      cur = (i + imgs.length) % imgs.length
      var el = imgs[cur]
      bImg.src = el.getAttribute('data-zoom') || el.src
      bImg.alt = el.alt
      bCap.textContent = el.getAttribute('data-caption') || el.alt
      box.classList.toggle('single', imgs.length < 2)
    }
    var open = function (i) {
      lastFocus = document.activeElement
      show(i)
      box.hidden = false
      document.documentElement.classList.add('lb-on')
      requestAnimationFrame(function () {
        box.classList.add('in')
      })
      box.querySelector('.lb-close').focus()
    }
    var close = function () {
      box.classList.remove('in')
      document.documentElement.classList.remove('lb-on')
      setTimeout(function () {
        box.hidden = true
      }, reduce ? 0 : 180)
      if (lastFocus) lastFocus.focus()
    }
    imgs.forEach(function (el, i) {
      el.setAttribute('tabindex', '0')
      el.setAttribute('role', 'button')
      el.setAttribute('aria-label', 'تكبير: ' + el.alt)
      el.addEventListener('click', function () {
        open(i)
      })
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open(i)
        }
      })
    })
    box.querySelector('.lb-close').addEventListener('click', close)
    box.querySelector('.lb-prev').addEventListener('click', function () {
      show(cur - 1)
    })
    box.querySelector('.lb-next').addEventListener('click', function () {
      show(cur + 1)
    })
    box.addEventListener('click', function (e) {
      if (e.target === box) close()
    })
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return
      if (e.key === 'Escape') close()
      // RTL: السهم اليسار = التالي
      else if (e.key === 'ArrowLeft') show(cur + 1)
      else if (e.key === 'ArrowRight') show(cur - 1)
    })
    // سحب على الجوال
    var sx = null
    box.addEventListener('touchstart', function (e) {
      sx = e.touches[0].clientX
    }, { passive: true })
    box.addEventListener('touchend', function (e) {
      if (sx == null) return
      var dx = e.changedTouches[0].clientX - sx
      if (Math.abs(dx) > 50) show(cur + (dx > 0 ? 1 : -1))
      sx = null
    })
  }

  // ===== ظهور العناصر عند التمرير =====
  var items = document.querySelectorAll('.reveal')
  if (!reduce && 'IntersectionObserver' in window && items.length) {
    document.documentElement.classList.add('rv')
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in')
          io.unobserve(en.target)
        }
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    items.forEach(function (el) {
      io.observe(el)
    })
  }

  // ===== زر الرجوع للأعلى =====
  var top = document.createElement('button')
  top.className = 'to-top'
  top.type = 'button'
  top.setAttribute('aria-label', 'الرجوع للأعلى')
  top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>'
  document.body.appendChild(top)
  top.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  })
  var onScroll = function () {
    top.classList.toggle('show', window.scrollY > 600)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})()
