/* 교사용 콘솔 — 학생용 앱과 분리된 별도 페이지 (teacher.html) */
(function () {
  'use strict';
  var D = window.LAB_DATA; var app = document.getElementById('app');
  var esc = GTFL.esc, ph = GTFL.ph, labHead = GTFL.labHead, footNav = GTFL.footNav, loadP = GTFL.loadP, KEY = GTFL.KEY;
  function baseUrl() { return location.href.split('#')[0].replace(/teacher\.html$/, ''); }
  function renderTeacher() {
    var p = loadP();
    var html = labHead(null) + '<main class="wrap">';
    html += '<div class="hero"><h1>교사용 전체 미리보기<small>TEACHER CONSOLE · ANSWER KEY · QR</small></h1><p>모든 증거의 분석 방법, 감식 결과, 추론 질문과 현장 조사 보고서 뒷면용 QR을 한눈에 확인합니다. 이 페이지 주소는 학생에게 공개하지 않습니다.</p></div>';
    html += '<section class="panel noprint">' + ph('QR', 'QR 주소 설정', 'QR BASE URL') + '<div class="pb"><p style="margin:0 0 8px;font-size:13px">QR은 아래 기본 주소(학생용 index.html) + <span class="mono">#/case03/e01</span> 형식으로 만들어집니다. 배포 주소가 다르면 수정한 뒤 「QR 다시 생성」을 누르세요.</p><div class="tbar"><input id="baseurl" value="' + esc(baseUrl()) + '"><button class="btn small" id="regen">QR 다시 생성</button><button class="btn small ghost" onclick="window.print()">인쇄</button><button class="btn small ghost" id="reset">이 기기의 진행 기록 초기화</button></div>' + (/^file:/.test(location.href) ? '<div class="warn" style="margin-top:10px">현재 파일(file://)로 열려 있어 QR 주소가 실제 배포 주소가 아닙니다. GitHub Pages 또는 Vercel에 배포한 뒤 그 주소로 QR을 생성하세요.</div>' : '') + '</div></section>';
    D.cases.forEach(function (c) {
      html += '<section class="panel">' + ph('Case ' + c.no, esc(c.name), esc(c.en) + ' · ' + esc(c.period)) + '<div class="pb"><div class="tgrid">';
      c.evidence.forEach(function (ev) {
        html += '<div class="tcard"><div class="th"><span class="no">E-' + ev.id.slice(1) + '</span><span class="t">' + esc(ev.title) + '<small>' + esc(ev.code) + ' · SAMPLE ' + esc(ev.sample) + '</small></span>' + (p[ev.code] && p[ev.code].done ? '<span class="tag green">DONE</span>' : '') + '</div>';
        html += '<div class="tb"><div><div class="qr" data-path="#/' + c.id + '/' + ev.id + '"><div class="qrsvg"></div><div class="lbl"></div></div><a class="btn small ghost" style="display:block;text-align:center;margin-top:8px;text-decoration:none" href="' + baseUrl() + '#/' + c.id + '/' + ev.id + '" target="_blank">학생 화면 열기</a></div>';
        html += '<dl><dt>의뢰 항목 (현장 조사 보고서 뒷면)</dt><dd>' + esc(ev.request) + '</dd><dt>분석 방법</dt><dd>' + esc(ev.methodName) + ' — ' + esc(ev.methodNote) + '</dd><dt>핵심 감식 결과 (최종보고서 01에 기록)</dt><dd class="ans">' + esc(ev.key) + '</dd><dt>함께 확인된 것</dt><dd><ul>' + (ev.more || []).map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></dd><dt>추론 연결고리</dt><dd>' + esc(ev.link || '') + '</dd><dt>추론 질문 (최종보고서 02에 기록)</dt><dd><ul>' + ev.inference.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></dd></dl></div></div>';
      });
      html += '</div></div></section>';
    });
    html += footNav('<span style="margin-right:12px">TEACHER CONSOLE · 이 주소는 학생에게 공개하지 않음</span>');
    html += '</main>';
    app.innerHTML = html;
    function gen() {
      var base = document.getElementById('baseurl').value.trim();
      Array.prototype.forEach.call(document.querySelectorAll('.qr'), function (q) {
        var url = base + q.getAttribute('data-path');
        try { var qr = window.qrcode(0, 'M'); qr.addData(url); qr.make(); q.querySelector('.qrsvg').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }
        catch (e) { q.querySelector('.qrsvg').innerHTML = '<div class="warn">QR 생성 실패</div>'; }
        q.querySelector('.lbl').textContent = url;
      });
    }
    gen();
    document.getElementById('regen').addEventListener('click', gen);
    document.getElementById('reset').addEventListener('click', function () { if (confirm('이 기기에 저장된 감식 진행 기록을 모두 지울까요?')) { localStorage.removeItem(KEY); renderTeacher(); } });
  }

  renderTeacher();
})();
