# 지질시대 감식연구소 (Geologic Time Forensic Laboratory)

「지질시대 대멸종 사건 수사」 수업용 정적 웹앱. 디자인은 종이 자료(흰 바탕·검정·빨강)와 대비되는 감식 장비 화면 콘셉트(검은 바탕·형광 초록·빨간 CASE 태그)입니다. 증거 카드 뒷면 QR → 해당 증거의 분석 페이지 → 분석 방법 선택(퀴즈) → 정답 시 감식 결과·시각 자료·추론 질문 해금.

## 파일 구성
```
dist/
  index.html   진입 파일 (해시 라우팅)
  styles.css   스타일
  app.js       라우터·페이지·SVG 시각 자료·교사용 QR
  data.js      사건·증거·퀴즈·감식 결과 문구 (여기만 고치면 내용이 바뀜)
  qrcode.js    QR 생성 라이브러리 (qrcode-generator, MIT)
  teacher.html 교사용 콘솔 (별도 페이지) + teacher.js
```

## 주소 체계
| 주소 | 내용 |
|---|---|
| `/#/` | 시료 접수 시스템 메인 (분석 코드 입력, 증거 목록) |
| `/#/case03/e01` … `/#/case03/e04` | CASE 03 증거 분석 페이지 (QR 연결 대상) |
| `/#/case05/e01` … `/#/case05/e04` | CASE 05 증거 분석 페이지 |
| `/teacher.html` | 교사용 콘솔 (정답·감식 결과·QR 생성·인쇄) — 학생용 앱(index.html)의 라우터에는 없음. 학생에게 주소를 공개하지 않음 |

분석 코드(`CASE03-E01` 등)를 메인 페이지에 입력해도 같은 페이지로 이동합니다.

## 배포
정적 파일이므로 빌드 과정이 없습니다.

**Vercel**: 새 프로젝트 → 이 저장소 연결 → Root Directory를 `dist`로 지정 (Framework Preset: Other).
**GitHub Pages**: `dist` 폴더 내용을 저장소 루트(또는 `docs/`)에 두고 Pages 설정.

배포 후 `https://배포주소/teacher.html` 을 열면 기본 주소가 자동으로 채워진 QR이 만들어집니다. 「인쇄」로 QR 시트를 출력하거나, QR 이미지를 카드 뒷면 시안에 넣으세요.

## 진행 기록
정답을 맞힌 증거는 해당 기기의 브라우저(localStorage)에 저장되어 새로고침해도 해금 상태가 유지됩니다. 교사용 페이지의 「이 기기의 진행 기록 초기화」로 지울 수 있습니다. 다른 반에서 같은 태블릿을 쓸 때는 초기화하세요.

## 문구 수정
`data.js`의 각 증거 객체에서 `title`, `observation`, `request`, `question`, `options`(ok: true 가 정답, reason 은 반려 사유), `result`, `inference` 를 수정하면 됩니다. 시각 자료는 `app.js`의 `VIS` 객체(증거별 함수)에 있습니다.

## 정답 노출에 대하여
정답 전에는 감식 결과·그래프·추론 질문이 HTML에 아예 삽입되지 않습니다(승인 후 생성). 다만 정적 웹앱의 특성상 `data.js` 소스에는 모든 문구가 들어 있으므로, 개발자 도구로 소스를 열어 보면 확인할 수 있습니다. 이를 막으려면 서버(정답 검증 API)가 필요합니다. 수업용으로는 `teacher.html`을 배포본에서 빼고 교사 컴퓨터에서만 여는 방법을 권합니다(그래도 학생 화면의 동작에는 영향 없음).

## 그림 자료의 출처 표기
각 감식 데이터 그림 아래에 「연구 자료를 바탕으로 재구성 — 출처」 또는 「수업용 개념도 — 실제 측정값 아님」이 표시됩니다. 출처가 있는 그림: CASE 03 E-01(Burgess et al. 2014 PNAS; Burgess et al. 2017 Nat. Commun.), E-04(Sun et al. 2012 Science), CASE 05 E-01(Alvarez et al. 1980 Science), E-04(Hildebrand et al. 1991 Geology; Renne et al. 2013 Science).
