/* ============================================================
   李洛克 · 个人网站 — 交互脚本
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 导航栏：滚动阴影 ---------- */
  var header = document.getElementById('siteHeader');
  var onScrollHeader = function () {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 移动端菜单 ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // 点击链接后关闭移动端菜单
  navLinks.addEventListener('click', function (e) {
    if (e.target.closest('.nav-link')) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- 滚动显现动画 ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 导航高亮：当前区块 ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navAnchorMap = {};
  document.querySelectorAll('.nav-link').forEach(function (a) {
    if (a.getAttribute('href') && a.getAttribute('href').charAt(0) === '#') {
      navAnchorMap[a.getAttribute('href').slice(1)] = a;
    }
  });

  var setActive = function (id) {
    Object.keys(navAnchorMap).forEach(function (key) {
      navAnchorMap[key].classList.toggle('active', key === id);
    });
  };

  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- 页脚动态年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- DNA 双螺旋粒子动画 ---------- */
  function initDna() {
    var canvas = document.getElementById('dnaCanvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var hero = document.getElementById('hero');
    var heroInner = hero.querySelector('.hero-inner');

    var W = 0, H = 0;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var POINTS = 44;          // 每条链的粒子数
    var TURNS = 3.2;          // 螺旋圈数
    var phase = 0;
    var mouseX = 0.5, mouseY = 0.5;
    var offset = 0;           // 鼠标"拨动"相位偏移
    var ampScale = 1;         // 鼠标纵向影响振幅
    var running = true;
    var rafId = null;

    function resize() {
      var rect = hero.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // 平滑追踪鼠标
      var offTarget = (mouseX - 0.5) * 2.4;
      offset += (offTarget - offset) * 0.035;
      var ampTarget = 1 + (mouseY - 0.5) * 0.55;
      ampScale += (ampTarget - ampScale) * 0.035;
      phase += 0.018;

      var baseY = H * 0.56 + (mouseY - 0.5) * H * 0.05;
      var amp = Math.min(W, H) * 0.043 * ampScale;
      var span = W * 0.84;
      var startX = W * 0.08;
      var waveLen = span / (POINTS - 1);

      var pts1 = [], pts2 = [], i, t, x, y1, y2, pr;

      for (i = 0; i < POINTS; i++) {
        t = (i / (POINTS - 1)) * Math.PI * 2 * TURNS - phase + offset;
        x = startX + i * waveLen;
        y1 = baseY + Math.sin(t) * amp;
        y2 = baseY + Math.sin(t + Math.PI) * amp;
        pr = i / (POINTS - 1);
        pts1.push({ x: x, y: y1, p: pr, t: t });
        pts2.push({ x: x, y: y2, p: pr, t: t + Math.PI });
      }

      // 碱基对横档（先画，粒子覆盖其上）
      ctx.lineWidth = 1;
      for (i = 0; i < POINTS; i++) {
        var a = pts1[i], b = pts2[i];
        var depth = Math.abs(Math.sin(a.t));
        var alpha = 0.10 + 0.28 * depth;
        ctx.strokeStyle = 'rgba(96, 165, 250, ' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      drawChain(pts1, 217);
      drawChain(pts2, 199);
    }

    function drawChain(pts, hue) {
      var i, p, depth, grow, alpha, r;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        depth = 0.5 + 0.5 * Math.sin(p.t);              // 前后深度
        grow = Math.sin(p.p * Math.PI);                  // 端部淡出
        alpha = (0.3 + 0.62 * grow) * (0.65 + 0.35 * depth);
        r = 1.1 + 2.3 * grow * (0.7 + 0.3 * depth);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + hue + ', 92%, 63%, ' + alpha.toFixed(3) + ')';
        ctx.fill();
        if (r > 2.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 0.42, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.55).toFixed(3) + ')';
          ctx.fill();
        }
      }
    }

    function loop() {
      if (!running) { rafId = null; return; }
      draw();
      rafId = requestAnimationFrame(loop);
    }

    function onMove(e) {
      var rect = hero.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    }

    function onLeave() { mouseX = 0.5; mouseY = 0.5; }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var heroH = hero.offsetHeight;
        var p = Math.min(1, Math.max(0, window.scrollY / heroH));
        heroInner.style.opacity = String(Math.max(0, 1 - p * 1.2));
        heroInner.style.transform = 'translateY(' + Math.round(p * 70) + 'px)';
        canvas.style.transform = 'translateY(' + Math.round(p * 130) + 'px)';
        ticking = false;
      });
    }

    function onVisibility() {
      if (document.hidden) {
        running = false;
      } else if (!rafId) {
        running = true;
        loop();
      }
    }

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    onScroll();

    // 尊重系统"减少动态效果"偏好
    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      draw();
    } else {
      loop();
    }
  }

  initDna();
})();
