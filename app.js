/* 지질시대 감식연구소 — 앱 로직 (해시 라우팅, 정적) */
(function () {
  'use strict';
  var D = window.LAB_DATA;
  var app = document.getElementById('app');
  var KEY = 'gtfl_progress_v2';

  /* ── 유틸 ─────────────────────────────── */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function h(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; }
  function loadP() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function saveP(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function now() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function findCase(id) { for (var i = 0; i < D.cases.length; i++) if (D.cases[i].id === id) return D.cases[i]; return null; }
  function findEv(c, id) { for (var i = 0; i < c.evidence.length; i++) if (c.evidence[i].id === id) return c.evidence[i]; return null; }
  function baseUrl() { return location.href.split('#')[0]; }

  function barcode(seed, w, hgt) {
    w = w || 120; hgt = hgt || 22; var s = seed * 9301 + 49297; var x = 0, out = '';
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    while (x < w) { var bw = [1, 1, 1.5, 2, 3][Math.floor(rnd() * 5)]; out += '<rect x="' + x + '" y="0" width="' + bw + '" height="' + hgt + '" fill="#111"/>'; x += bw + [1, 1.5, 2][Math.floor(rnd() * 3)]; }
    return '<svg viewBox="0 0 ' + w + ' ' + hgt + '" preserveAspectRatio="none" style="width:' + w + 'px;height:' + hgt + 'px">' + out + '</svg>';
  }
  function seedOf(str) { var s = 0; for (var i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) % 100000; return s; }

  /* ── 시스템 바 시계 ───────────────────── */
  var clock = document.getElementById('sysclock');
  function tick() { if (clock) clock.textContent = now(); }
  tick(); setInterval(tick, 1000);
  var sid = document.getElementById('sysid');
  if (sid) { var s = ''; for (var i = 0; i < 6; i++) s += '0123456789ABCDEF'[Math.floor(Math.random() * 16)]; sid.textContent = s; }

  /* ── 라우터 ───────────────────────────── */
  function route() {
    var hash = location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
    var parts = hash.split('/');
    window.scrollTo(0, 0);
    if (!hash) return renderHome();
    var c = findCase(parts[0]);
    if (c && parts[1]) { var ev = findEv(c, parts[1]); if (ev) return renderEvidence(c, ev); }
    if (c) return renderHome(c.id);
    renderNotFound();
  }
  window.addEventListener('hashchange', route);

  /* ── 공통 헤더 ────────────────────────── */
  function labHead(c) {
    var badge = c ? '<div class="casebadge">CASE ' + c.no + '<small>' + esc(c.name) + '</small></div>' : '<div class="casebadge">LAB<small>접수 시스템</small></div>';
    return '<header class="lab-head"><div class="in"><a href="#/" style="text-decoration:none"><div class="lab-name">' + esc(D.lab.name) + '<small>' + esc(D.lab.en) + '</small></div></a>' + badge + '</div></header>';
  }
  function footNav(extra) {
    return '<div class="foot"><span>' + esc(D.lab.en) + ' · CLASSIFICATION: RESTRICTED</span><span>' + (extra || '') + '<a href="#/">접수 시스템 메인</a></span>' + (D.lab.copyright ? '<span class="copy">' + esc(D.lab.copyright) + '</span>' : '') + '</div>';
  }

  /* ── 메인(접수) 페이지 ────────────────── */
  function renderHome(focus) {
    var p = loadP();
    var html = labHead(null) + '<main class="wrap">';
    html += '<div class="hero"><h1>시료 접수 시스템<small>SAMPLE INTAKE · ANALYSIS REQUEST TERMINAL</small></h1><p>현장 조사 보고서 뒷면의 QR을 찍으면 그 증거의 감식 결과 페이지가 열립니다. QR이 안 되면 아래에 <b>분석 코드</b>를 입력하세요.</p></div>';
    html += '<section class="panel">' + ph('Code', '분석 코드 입력', 'ANALYSIS CODE') + '<div class="pb"><form class="codeform" id="codeform"><input id="codein" placeholder="예: CASE03-E01" autocomplete="off" spellcheck="false"><button class="btn small" type="submit">접수 확인</button></form><div id="codemsg" class="attempts" style="margin-top:8px"></div></div></section>';
    D.cases.forEach(function (c, ci) {
      html += '<section class="panel" id="' + c.id + '">' + ph('Case ' + c.no, esc(c.name), esc(c.en)) + '<div class="pb">';
      html += '<div class="casehead"><span class="cn">CASE ' + c.no + '</span><span class="nm">' + esc(c.name) + '</span><span class="pd">' + esc(c.period) + '<br>' + esc(c.age) + '</span></div>';
      html += '<div class="caselist">';
      c.evidence.forEach(function (ev) {
        var done = p[ev.code] && p[ev.code].done;
        var st = done ? '<span class="st done">확인 완료</span>' : '<span class="st">확인 전</span>';
        html += '<a class="evrow" href="#/' + c.id + '/' + ev.id + '"><span class="no">E-' + ev.id.slice(1) + '</span><span class="t">' + esc(ev.title) + '<small>' + esc(ev.code) + ' · SAMPLE ' + esc(ev.sample) + '</small></span>' + st + '</a>';
      });
      html += '</div></div></section>';
    });
    html += footNav('');
    html += '</main>';
    app.innerHTML = html;
    var form = document.getElementById('codeform');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = document.getElementById('codein').value.trim().toUpperCase().replace(/\s+/g, '');
      var m = v.match(/^CASE(\d{2})-?E(\d{2})$/);
      var msg = document.getElementById('codemsg');
      if (m) {
        var c = findCase('case' + m[1]); var ev = c && findEv(c, 'e' + m[2]);
        if (ev) { location.hash = '#/' + c.id + '/' + ev.id; return; }
      }
      msg.innerHTML = '<span class="red">ERROR · 등록되지 않은 분석 코드입니다. 현장 조사 보고서 뒷면의 코드를 확인하세요.</span>';
    });
    if (focus) { var el = document.getElementById(focus); if (el) el.scrollIntoView(); }
  }

  function renderNotFound() {
    app.innerHTML = labHead(null) + '<main class="wrap"><section class="panel">' + ph('Error', '접수 오류', 'NOT FOUND') + '<div class="pb"><p>해당 주소의 증거 기록이 없습니다.</p><a class="btn small" href="#/" style="text-decoration:none;display:inline-block">Main</a></div></section>' + footNav('') + '</main>';
  }

  /* ── 증거 분석 페이지 ─────────────────── */
  function ph(en, ko, right) { return '<div class="ph"><span class="idx"></span>' + en + '<span class="ko">' + ko + '</span><span class="en">' + (right || '') + '</span></div>'; }
  function rulerSvg(side) {
    var s = '<svg viewBox="0 0 26 200" preserveAspectRatio="none">';
    for (var i = 0; i <= 40; i++) { var y = 4 + i * 4.8; var big = i % 10 === 0, mid = i % 5 === 0; var x1 = side === 'r' ? 26 : 0; var x2 = side === 'r' ? 26 - (big ? 12 : mid ? 8 : 4) : (big ? 12 : mid ? 8 : 4);
      s += '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="#6d8578" stroke-width="' + (big ? 1 : .6) + '"/>';
      if (big && side !== 'r') s += '<text x="14" y="' + (y + 3) + '" font-size="7" fill="#6d8578" font-family="IBM Plex Mono, monospace">' + (i / 10 * 10) + '</text>'; }
    return s + '</svg>';
  }

  function renderEvidence(c, ev) {
    var p = loadP(); var st = p[ev.code] || { done: false };
    var evNo = 'E-' + ev.id.slice(1);
    var html = labHead(c) + '<main class="wrap">';
    html += '<div class="topstrip"><div class="cs">Case ' + c.no + '</div><div class="bc">' + barcode(seedOf(ev.code), 150, 26).replace('style="width:150px;height:26px"', '') + '</div><div class="evtag">Evidence ' + evNo + '</div></div>';
    html += '<div class="evtitle"><div class="no">' + evNo + '</div><div class="t">' + esc(ev.title) + '<small>' + esc(ev.en) + '</small></div></div>';

    // 01 시료 접수
    html += '<section class="panel done">' + ph('Intake', '시료 접수 완료', 'NO. ' + esc(ev.sample));
    html += '<table class="kv"><tr><th>REQUEST</th><td><b>' + esc(ev.request) + '</b></td></tr><tr><th>SAMPLE</th><td>' + esc(ev.sample) + ' · ' + esc(ev.material) + '<span class="tag fill">' + esc(ev.code) + '</span></td></tr><tr><th>METHOD</th><td><b>' + esc(ev.methodName) + '</b><br><span class="muted" style="font-size:12.5px">' + esc(ev.methodNote) + '</span></td></tr><tr><th>STATUS</th><td id="stcell">' + (st.done ? '<span class="tag green">ANALYSIS COMPLETE · 감식 완료</span>' : '<span class="tag">RECEIVED · 분석 중</span>') + '</td></tr></table>';
    html += '</section>';

    // 02 결과 — 처음 열 때만 짧은 분석 연출, 그 뒤에는 바로 표시
    html += '<div id="results">' + (st.done ? resultSections(c, ev) : '<section class="panel"><div class="pb" id="procbox"></div></section>') + '</div>';

    html += footNav('<a href="#/' + c.id + '" style="margin-right:12px">CASE ' + c.no + ' 증거 목록</a>');
    html += '</main>';
    app.innerHTML = html;

    if (st.done) { drawVisual(ev, false); return; }
    runAnalysis(document.getElementById('procbox'), ev, function () {
      st.done = true; p[ev.code] = st; saveP(p);
      var box = document.getElementById('results'); box.innerHTML = resultSections(c, ev); box.classList.add('reveal');
      document.getElementById('stcell').innerHTML = '<span class="tag green">ANALYSIS COMPLETE · 감식 완료</span>';
      drawVisual(ev, true);
    });
  }

  // 감식 결과·추론 영역
  function resultSections(c, ev) {
    var html = '<section class="panel" id="result">' + ph('Lab analysis', '감식 결과', 'FORENSIC RESULT') + '<div class="pb">';
    html += '<div class="okcircle"><div class="c"></div><div class="t">Result · Verified<small>분석 방법 : ' + esc(ev.methodName) + '</small></div></div>';
    html += '<div class="keybox"><div class="kl">핵심 감식 결과 <span class="mono">KEY FINDING</span></div><div class="kt">' + esc(ev.key) + '</div><div class="kc">→ 최종보고서 「01 감식 기록」에 기록하세요.</div></div>';
    if (ev.more && ev.more.length) html += '<div class="morelab">함께 확인된 것</div><ul class="res-list">' + ev.more.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>';
    if (ev.link) html += '<div class="linkbox"><div class="lk">추론 연결고리 <span class="mono">LINK</span></div><div class="lt">' + esc(ev.link) + '</div></div>';
    html += '<div class="fig" id="fig"><div class="ft">Analysis data · 감식 데이터</div><div class="scan"></div><div class="hint">◀ ▶ 그림을 옆으로 밀어 전체를 확인하세요</div><div class="sv" id="figsvg"></div><div class="fc" id="figcap"></div></div>';
    html += '</div></section>';
    html += '<section class="panel" id="infer">' + ph('Inference', '추론 질문', 'INFERENCE · ONE QUESTION') + '<div class="pb">' + ev.inference.map(function (q, i) { return '<div class="qbox"><div class="ql">추론 질문 <span class="mono">Q' + (i + 1) + '</span></div><div class="qt">' + esc(q) + '</div></div>'; }).join('') + '<div class="note">감식 결과를 바탕으로 위 질문에 답하고, 최종보고서 「02 증거별 추론」에 한 문장으로 기록하세요. 세 증거를 모두 마치면 수사국(교탁)에 감식 완료를 보고합니다.</div></div></section>';
    return html;
  }

  function runAnalysis(fb, ev, done) {
    var steps = ['시료 접수 확인 · ' + ev.sample, '시료 준비', '측정 중 · ' + ev.methodName + '…', '결과 확인', '감식 보고서 만들기'];
    fb.innerHTML = '<div class="proc"><div class="field-tag">ANALYSIS IN PROGRESS · 분석 중</div><ul class="steps">' + steps.map(function (s) { return '<li>' + esc(s) + '<span class="ms"></span></li>'; }).join('') + '</ul><div class="bar"><i id="pbar"></i></div></div>';
    var lis = fb.querySelectorAll('.steps li'); var bar = document.getElementById('pbar'); var i = 0; var t0 = Date.now();
    function next() {
      if (i > 0) { lis[i - 1].classList.remove('run'); lis[i - 1].classList.add('ok'); lis[i - 1].querySelector('.ms').textContent = (Date.now() - t0) + ' ms'; }
      if (i >= lis.length) { bar.style.width = '100%'; setTimeout(done, 250); return; }
      lis[i].classList.add('run'); bar.style.width = Math.round(((i + 1) / lis.length) * 100) + '%'; i++;
      setTimeout(next, 300 + Math.random() * 200);
    }
    next();
  }


  /* ── 시료 모식도 (뷰포트) ─────────────── */
  var G = '#3df08a', GD = '#178a4a', GF = 'rgba(61,240,138,.07)', GF2 = 'rgba(61,240,138,.16)';
  function specWrap(inner) {
    return '<svg class="spec" viewBox="0 0 400 230" preserveAspectRatio="xMidYMid meet"><defs><filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#gl)" stroke="' + G + '" stroke-width="1.2" fill="none" stroke-linejoin="round" stroke-linecap="round">' + inner + '</g></svg>';
  }
  function seeded(seed) { var s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  var SPEC = {
    c03e01: function () { // 겹겹이 쌓인 현무암층 + 주상절리
      var s = ''; var r = seeded(11);
      for (var L = 0; L < 6; L++) { var y0 = 40 + L * 26; var pts = ''; for (var x = 70; x <= 330; x += 20) pts += (x === 70 ? 'M' : 'L') + x + ',' + (y0 + (r() * 6 - 3)).toFixed(1) + ' ';
        s += '<path d="' + pts + 'L330,' + (y0 + 26) + ' L70,' + (y0 + 26) + ' Z" fill="' + (L % 2 ? GF : GF2) + '"/>';
        for (var cx = 82; cx < 330; cx += 14 + r() * 8) s += '<line x1="' + cx.toFixed(0) + '" y1="' + (y0 + 3) + '" x2="' + (cx + 2).toFixed(0) + '" y2="' + (y0 + 23) + '" stroke="' + GD + '" stroke-width=".8"/>'; }
      s += '<text x="200" y="215" text-anchor="middle" font-size="9" fill="' + GD + '" stroke="none" font-family="IBM Plex Mono, monospace" letter-spacing="2">FLOOD BASALT · STACKED FLOWS</text>';
      return specWrap(s);
    },
    c03e02: function () { // 경계를 가로지르는 연속 석회암층
      var s = ''; var r = seeded(23);
      for (var L = 0; L < 12; L++) { var y = 30 + L * 14; var d = 'M60,' + y + ' '; for (var x = 80; x <= 340; x += 20) d += 'L' + x + ',' + (y + r() * 3 - 1.5).toFixed(1) + ' '; s += '<path d="' + d + '" stroke="' + (L === 6 ? G : GD) + '" stroke-width="' + (L === 6 ? 2 : 1) + '"/>'; }
      s += '<rect x="60" y="106" width="280" height="14" fill="' + GF2 + '" stroke="none"/>';
      s += '<text x="348" y="117" font-size="9" fill="' + G + '" stroke="none" font-family="IBM Plex Mono, monospace">P–T</text>';
      s += '<text x="200" y="215" text-anchor="middle" font-size="9" fill="' + GD + '" stroke="none" font-family="IBM Plex Mono, monospace" letter-spacing="2">CONTINUOUS LIMESTONE SECTION</text>';
      return specWrap(s);
    },
    c03e03: function () { // 검은 세립질 퇴적암 + 미세 황철석
      var s = '<path d="M70,60 L330,50 L340,170 L60,180 Z" fill="rgba(61,240,138,.06)"/>'; var r = seeded(37);
      for (var L = 0; L < 9; L++) { var y = 70 + L * 12; s += '<line x1="72" y1="' + y + '" x2="330" y2="' + (y - 2) + '" stroke="' + GD + '" stroke-width=".7" stroke-dasharray="3 5"/>'; }
      for (var i = 0; i < 70; i++) { var cx = 80 + r() * 245, cy = 62 + r() * 110, rad = .8 + r() * 2.2; s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + rad.toFixed(1) + '" fill="' + G + '" stroke="none"/>'; }
      s += '<circle cx="290" cy="90" r="30" stroke="' + G + '" stroke-dasharray="2 3"/><text x="290" y="132" text-anchor="middle" font-size="8" fill="' + G + '" stroke="none" font-family="IBM Plex Mono, monospace">PYRITE ×400</text>';
      s += '<text x="200" y="215" text-anchor="middle" font-size="9" fill="' + GD + '" stroke="none" font-family="IBM Plex Mono, monospace" letter-spacing="2">BLACK SHALE · FRAMBOIDAL PYRITE</text>';
      return specWrap(s);
    },
    c03e04: function () { // 코노돈트 원소
      var s = '';
      function cono(x, y, sc, n) { var d = 'M' + x + ',' + y + ' '; for (var i = 0; i < n; i++) { var bx = x + i * 14 * sc; d += 'L' + (bx + 4 * sc) + ',' + (y - (18 + (i === Math.floor(n / 2) ? 22 : 0) + Math.sin(i) * 6) * sc) + ' L' + (bx + 14 * sc) + ',' + y + ' '; } d += 'Q' + (x + n * 14 * sc + 10 * sc) + ',' + (y + 14 * sc) + ' ' + x + ',' + (y + 16 * sc) + ' Z'; return '<path d="' + d + '" fill="' + GF2 + '"/>'; }
      s += cono(90, 120, 1.6, 8) + cono(250, 175, .8, 7) + cono(262, 70, .7, 6);
      s += '<text x="200" y="215" text-anchor="middle" font-size="9" fill="' + GD + '" stroke="none" font-family="IBM Plex Mono, monospace" letter-spacing="2">CONODONT ELEMENTS · PHOSPHATE</text>';
      return specWrap(s);
    },
    c05e01: function () { // 얇은 경계 점토층
      var s = ''; var r = seeded(51);
      for (var L = 0; L < 5; L++) { var y = 30 + L * 30; s += '<rect x="70" y="' + y + '" width="260" height="30" fill="' + (L % 2 ? GF : 'rgba(61,240,138,.05)') + '" stroke="' + GD + '"/>'; for (var k = 0; k < 6; k++) s += '<line x1="' + (80 + k * 42) + '" y1="' + (y + 8 + r() * 14) + '" x2="' + (100 + k * 42) + '" y2="' + (y + 8 + r() * 14) + '" stroke="' + GD + '" stroke-width=".6"/>'; }
      s += '<rect x="70" y="118" width="260" height="6" fill="' + G + '" stroke="none"/>';
      s += '<line x1="330" y1="121" x2="352" y2="121" stroke="' + G + '"/><text x="356" y="124" font-size="8" fill="' + G + '" stroke="none" font-family="IBM Plex Mono, monospace">CLAY</text>';
      s += '<text x="200" y="215" text-anchor="middle" font-size="9" fill="' + GD + '" stroke="none" font-family="IBM Plex Mono, monospace" letter-spacing="2">K–Pg BOUNDARY SECTION</text>';
      return specWrap(s);
    },
    c05e02: function () { // 충격 석영 + 유리 소구체
      var s = '<polygon points="120,60 190,45 245,80 240,150 175,175 110,140" fill="' + GF + '"/>';
      for (var k = -5; k <= 5; k++) s += '<line x1="' + (120 + k * 11) + '" y1="52" x2="' + (170 + k * 11) + '" y2="176" stroke="' + G + '" stroke-width=".8" clip-path="url(#qz)"/>';
      for (var j = -4; j <= 4; j++) s += '<line x1="112" y1="' + (100 + j * 14) + '" x2="248" y2="' + (70 + j * 14) + '" stroke="' + GD + '" stroke-width=".8"/>';
      s = '<defs><clipPath id="qz"><polygon points="120,60 190,45 245,80 240,150 175,175 110,140"/></clipPath></defs>' + s;
      var r = seeded(77); for (var i = 0; i < 9; i++) { var cx = 275 + r() * 70, cy = 60 + r() * 120, rad = 4 + r() * 8; s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + rad.toFixed(1) + '" fill="' + GF2 + '"/>'; }
      s += '<text x="178" y="200" text-anchor="middle" font-size="8" fill="' + G + '" stroke="none" font-family="IBM Plex Mono, monospace">SHOCKED QUARTZ</text><text x="312" y="200" text-anchor="middle" font-size="8" fill="' + G + '" stroke="none" font-family="IBM Plex Mono, monospace">SPHERULES</text>';
      s += '<text x="200" y="218" text-anchor="middle" font-size="9" fill="' + GD + '" stroke="none" font-family="IBM Plex Mono, monospace" letter-spacing="2">BOUNDARY EJECTA · ×120</text>';
      return specWrap(s);
    },
    c05e03: function () { // 화분·포자 미화석
      var s = ''; var r = seeded(91);
      for (var i = 0; i < 14; i++) { var cx = 70 + r() * 260, cy = 40 + r() * 140, rad = 7 + r() * 9; var kind = i % 3;
        if (kind === 0) { s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + rad.toFixed(1) + '" fill="' + GF + '"/>'; for (var k = 0; k < 10; k++) { var ang = k / 10 * Math.PI * 2; s += '<line x1="' + (cx + Math.cos(ang) * rad).toFixed(1) + '" y1="' + (cy + Math.sin(ang) * rad).toFixed(1) + '" x2="' + (cx + Math.cos(ang) * (rad + 4)).toFixed(1) + '" y2="' + (cy + Math.sin(ang) * (rad + 4)).toFixed(1) + '" stroke-width=".8"/>'; } }
        else if (kind === 1) { s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + rad.toFixed(1) + '" fill="' + GF2 + '"/>'; for (var m = 0; m < 3; m++) { var an = m / 3 * Math.PI * 2 - Math.PI / 2; s += '<line x1="' + cx.toFixed(1) + '" y1="' + cy.toFixed(1) + '" x2="' + (cx + Math.cos(an) * rad * .8).toFixed(1) + '" y2="' + (cy + Math.sin(an) * rad * .8).toFixed(1) + '"/>'; } }
        else { s += '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" rx="' + (rad * 1.3).toFixed(1) + '" ry="' + (rad * .7).toFixed(1) + '" fill="' + GF + '" stroke="' + GD + '"/>'; } }
      s += '<text x="200" y="215" text-anchor="middle" font-size="9" fill="' + GD + '" stroke="none" font-family="IBM Plex Mono, monospace" letter-spacing="2">POLLEN · SPORES · PLANKTON ×200</text>';
      return specWrap(s);
    },
    c05e04: function () { // 원형 중력 이상
      var s = ''; var cx = 200, cy = 112;
      for (var k = 1; k <= 6; k++) s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (k * 15) + '" stroke="' + (k % 2 ? G : GD) + '" stroke-width="' + (k === 6 ? 1.6 : .9) + '" stroke-dasharray="' + (k % 2 ? '0' : '4 4') + '"/>';
      for (var t = 0; t < 24; t++) { var an = t / 24 * Math.PI * 2; s += '<line x1="' + (cx + Math.cos(an) * 92).toFixed(1) + '" y1="' + (cy + Math.sin(an) * 92).toFixed(1) + '" x2="' + (cx + Math.cos(an) * 98).toFixed(1) + '" y2="' + (cy + Math.sin(an) * 98).toFixed(1) + '" stroke="' + GD + '"/>'; }
      s += '<path d="M40,200 Q120,150 200,180 Q290,205 360,170" stroke="' + GD + '" stroke-dasharray="3 3"/>';
      s += '<text x="200" y="218" text-anchor="middle" font-size="9" fill="' + GD + '" stroke="none" font-family="IBM Plex Mono, monospace" letter-spacing="2">GRAVITY ANOMALY · YUCATÁN</text>';
      return specWrap(s);
    }
  };

  /* ── 시각 자료 (SVG) ──────────────────── */
  var INK = '#3df08a', RED = '#ff4d4d', GREY = '#5f8a70', SOFT = '#1a2c22', TXT = '#d9e6de', TXT2 = '#8fa798', DARK = '#07120c', BG = '#070b09';
  function drawVisual(ev, animate) {
    var box = document.getElementById('figsvg'); var cap = document.getElementById('figcap'); if (!box) return;
    var v = VIS[ev.visual] ? VIS[ev.visual]() : { svg: '', cap: '' };
    box.innerHTML = v.svg; cap.innerHTML = esc(v.cap) + (v.src ? '<div class="src">' + esc(v.src) + '</div>' : '');
    if (animate) { var f = document.getElementById('fig'); f.classList.add('scanning'); setTimeout(function () { f.classList.remove('scanning'); }, 1700); }
  }
  function axisText(x, y, t, anchor, size, color) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" font-size="' + (size || 10) + '" fill="' + (color || TXT2) + '" font-family="IBM Plex Mono, Liberation Mono, monospace">' + t + '</text>'; }
  function label(x, y, t, anchor, size, color, weight) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'start') + '" font-size="' + (size || 11) + '" fill="' + (color || TXT) + '" font-weight="' + (weight || 600) + '" font-family="Noto Sans KR, sans-serif">' + t + '</text>'; }
  var FONT = 'font-family="Noto Sans KR, sans-serif"';

  var VIS = {
    // 시베리아 트랩 연대 vs 대멸종 시기 (Ma)
    c03e01: function () {
      var W = 640, H = 220, L = 60, R = 30, top = 60, bottom = 170;
      var mn = 253.0, mx = 250.5; function X(ma) { return L + (mn - ma) / (mn - mx) * (W - L - R); }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '">';
      s += '<rect width="' + W + '" height="' + H + '" fill="' + BG + '"/>';
      for (var ma = 253; ma >= 250.5; ma -= 0.5) { s += '<line x1="' + X(ma) + '" y1="' + top + '" x2="' + X(ma) + '" y2="' + bottom + '" stroke="' + SOFT + '" stroke-width="1"/>' + axisText(X(ma), bottom + 16, ma.toFixed(1)); }
      s += axisText(W / 2, bottom + 34, '연대 (Ma, 백만 년 전) → 시간 흐름 방향 →', 'middle', 10);
      // 대멸종 시기 밴드
      var e1 = X(252.0), e2 = X(251.85);
      s += '<rect x="' + e1 + '" y="' + top + '" width="' + (e2 - e1) + '" height="' + (bottom - top) + '" fill="' + RED + '" fill-opacity=".22"/>';
      s += '<line x1="' + X(251.94) + '" y1="' + (top - 18) + '" x2="' + X(251.94) + '" y2="' + bottom + '" stroke="' + RED + '" stroke-width="2"/>';
      s += label(X(251.94) + 6, top - 6, '페름기 말 대멸종 (약 251.9 Ma)', 'start', 11, RED, 700);
      // 마그마 활동 막대
      var y1 = 92; s += '<rect x="' + X(252.3) + '" y="' + y1 + '" width="' + (X(251.3) - X(252.3)) + '" height="26" rx="4" fill="' + INK + '"/>';
      s += '<rect x="' + X(251.3) + '" y="' + y1 + '" width="' + (X(250.6) - X(251.3)) + '" height="26" rx="4" fill="' + GREY + '"/>';
      s += label(L, y1 - 8, '시베리아 트랩 화성 활동 (방사성 동위원소 연대 측정 결과)', 'start', 11, TXT, 700);
      s += label(X(252.3) + 6, y1 + 18, '용암 분출', 'start', 10, DARK, 700);
      s += label(X(251.3) + 6, y1 + 18, '관입 활동 계속', 'start', 10, DARK, 600);
      s += label(L, 152, '▶ 대규모 화성 활동이 시작된 직후 대멸종이 일어났고, 활동은 그 이후까지 이어졌다.', 'start', 11, TXT, 600);
      s += '</svg>';
      return { svg: s, cap: '그림. 시베리아 트랩 화성암의 연대와 페름기 말 대멸종 시기의 비교. 대멸종 경계 연대는 중국 메이산 화산재층의 지르콘 연대로 정해졌다.', src: '연구 자료를 바탕으로 재구성 (연대는 반올림) — Burgess, Bowring & Shen (2014) PNAS; Burgess, Muirhead & Bowring (2017) Nature Communications' };
    },
    // 탄소 동위원소비 곡선
    c03e02: function () {
      var W = 640, H = 260, L = 70, R = 30, top = 30, bottom = 215;
      var pts = [[0, 3.2], [1, 3.4], [2, 3.1], [3, 3.3], [4, 3.0], [4.6, 2.4], [5, 1.2], [5.4, -0.2], [5.8, -1.2], [6.2, -1.6], [6.6, -1.0], [7, -0.6], [8, 0.2], [9, 0.6], [10, 1.0]];
      function X(i) { return L + i / 10 * (W - L - R); } function Y(v) { return bottom - (v + 2.5) / 6.5 * (bottom - top); }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '"><rect width="' + W + '" height="' + H + '" fill="' + BG + '"/>';
      for (var v = -2; v <= 4; v += 1) { s += '<line x1="' + L + '" y1="' + Y(v) + '" x2="' + (W - R) + '" y2="' + Y(v) + '" stroke="' + SOFT + '"/>'; } s += axisText(L - 8, Y(3.5) + 4, '높음', 'end') + axisText(L - 8, Y(-1.5) + 4, '낮음', 'end');
      s += axisText(18, (top + bottom) / 2, 'δ¹³C', 'middle', 11, TXT2);
      s += '<rect x="' + X(4.8) + '" y="' + top + '" width="' + (X(6.4) - X(4.8)) + '" height="' + (bottom - top) + '" fill="' + RED + '" fill-opacity=".2"/>';
      s += '<line x1="' + X(5.5) + '" y1="' + top + '" x2="' + X(5.5) + '" y2="' + bottom + '" stroke="' + RED + '" stroke-width="2" stroke-dasharray="6 4"/>';
      s += label(X(5.5) + 6, top + 14, '대멸종 경계', 'start', 11, RED, 700);
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ');
      s += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>';
      s += '<circle cx="' + X(6.2) + '" cy="' + Y(-1.6) + '" r="5" fill="' + RED + '" stroke="' + BG + '" stroke-width="2"/>';
      s += label(X(6.2) + 10, Y(-1.6) + 4, '급격한 감소', 'start', 11, RED, 700);
      s += axisText(L, bottom + 16, '◀ 대멸종 이전 (아래 지층)', 'start', 10); s += axisText(W - R, bottom + 16, '대멸종 이후 (위 지층) ▶', 'end', 10);
      s += axisText(W / 2, bottom + 34, '지층 순서 (아래 → 위 = 과거 → 이후)', 'middle', 10);
      s += '</svg>';
      return { svg: s, cap: '그림. 대멸종 경계 전후 석회암층의 탄소 동위원소비(δ¹³C) 변화. 값이 낮아질수록 탄소-12 비율이 높은 가벼운 탄소가 많이 공급되었음을 뜻한다.' };
    },
    // 바닷속 산소 상태 — 감식 항목별 비교표
    c03e03: function () {
      var W = 640, H = 250, x0 = 30, c1 = 240, c2 = 440, cw = 180, top = 36, rowH = 42;
      var rows = [['프람보이드 황철석', '드묾', '매우 많음 · 크기 작음'], ['지시 원소 (몰리브데넘 등)', '적음', '많이 쌓임'], ['생흔 화석 (바닥 생물의 흔적)', '많음', '거의 없음']];
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '"><rect width="' + W + '" height="' + H + '" fill="' + BG + '"/>';
      s += label(x0, top - 10, '감식 항목', 'start', 11, TXT2, 700);
      s += label(c1 + cw / 2, top - 10, '대멸종 이전', 'middle', 11, TXT, 700);
      s += label(c2 + cw / 2, top - 10, '대멸종 경계 ~ 직후', 'middle', 11, RED, 700);
      s += '<line x1="' + x0 + '" y1="' + (top - 2) + '" x2="' + (c2 + cw) + '" y2="' + (top - 2) + '" stroke="' + GREY + '"/>';
      rows.forEach(function (r, i) {
        var y = top + i * rowH;
        s += label(x0, y + 26, r[0], 'start', 12, TXT, 600);
        s += '<rect x="' + c1 + '" y="' + (y + 8) + '" width="' + cw + '" height="28" rx="3" fill="#0d1a13" stroke="' + GREY + '"/>' + label(c1 + cw / 2, y + 26, r[1], 'middle', 12, TXT, 500);
        s += '<rect x="' + c2 + '" y="' + (y + 8) + '" width="' + cw + '" height="28" rx="3" fill="rgba(255,77,77,.14)" stroke="' + RED + '"/>' + label(c2 + cw / 2, y + 26, r[2], 'middle', 12, RED, 700);
        s += '<line x1="' + x0 + '" y1="' + (y + rowH) + '" x2="' + (c2 + cw) + '" y2="' + (y + rowH) + '" stroke="' + SOFT + '" stroke-dasharray="4 4"/>';
      });
      var vy = top + rows.length * rowH;
      s += label(x0, vy + 26, '▶ 바닷속 산소 상태', 'start', 12, TXT, 700);
      s += '<rect x="' + c1 + '" y="' + (vy + 8) + '" width="' + cw + '" height="28" rx="3" fill="#0d1a13" stroke="' + INK + '"/>' + label(c1 + cw / 2, vy + 26, '산소 있음', 'middle', 12, INK, 700);
      s += '<rect x="' + c2 + '" y="' + (vy + 8) + '" width="' + cw + '" height="28" rx="3" fill="' + RED + '"/>' + label(c2 + cw / 2, vy + 26, '무산소', 'middle', 12, DARK, 700);
      s += label(x0, vy + rowH + 24, '확인된 해역: 중국 남부 · 이란 · 그린란드 · 캐나다 서부 · 일본(태평양) — 서로 멀리 떨어진 곳에서 모두 같은 결과', 'start', 11, TXT2, 500);
      s += '</svg>';
      return { svg: s, cap: '그림. 페름기 말 해양 퇴적물의 감식 항목별 비교. 여러 해역에서 같은 시기에 바닷속 산소가 사라졌다.' };
    },
    // 해수 온도 곡선
    c03e04: function () {
      var W = 640, H = 260, L = 70, R = 30, top = 30, bottom = 215;
      var pts = [[0, 25], [1, 25.5], [2, 25], [3, 26], [4, 26.5], [4.8, 28], [5.4, 31], [6, 34], [6.6, 35.5], [7.2, 36], [8, 35], [9, 35.5], [10, 34.5]];
      function X(i) { return L + i / 10 * (W - L - R); } function Y(v) { return bottom - (v - 20) / 20 * (bottom - top); }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '"><rect width="' + W + '" height="' + H + '" fill="' + BG + '"/>';
      for (var v = 20; v <= 40; v += 5) { s += '<line x1="' + L + '" y1="' + Y(v) + '" x2="' + (W - R) + '" y2="' + Y(v) + '" stroke="' + SOFT + '"/>' + axisText(L - 8, Y(v) + 4, v + '°C', 'end'); }
      s += '<line x1="' + X(5.2) + '" y1="' + top + '" x2="' + X(5.2) + '" y2="' + bottom + '" stroke="' + RED + '" stroke-width="2" stroke-dasharray="6 4"/>';
      s += label(X(5.2) + 6, top + 14, '대멸종 경계', 'start', 11, RED, 700);
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ');
      s += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>';
      s += '<circle cx="' + X(2) + '" cy="' + Y(25) + '" r="5" fill="' + INK + '" stroke="' + BG + '" stroke-width="2"/>' + label(X(2), Y(25) + 20, '약 25°C', 'middle', 11, TXT, 700);
      s += '<circle cx="' + X(7.2) + '" cy="' + Y(36) + '" r="5" fill="' + RED + '" stroke="' + BG + '" stroke-width="2"/>' + label(X(7.2), Y(36) - 12, '약 35°C 이상', 'middle', 11, RED, 700);
      s += axisText(L, bottom + 16, '◀ 대멸종 이전', 'start', 10); s += axisText(W - R, bottom + 16, '대멸종 이후 ▶', 'end', 10);
      s += axisText(W / 2, bottom + 34, '지층 순서 (아래 → 위 = 과거 → 이후)', 'middle', 10);
      s += '</svg>';
      return { svg: s, cap: '그림. 코노돈트 산소 동위원소비로 추정한 열대 바다 표층 수온의 변화', src: '연구 자료를 바탕으로 재구성 (값은 반올림) — Sun et al. (2012) Science' };
    },
    // 이리듐 농도 프로파일
    c05e01: function () {
      var W = 640, H = 260, L = 70, R = 30, top = 30, bottom = 215;
      var rows = [[-6, 0.1], [-5, 0.1], [-4, 0.2], [-3, 0.1], [-2, 0.2], [-1, 0.3], [0, 8.5], [1, 1.2], [2, 0.5], [3, 0.2], [4, 0.1], [5, 0.1]];
      var n = rows.length; var bw = (W - L - R) / n - 6;
      function X(i) { return L + i * (W - L - R) / n + 3; } function Y(v) { return bottom - v / 10 * (bottom - top); }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '"><rect width="' + W + '" height="' + H + '" fill="' + BG + '"/>';
      for (var v = 0; v <= 10; v += 2) { s += '<line x1="' + L + '" y1="' + Y(v) + '" x2="' + (W - R) + '" y2="' + Y(v) + '" stroke="' + SOFT + '"/>' + axisText(L - 8, Y(v) + 4, v + ' ppb', 'end'); }
      s += axisText(16, (top + bottom) / 2, 'Ir', 'middle', 11, TXT2);
      rows.forEach(function (r, i) { var isB = r[0] === 0; s += '<rect x="' + X(i) + '" y="' + Y(r[1]) + '" width="' + bw + '" height="' + (bottom - Y(r[1])) + '" rx="3" fill="' + (isB ? RED : INK) + '"/>' + axisText(X(i) + bw / 2, bottom + 14, isB ? '경계' : (r[0] > 0 ? '+' : '') + r[0], 'middle', 10, isB ? RED : TXT2); });
      s += label(X(7), Y(8.5) + 6, '경계 점토층', 'start', 11, RED, 700); s += label(X(7), Y(8.5) + 22, '지각 평균(약 0.1 ppb)의', 'start', 10, RED, 600); s += label(X(7), Y(8.5) + 36, '수십 배 이상 검출', 'start', 10, RED, 600);
      s += axisText(W / 2, bottom + 34, '경계로부터의 지층 위치 (아래 → 위)', 'middle', 10);
      s += '</svg>';
      return { svg: s, cap: '그림. 경계 전후 지층의 이리듐(Ir) 농도. 얇은 경계 점토층에서만 농도가 급격히 높고, 성분 비율은 운석 물질과 유사하다.', src: '연구 자료를 바탕으로 재구성 (값은 반올림) — Alvarez et al. (1980) Science, 이탈리아 구비오' };
    },
    // 충격 물질 두께 vs 거리 + 충격 석영 모식도
    c05e02: function () {
      var W = 640, H = 270, L = 190, R = 30, top = 40, rowH = 30;
      var rows = [['멕시코 (유카탄 부근)', 100, '매우 두꺼움 · 알갱이 큼'], ['아이티 (카리브해)', 60, '두꺼움'], ['미국 서부 내륙', 32, '얇음'], ['이탈리아 · 덴마크', 12, '매우 얇음'], ['뉴질랜드 · 태평양', 6, '극히 얇음 · 알갱이 작음']];
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '"><rect width="' + W + '" height="' + H + '" fill="' + BG + '"/>';
      s += label(L, top - 14, '충격 물질(유리 소구체 등) 퇴적층 두께 — 유카탄에서 멀어질수록', 'start', 11, TXT, 700);
      var maxw = 300;
      rows.forEach(function (r, i) { var y = top + i * rowH; var w = r[1] / 100 * maxw; s += label(L - 10, y + 17, r[0], 'end', 11, TXT, 600); s += '<rect x="' + L + '" y="' + (y + 4) + '" width="' + w + '" height="18" rx="3" fill="' + (i === 0 ? RED : INK) + '"/>'; s += label(L + w + 8, y + 17, r[2], 'start', 11, TXT, 600); });
      s += axisText(L, top + rows.length * rowH + 4, '(막대 길이는 두께의 순서만 나타내는 개념도)', 'start', 9, TXT2);
      // 충격 석영 모식도
      var qx = 470, qy = 190, qr = 44;
      s += '<defs><clipPath id="qclip"><circle cx="' + qx + '" cy="' + qy + '" r="' + (qr - 1) + '"/></clipPath></defs>'; s += '<circle cx="' + qx + '" cy="' + qy + '" r="' + qr + '" fill="#0a120e" stroke="' + INK + '" stroke-width="1.5"/><g clip-path="url(#qclip)">';
      for (var k = -4; k <= 4; k++) { var off = k * 9; s += '<line x1="' + (qx - 34 + off * 0.35) + '" y1="' + (qy - 34 + off) + '" x2="' + (qx + 34 + off * 0.35) + '" y2="' + (qy + 34 + off) + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
      for (var k2 = -3; k2 <= 3; k2++) { var o2 = k2 * 11; s += '<line x1="' + (qx - 34 + o2) + '" y1="' + (qy + 34 - o2 * 0.2) + '" x2="' + (qx + 34 + o2) + '" y2="' + (qy - 34 - o2 * 0.2) + '" stroke="' + RED + '" stroke-width="1"/>'; }
      s += '</g>';
      s += label(qx + qr + 12, qy - 6, '충격 석영 (현미경)', 'start', 11, TXT, 700); s += label(qx + qr + 12, qy + 10, '초고압 충격으로 생긴', 'start', 10, TXT2, 500); s += label(qx + qr + 12, qy + 24, '여러 방향의 미세 줄무늬', 'start', 10, TXT2, 500);
      s += '</svg>';
      return { svg: s, cap: '그림. (왼쪽) 지역별 충격 물질 퇴적층 두께 비교, (오른쪽) 석영에서 확인된 충격 변형 구조의 모식도' };
    },
    // 화석 변화 before/after
    c05e03: function () {
      var W = 640, H = 250, L = 60, R = 30, top = 40, bottom = 200;
      var groups = [['해양 플랑크톤', 100, 12, '급감'], ['꽃가루 (종자식물)', 100, 20, '급감'], ['양치류 포자', 100, 330, '급증']];
      var gw = (W - L - R) / groups.length; var maxv = 350;
      function Y(v) { return bottom - v / maxv * (bottom - top); }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '"><rect width="' + W + '" height="' + H + '" fill="' + BG + '"/>';
      s += '<line x1="' + L + '" y1="' + bottom + '" x2="' + (W - R) + '" y2="' + bottom + '" stroke="' + SOFT + '"/>';
      s += axisText(L - 8, Y(100) + 4, '이전 수준', 'end', 9) + '<line x1="' + L + '" y1="' + Y(100) + '" x2="' + (W - R) + '" y2="' + Y(100) + '" stroke="' + SOFT + '" stroke-dasharray="4 4"/>';
      groups.forEach(function (g, i) {
        var x0 = L + i * gw + gw * 0.2; var bw = gw * 0.25;
        s += '<rect x="' + x0 + '" y="' + Y(g[1]) + '" width="' + bw + '" height="' + (bottom - Y(g[1])) + '" rx="3" fill="' + GREY + '"/>';
        s += '<rect x="' + (x0 + bw + 6) + '" y="' + Y(g[2]) + '" width="' + bw + '" height="' + (bottom - Y(g[2])) + '" rx="3" fill="' + (g[2] > g[1] ? INK : RED) + '"/>';
        s += label(x0 + bw / 2, Y(g[1]) - 6, '이전', 'middle', 10, TXT2, 600);
        s += label(x0 + bw + 6 + bw / 2, Y(g[2]) - 6, '직후 · ' + g[3], 'middle', 10, g[2] > g[1] ? INK : RED, 700);
        s += label(x0 + bw + 3, bottom + 18, g[0], 'middle', 12, TXT, 700);
      });
      s += label(L, bottom + 40, '▶ 해양 플랑크톤과 꽃가루는 급감하고, 양치류 포자의 비율은 일시적으로 크게 증가한다(“양치류 급증”).', 'start', 11, TXT, 600);
      s += '</svg>';
      return { svg: s, cap: '그림. 경계 직전과 직후의 화석 상대량 변화 (막대 높이는 변화의 방향만 나타냄)' };
    },
    // 칙술루브 구조 + 연대 일치
    c05e04: function () {
      var W = 640, H = 290; var cx = 170, cy = 128;
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '"><rect width="' + W + '" height="' + H + '" fill="' + BG + '"/>';
      // 유카탄 반도 모식 해안선
      s += '<path d="M40,250 L40,180 Q60,150 100,140 Q160,120 230,128 Q290,140 300,180 L300,250 Z" fill="#122019" stroke="' + GREY + '" stroke-width="1.5"/>';
      s += label(48, 205, '유카탄반도 (육지)', 'start', 11, TXT2, 600); s += label(48, 96, '멕시코만 (바다)', 'start', 11, TXT2, 500);
      // 중력 이상 동심원
      var rings = [90, 72, 54, 36, 18];
      rings.forEach(function (r, i) { s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + RED + '" stroke-width="' + (i === 0 ? 2.5 : 1.2) + '" stroke-opacity="' + (0.35 + i * 0.15) + '" stroke-dasharray="' + (i === 0 ? '0' : '5 4') + '"/>'; });
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + RED + '"/>';
      s += '<line x1="' + (cx - 90) + '" y1="' + (cy + 108) + '" x2="' + (cx + 90) + '" y2="' + (cy + 108) + '" stroke="' + INK + '" stroke-width="1.2"/>';
      s += '<line x1="' + (cx - 90) + '" y1="' + (cy + 103) + '" x2="' + (cx - 90) + '" y2="' + (cy + 113) + '" stroke="' + INK + '"/><line x1="' + (cx + 90) + '" y1="' + (cy + 103) + '" x2="' + (cx + 90) + '" y2="' + (cy + 113) + '" stroke="' + INK + '"/>';
      s += label(cx, cy + 128, '지름 약 180 km', 'middle', 11, TXT, 700);
      s += label(cx + 100, cy - 60, '원형 중력 이상', 'start', 11, RED, 700); s += label(cx + 100, cy - 45, '(지하에 묻힌 구조)', 'start', 10, TXT2, 500);
      // 연대 비교
      var bx = 360, by = 60, bwid = 250;
      s += label(bx, by - 10, '연대 비교 (Ma)', 'start', 11, TXT, 700);
      function X(ma) { return bx + (66.5 - ma) / 1.0 * bwid; }
      s += '<line x1="' + bx + '" y1="' + (by + 70) + '" x2="' + (bx + bwid) + '" y2="' + (by + 70) + '" stroke="' + INK + '"/>';
      [66.5, 66.0, 65.5].forEach(function (ma) { s += '<line x1="' + X(ma) + '" y1="' + (by + 66) + '" x2="' + X(ma) + '" y2="' + (by + 74) + '" stroke="' + INK + '"/>' + axisText(X(ma), by + 88, ma.toFixed(1), 'middle', 10); });
      s += '<rect x="' + (X(66.09)) + '" y="' + (by + 8) + '" width="' + (X(65.99) - X(66.09)) + '" height="16" rx="3" fill="' + INK + '"/>' + label(X(66.15), by + 20, '충돌 용융암 연대', 'end', 10, TXT, 600);
      s += '<rect x="' + (X(66.09)) + '" y="' + (by + 34) + '" width="' + (X(65.99) - X(66.09)) + '" height="16" rx="3" fill="' + RED + '"/>' + label(X(66.15), by + 46, '대멸종 경계 연대', 'end', 10, RED, 700);
      s += '<line x1="' + X(66.04) + '" y1="' + by + '" x2="' + X(66.04) + '" y2="' + (by + 70) + '" stroke="' + RED + '" stroke-dasharray="3 3"/>';
      s += label(bx, by + 120, '▶ 두 연대가 오차 범위 안에서 일치한다', 'start', 11, TXT, 700); s += label(bx, by + 138, '(약 66.0 Ma).', 'start', 11, TXT, 700);
      s += label(bx, by + 170, '시추 암석: 충격 석영·용융암 확인', 'start', 11, TXT, 600);
      s += '</svg>';
      return { svg: s, cap: '그림. (왼쪽) 유카탄반도 지하의 원형 중력 이상 모식도, (오른쪽) 충돌 관련 암석의 연대와 대멸종 경계 연대의 비교', src: '연구 자료를 바탕으로 재구성 — Hildebrand et al. (1991) Geology; Renne et al. (2013) Science' };
    }
  };

  window.GTFL = { esc: esc, ph: ph, labHead: labHead, footNav: footNav, loadP: loadP, KEY: KEY, baseUrl: baseUrl };

  if (document.body.getAttribute('data-page') !== 'teacher') route();
})();
