/* 孔乙己 注释读本 — 交互脚本 */
(function () {
  'use strict';

  var pop = document.getElementById('pop');
  var popWord = pop.querySelector('.pop-word');
  var popPinyin = pop.querySelector('.pop-pinyin');
  var popGloss = pop.querySelector('.pop-gloss');
  var popSave = pop.querySelector('.pop-save');
  var currentSpan = null;
  var currentWord = null;

  /* ---------- 生词本 (localStorage) ---------- */
  var KEY = 'kyj_wordbook';
  function loadWB() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveWB(wb) { localStorage.setItem(KEY, JSON.stringify(wb)); }
  var wb = loadWB();

  var wbBtn = document.getElementById('wbBtn');
  var wbCount = document.getElementById('wbCount');
  var wbDrawer = document.getElementById('wbDrawer');
  var wbList = document.getElementById('wbList');

  function renderWB() {
    var words = Object.keys(wb);
    wbCount.textContent = words.length;
    if (!words.length) {
      wbList.innerHTML = '<li class="wb-empty">还没有收藏生词。点击正文中的红色词语，再点「★ 收入生词本」。</li>';
      return;
    }
    wbList.innerHTML = words.map(function (w) {
      var v = VOCAB[w] || [];
      return '<li><span class="wi"><b>' + esc(w) + '</b><span class="wp">' + esc(v[0] || '') +
        '</span><span class="wg">' + esc(v[1] || '') + '</span></span>' +
        '<button class="wdel" data-w="' + esc(w) + '" type="button">×</button></li>';
    }).join('');
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  wbList.addEventListener('click', function (e) {
    var t = e.target;
    if (t.classList.contains('wdel')) {
      delete wb[t.getAttribute('data-w')];
      saveWB(wb); renderWB(); syncSaveBtn();
    }
  });
  document.getElementById('wbClear').addEventListener('click', function () {
    wb = {}; saveWB(wb); renderWB(); syncSaveBtn();
  });
  wbBtn.addEventListener('click', function () {
    wbDrawer.hidden = !wbDrawer.hidden;
    if (!wbDrawer.hidden) renderWB();
  });
  document.getElementById('wbClose').addEventListener('click', function () { wbDrawer.hidden = true; });

  function syncSaveBtn() {
    if (currentWord && wb[currentWord]) {
      popSave.classList.add('saved');
      popSave.textContent = '✓ 已收入生词本';
    } else {
      popSave.classList.remove('saved');
      popSave.textContent = '★ 收入生词本';
    }
  }
  popSave.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!currentWord) return;
    if (wb[currentWord]) { delete wb[currentWord]; }
    else { wb[currentWord] = 1; }
    saveWB(wb); renderWB(); syncSaveBtn();
  });

  /* ---------- 词语弹窗 ---------- */
  function openPop(span) {
    var w = span.getAttribute('data-w');
    var v = VOCAB[w];
    if (!v) return;
    if (currentSpan) currentSpan.classList.remove('active');
    currentSpan = span; currentWord = w;
    span.classList.add('active');

    popWord.textContent = w;
    popPinyin.textContent = v[0];
    popGloss.textContent = v[1];
    syncSaveBtn();
    pop.hidden = false;

    var r = span.getBoundingClientRect();
    var scrollX = window.pageXOffset, scrollY = window.pageYOffset;
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var x = r.left + scrollX + r.width / 2 - pw / 2;
    x = Math.max(8 + scrollX, Math.min(x, scrollX + document.documentElement.clientWidth - pw - 8));
    var y = r.bottom + scrollY + 8;
    if (r.bottom + ph + 16 > window.innerHeight && r.top - ph - 8 > 0) {
      y = r.top + scrollY - ph - 8;
    }
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
  }
  function closePop() {
    pop.hidden = true;
    if (currentSpan) currentSpan.classList.remove('active');
    currentSpan = null; currentWord = null;
  }

  document.addEventListener('click', function (e) {
    var span = e.target.closest ? e.target.closest('.w') : null;
    if (span && span.hasAttribute('data-w')) {
      e.stopPropagation();
      if (span === currentSpan) { closePop(); } else { openPop(span); }
      return;
    }
    if (pop.contains(e.target)) return;
    closePop();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closePop(); wbDrawer.hidden = true; }
  });
  window.addEventListener('scroll', function () {
    if (!pop.hidden) closePop();
  }, { passive: true });

  /* ---------- 脚注 ---------- */
  document.querySelectorAll('.fn').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var id = 'fn' + a.getAttribute('data-fn');
      var li = document.getElementById(id);
      if (!li) return;
      li.scrollIntoView({ behavior: 'smooth', block: 'center' });
      li.classList.add('flash');
      setTimeout(function () { li.classList.remove('flash'); }, 1600);
    });
  });

  /* ---------- 阅读进度 ---------- */
  var bar = document.getElementById('progress');
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });

  renderWB();
})();
