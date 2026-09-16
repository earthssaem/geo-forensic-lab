# 지질시대 감식연구소 (Geologic Time Forensic Laboratory)

「지질시대 대멸종 사건 수사」 수업용 정적 웹앱. 디자인은 종이 자료(흰 바탕·검정·빨강)와 대비되는 감식 장비 화면 콘셉트(검은 바탕·형광 초록·빨간 CASE 태그)입니다. 현장 조사 보고서 뒷면 QR → 해당 증거의 감식 결과 페이지가 바로 열림(짧은 분석 연출 후 핵심 감식 결과·함께 확인된 것·추론 연결고리·시각 자료·추론 질문 표시). 사건당 증거 3개(E-01~E-03). v3(2026-09-15)부터 분석 방법 선택·반려 절차는 없으며, 분석 방법은 결과 페이지에 이름과 한 줄 풀이로만 표시됩니다.

## 파일 구성
```
dist/
  index.html   진입 파일 (해시 라우팅)
  styles.css   스타일
  app.js       라우터·페이지·SVG 시각 자료·교사용 QR
  data.js      사건·증거·감식 결과 문구 (여기만 고치면 내용이 바뀜)
  qrcode.js    QR 생성 라이브러리 (qrcode-generator, MIT)
  teacher.html 교사용 콘솔 (별도 페이지) + teacher.js
```

## 주소 체계
| 주소 | 내용 |
|---|---|
| `/#/` | 시료 접수 시스템 메인 (분석 코드 입력, 증거 목록) |
| `/#/case03/e01` … `/#/case03/e03` | CASE 03 증거 분석 페이지 (QR 연결 대상) |
| `/#/case05/e01` … `/#/case05/e03` | CASE 05 증거 분석 페이지 |
| `/teacher.html` | 교사용 콘솔 (분석 방법·핵심 감식 결과·QR 생성·인쇄) — 학생용 앱(index.html)의 라우터에는 없음. 학생에게 주소를 공개하지 않음 |

분석 코드(`CASE03-E01` 등)를 메인 페이지에 입력해도 같은 페이지로 이동합니다.

## 배포
정적 파일이므로 빌드 과정이 없습니다.

**Vercel**: 새 프로젝트 → 이 저장소 연결 → Root Directory를 `dist`로 지정 (Framework Preset: Other).
**GitHub Pages**: `dist` 폴더 내용을 저장소 루트(또는 `docs/`)에 두고 Pages 설정.

배포 후 `https://배포주소/teacher.html` 을 열면 기본 주소가 자동으로 채워진 QR이 만들어집니다. 「인쇄」로 QR 시트를 출력하거나, QR 이미지를 현장 조사 보고서 뒷면 시안에 넣으세요.

## 진행 기록
한 번 연 증거는 해당 기기의 브라우저(localStorage)에 '확인 완료'로 저장되어 새로고침해도 분석 연출 없이 결과가 바로 표시됩니다. 교사용 페이지의 「이 기기의 진행 기록 초기화」로 지울 수 있습니다. 다른 반에서 같은 태블릿을 쓸 때는 초기화하세요.

## 문구 수정
`data.js`의 각 증거 객체에서 `title`, `observation`(현장 조사 보고서 앞면과 동일), `cardQuestion`, `request`, `methodName`/`methodNote`(분석 방법 이름·한 줄 풀이), `key`(학생이 최종보고서 「01 감식 기록」에 기록하는 핵심 문장), `more`(함께 확인된 것), `link`, `inference`(추론 질문 · 증거마다 1개, 최종보고서 「02 증거별 추론」에 기록) 를 수정하면 됩니다. 시각 자료는 `app.js`의 `VIS` 객체(증거별 함수)에 있습니다.

푸터의 저작권 표시는 `data.js`의 `lab.copyright` 문구를 수정하면 모든 페이지(학생용·교사용·오류 페이지)에 함께 반영됩니다.

## teacher.html
학생용 앱의 라우터에는 없는 별도 페이지입니다. 수업용으로는 `teacher.html`·`teacher.js`를 배포본에서 빼고 교사 컴퓨터에서만 여는 방법을 권합니다(학생 화면의 동작에는 영향 없음).

## 그림 자료의 출처 표기
실제 연구 자료를 바탕으로 그린 그림에는 아래에 「연구 자료를 바탕으로 재구성 — 출처」가 표시됩니다. 수업용 개념도(CASE 03 E-02, CASE 05 E-02)에는 출처 표기가 없습니다. 출처가 있는 그림: CASE 03 E-01(Burgess et al. 2014 PNAS; Burgess et al. 2017 Nat. Commun.), E-03(Sun et al. 2012 Science), CASE 05 E-01(Alvarez et al. 1980 Science), E-03(Hildebrand et al. 1991 Geology; Renne et al. 2013 Science).
