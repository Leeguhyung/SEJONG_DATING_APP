# 💌 세종설렘 (Sejong Dating) - Frontend

세종대학교 학생들을 위한 전용 데이팅 및 커뮤니티 애플리케이션의 프론트엔드 저장소입니다.  
React Native와 Expo를 기반으로 구축되었으며, 직관적인 UI/UX와 실시간 통신 기능을 제공합니다.

---

## 🛠 기술 스택 (Tech Stack)

- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Navigation**: Expo Router (File-based Routing)
- **State Management**: React Context API
- **Styling**: React Native StyleSheet (Logic & Style Separation)
- **Animation**: React Native Reanimated, Gesture Handler
- **Network**: Axios
- **Real-time**: Socket.io-client
- **Notifications**: Expo Notifications

---

## 📁 디렉토리 구조 (Directory Structure)

```text
sejong-dating/
├── app/                  # Expo Router 기반 화면 구성 (Screens)
│   ├── (tabs)/           # 메인 탭 네비게이션 (홈, 채팅, 관리자, 설정)
│   ├── chatRoom.tsx      # 1:1 실시간 채팅 화면
│   ├── editProfile.tsx   # 프로필 수정 화면
│   ├── profileSetup.tsx  # 신규 사용자 초기 프로필 설정
│   └── admin...          # 관리자 전용 기능 화면들
├── styles/               # UI 스타일 정의 (로직과 분리)
│   ├── app/              # 각 화면별 스타일 파일 (.styles.ts)
│   └── components/       # 공용 컴포넌트 스타일
├── components/           # 재사용 가능한 공용 UI 컴포넌트
├── context/              # 전역 상태 관리 (UserContext, AlertContext)
├── hooks/                # 커스텀 훅 (useTheme, useColorScheme 등)
├── constants/            # 전역 상수 및 테마 컬러 설정
├── assets/               # 이미지, 아이콘 등 정적 자원
└── scripts/              # 프로젝트 관리 스크립트
```

---

## 🎨 스타일링 컨벤션 (Styling Convention)

본 프로젝트는 코드의 가독성과 유지보수성을 높이기 위해 **비즈니스 로직(TSX)과 스타일 정의(Styles)를 분리**하는 방식을 채택하고 있습니다.

- **원칙**: 모든 `.tsx` 파일에는 스타일을 직접 작성하지 않습니다.
- **구조**: `styles/` 폴더 내에 대응하는 `.styles.ts` 파일을 생성하여 `StyleSheet.create`를 통해 스타일을 정의하고 `export`합니다.
- **예시**: `app/index.tsx`의 스타일은 `styles/app/index.styles.ts`에 위치합니다.

---

## ✨ 주요 기능 (Key Features)

### 1. 사용자 경험 (UX)
- **카드 스와이프**: 틴더 스타일의 인터랙티브한 카드 UI를 통해 유저를 탐색합니다.
- **반투명 디자인**: 프로필 정보가 사진을 가리지 않도록 세련된 오버레이 디자인을 적용했습니다.
- **다크 모드 지원**: 시스템 설정에 따른 라이트/다크 테마 전환을 지원합니다.

### 2. 실시간 기능
- **1:1 채팅**: Socket.io를 통한 끊김 없는 실시간 메시징을 제공합니다.
- **읽음 확인**: 상대방이 메시지를 읽었는지 실시간으로 확인할 수 있습니다.
- **푸시 알림**: 앱을 사용 중이 아니더라도 새로운 메시지 알림을 즉시 수신합니다.

### 3. 관리자 모드 (Admin Only)
- **서비스 대시보드**: 사용자 접속 통계(DAU, WAU, MAU)를 그래프와 숫자로 확인합니다.
- **사용자 관리**: 불량 사용자를 추방하거나 관리자 권한을 부여/회수할 수 있습니다.
- **신고/피드백 대응**: 접수된 신고 및 피드백 내역을 확인하고 즉각 처리합니다.

---

## 🚀 실행 방법 (How to Run)

1. **의존성 설치**:
   ```bash
   npm install
   ```

2. **환경 변수 설정**:
   루트 경로에 `.env` 파일을 생성하고 서버 주소를 입력합니다.
   ```env
   EXPO_PUBLIC_SERVER_URL=http://your-server-ip:3000
   ```

3. **프로젝트 실행**:
   ```bash
   npx expo start
   ```
   - `i` 키를 눌러 iOS 시뮬레이터에서 실행
   - `a` 키를 눌러 Android 에뮬레이터에서 실행
   - Expo Go 앱을 통해 실제 기기에서 QR 코드를 스캔하여 실행

---

*본 프론트엔드는 세종대학교 학생들의 활발한 교류를 위해 설계되었습니다.*
