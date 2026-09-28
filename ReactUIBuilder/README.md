# React UI Builder Offline

회사 내부 React 프로젝트를 외부 전송 없이 로컬에서 분석하는 Windows 데스크톱 프로그램입니다.

## 구현 기능

- React 프로젝트 루트 폴더 선택
- `src/**/*.js`, `src/**/*.jsx` 자동 스캔
- Babel AST 기반 import/export/컴포넌트/JSX 사용 분석
- default export와 named export 구분
- 상대경로, `jsconfig.json`, `tsconfig.json` alias 해석
- 컴포넌트 정의 위치, 사용 파일, 줄 위치, 주요 props 수집
- JSX 부모/자식 컴포넌트 관계 추출
- `pages/RP/PA/RPA047.jsx + RPA047/tabs/*` 구조 자동 인식
- 전체/화면/탭별 컴포넌트 조회
- 파일 수정시간 기반 로컬 증분 캐시
- 일부 파일 파싱 실패 시 전체 스캔 계속 진행
- 분석 결과를 `UIBuilder/output/component-analysis.json`으로 저장
- Electron 외부 네트워크 요청 차단
- 실제 React 컴포넌트 단독 Preview
- 실제 사용 부모 구조를 포함한 Context Preview
- 기존 화면 전체 Preview 및 선택 사용 위치 highlight
- 프로젝트 전역 CSS와 컴포넌트 CSS 로딩
- label/placeholder mock props 편집
- Preview 번들·런타임 오류 원인 표시
- Boundary Rule 기반 UI 부모 자동 포함
- 부모 포함/제외 직접 변경
- 구조 기반 신규 화면 Builder
- 컴포넌트 추가·삭제·순서 변경
- label/placeholder 속성 편집
- 기존 사용 import/props를 재활용한 JSX 생성
- 기본 useState 및 handler/TODO 생성
- 생성 파일을 `UIBuilder/output`에 저장
- 컴포넌트 실제 렌더링 썸네일 카드
- 화면에 보이는 컴포넌트부터 지연 생성하는 썸네일 캐시
- 이미지/목록 보기 전환
- 썸네일 카드에서 Builder로 바로 추가

## 개발 PC 실행

Node.js가 설치된 인터넷 가능한 개발 PC에서 최초 1회:

```bash
npm install
npm run dev
```

실행 후 상단의 **프로젝트 선택**에서 React 프로젝트 루트를 선택하고 **프로젝트 스캔**을 누릅니다.

## Windows portable 생성

```bash
npm install
npm run build:win
```

결과:

```text
release/ReactUIBuilder-1.1.0-portable.exe
```

압축 폴더 방식은 다음 명령을 사용합니다.

```bash
npm run build:win:dir
```

생성된 `release/win-unpacked` 폴더를 회사 PC로 옮기면 설치 없이 실행할 수 있습니다. 실행 PC에서는 Node.js나 인터넷이 필요하지 않습니다.

## 보안 정책

- 자동 업데이트, 원격 API, AI API, Telemetry, Analytics를 사용하지 않습니다.
- 스캔 과정에서 대상 소스코드를 실행하지 않습니다.
- 대상 `vite.config.js`와 npm script를 실행하지 않습니다.
- Electron 세션에서 외부 HTTP/HTTPS/WebSocket 요청을 차단합니다.
- 캐시는 Electron 사용자 데이터 폴더에만 저장합니다.
- 원본 프로젝트는 스캔 시 읽기 전용으로 취급합니다.
- 사용자가 **분석 결과 저장**을 누른 경우에만 대상 프로젝트의 `UIBuilder/output` 아래에 JSON 파일을 생성합니다.

## Preview 제한 사항

컴포넌트가 프로젝트 전용 Provider, 로그인 세션, 초기화된 Store 또는 API 응답을 반드시 요구하면 Preview에 오류가 표시될 수 있습니다. 이 경우 분석과 JSX 생성은 계속 사용할 수 있습니다. Preview는 외부 API 호출을 차단하며, 사용자가 입력한 mock props와 기존 로컬 프로젝트의 의존성만 사용합니다.
