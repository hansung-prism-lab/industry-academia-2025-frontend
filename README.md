# 경청 (Listening) Frontend

<div align="center">
  
https://github.com/user-attachments/assets/ebe4a04f-7149-46b4-8db0-8aa8593c0c8d

</div>

**경청**은 청각 및 음성 장애를 가진 사용자들을 위한 종합적인 음성 보조 모바일 애플리케이션입니다.  
AI 기술을 활용한 음성 진단 및 텍스트 변환 기능을 제공하여 일상생활의 편의성을 향상시킵니다.

## Preview
<img width="4959" height="7016" alt="preview" src="https://github.com/user-attachments/assets/38d82a6f-c280-4f17-a67e-775384586fa2" />

### Members

<table width="50%" align="center">
    <tr>
        <td align="center"><b>FE</b></td>
        <td align="center"><b>BE</b></td>
        <td align="center"><b>Whisper</b></td>
        <td align="center"><b>STT</b></td>
    </tr>
    <tr>
        <td align="center"><img src="https://github.com/user-attachments/assets/b95eea07-c69a-4bbf-9a8f-eccda41c410e" style="width:220px; object-fit:cover;" /></td>
        <td align="center"><img src="https://github.com/user-attachments/assets/b72c8c11-6cd0-4569-aa9c-9caced8f6892" style="width:220px; object-fit:cover;" /></td>
        <td align="center"><img src="https://github.com/user-attachments/assets/b02c39a0-532e-4f40-8943-9f3f197a8ce5" style="width:220px; object-fit:cover;" /></td>
        <td align="center"><img src="https://github.com/user-attachments/assets/74c2f1a2-0cd1-4ed1-8dd1-1a5b44a7e43b" style="width:220px; object-fit:cover;" /></td>
    </tr>
    <tr>
        <td align="center"><b><a href="https://github.com/nyun-nye">윤예진</a></b></td>
        <td align="center"><b><a href="https://github.com/Lee-Han-Jun">이한준</a></b></td>
        <td align="center"><b><a href="https://github.com/hoya04">신정호</a></b></td>
        <td align="center"><b><a href="https://github.com/fhhdjsjs">최준희</a></b></td>
    </tr>
</table>
## Tech Stack

- **React Native 0.81.4** - 크로스 플랫폼 모바일 프레임워크
- **Expo SDK 54** - React Native 개발 플랫폼
- **TypeScript** - 타입 안전성
- **Expo Router** - 파일 기반 라우팅
- **React Navigation** - 네비게이션
- **Expo AV** - 음성 녹음 및 재생
- **Expo File System** - 파일 시스템 접근
- **AsyncStorage** - 로컬 저장소
- **Pretendard** - 커스텀 폰트

## Getting Started

### Prerequisites

- Node.js 18.x 이상
- npm 또는 yarn
- Expo CLI
- iOS Simulator (macOS) 또는 Android Emulator

### Installation

```bash
# 저장소 클론
git clone https://github.com/YOUR_REPO/listening.git
cd listening

# 의존성 설치
npm install
```

### Run

```bash
# 개발 서버 시작
npm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android

# 웹 브라우저에서 실행
npm run web
```

## Project Structure

```
listening/
├── app/                         # 페이지 및 라우팅 (Expo Router)
│   ├── _layout.tsx              # 루트 레이아웃
│   ├── index.tsx                # 시작 페이지 (스플래시)
│   ├── login.tsx                # 로그인 페이지
│   ├── signup.tsx               # 회원가입 페이지
│   ├── main.tsx                 # 메인 메뉴 페이지
│   ├── chat.tsx                 # 음성-텍스트 변환 페이지
│   ├── assistant.tsx            # AI 음성 비서 "경청이" 페이지
│   ├── settings.tsx             # 설정 페이지
│   ├── (analysis)/              # 간이 진단 관련 페이지
│   │   ├── analysis.tsx         # 음성 분석 녹음 페이지
│   │   ├── analysis-result.tsx  # 분석 결과 페이지
│   │   └── diagnosis-result.tsx # 질병별 위험도 결과 페이지
│   └── utils/
│       └── authFetch.ts         # 인증된 API 요청 유틸리티
├── components/                  # 재사용 컴포넌트
│   ├── Button.tsx               # 버튼 컴포넌트
│   ├── Header.tsx               # 헤더 컴포넌트
│   ├── icon.tsx                 # 아이콘 컴포넌트
│   ├── Input.tsx                # 입력 컴포넌트
│   ├── MenuButton.tsx           # 메뉴 버튼 컴포넌트
│   ├── Search.tsx               # 검색/입력 컴포넌트
│   ├── SplashScreen.tsx         # 스플래시 스크린
│   └── Waveform.tsx             # 음성 웨이브폼 컴포넌트
├── lib/                         # 비즈니스 로직
│   ├── chatApi.ts               # 채팅 API
│   └── nativeActions.ts         # 네이티브 액션 (전화, SMS, 웹검색)
├── styles/                      # 스타일 정의
│   └── hooks/
│       ├── _colors.ts           # 색상 정의
│       └── _fonts.ts            # 폰트 정의
├── assets/                      # 에셋
│   ├── fonts/                   # Pretendard 폰트
│   ├── icons/                   # SVG 아이콘
│   └── images/                  # 이미지
├── types/                       # 타입 정의
│   ├── react-native-global-props.d.ts
│   ├── react-native-waveform.d.ts
│   └── svg.d.ts
├── app.json                     # Expo 설정
├── metro.config.js              # Metro 번들러 설정
├── tsconfig.json                # TypeScript 설정
└── package.json                 # 프로젝트 의존성
```

## Key Features

### 1. 간이 진단

- 사용자가 지정된 문장을 읽고 음성을 녹음
- 서버로 음성 파일 전송 및 AI 분석
- 뇌졸중, 뇌부상, 뇌성마비 등 질병별 위험도 표시 (안심/주의/위험)

### 2. AI 음성 비서 "경청이"

- 음성 입력 및 텍스트 입력 병행 지원
- 자연어 처리 기반 대화형 인터페이스
- 액션 실행: 웹 검색, 전화 걸기, SMS 발송
- 스트리밍 효과로 자연스러운 답변 출력 (타자 효과)

### 3. 음성-텍스트 변환

- 실시간 음성 녹음 및 텍스트 변환
- 변환 성공/실패 상태 시각적 표시 (녹색/빨간색 테두리)
- 타임스탬프 및 날짜 표시
- 자동 스크롤 (새 메시지 추가 시)

### 4. JWT 인증 시스템

- 액세스 토큰 자동 주입
- 리프레시 토큰 기반 자동 갱신 (401 에러 시)
- AsyncStorage를 이용한 토큰 관리

### 5. 접근성 (Accessibility)

- 큰 버튼 및 명확한 아이콘
- 고대비 색상
- 직관적인 UI/UX 설계 (고령자 및 장애인 사용자 중심)

## Screens

| 화면        | 설명                                                      |
| ----------- | --------------------------------------------------------- |
| 로그인      | 사용자 로그인                                             |
| 회원가입    | 신규 사용자 등록                                          |
| 메인        | 3가지 핵심 기능으로 분기 (간이 진단, 경청이, 텍스트 변환) |
| 간이 진단   | 음성 녹음 → 분석 → 질병별 위험도 표시                     |
| 경청이      | AI 음성 비서 대화 인터페이스                              |
| 텍스트 변환 | 음성 → 텍스트 실시간 변환                                 |
| 설정        | 사용자 정보 관리                                          |

## Build

### EAS Build (Expo Application Services)

```bash
# 개발 빌드
npx eas build --profile development --platform ios
npx eas build --profile development --platform android

# 프로덕션 빌드
npx eas build --profile production --platform ios
npx eas build --profile production --platform android
```

## Technical Highlights

### 플랫폼별 음성 포맷 처리

- iOS: `.caf` 포맷
- Android: `.m4a` 포맷
- 파일 확장자 기반 동적 MIME 타입 설정

```typescript
const ext = extMatch
  ? extMatch[1].toLowerCase()
  : Platform.OS === "ios"
  ? "caf"
  : "m4a";
const mimeType =
  ext === "m4a" ? "audio/m4a" : ext === "caf" ? "audio/x-caf" : "audio/*";
```

### 녹음 상태 머신

```
idle → recording → stopping → stopped
```

- 상태 전환 중 버튼 비활성화로 중복 호출 방지
- 파일 존재 확인 루프로 안정성 보장

### 메시지 스트리밍 효과

```typescript
async function* streamTextLocal(text: string, cps = 30) {
  let i = 0;
  while (i < text.length) {
    const slice = text.slice(i, i + Math.round(cps / 2));
    yield slice;
    await new Promise((r) => setTimeout(r, 33));
  }
}
```


## Performance

- **음성 분석**: 평균 3초 이내
- **텍스트 변환**: 평균 2초 이내
- **챗봇 응답**: 평균 1초 이내

## License

이 프로젝트는 한성대학교 산학공동연구 프로젝트로 진행되었습니다.
