# 💻 세종설렘 (Sejong Dating) - Backend

세종대학교 학생들을 위한 전용 데이팅 및 커뮤니티 애플리케이션의 백엔드 서버 저장소입니다.  
Node.js와 Express를 기반으로 하며, 세종대학교 포털 연동 인증 및 실시간 소켓 통신 기능을 제공합니다.

---

## 🛠 기술 스택 (Tech Stack)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Real-time**: Socket.io (실시간 채팅 및 알림)
- **Auth (Scraping)**: Cheerio, Axios, Tough Cookie (세종대 포털 스크래핑 인증)
- **Push Notification**: Expo Server SDK
- **Environment**: Dotenv

---

## 📁 디렉토리 구조 (Directory Structure)

```text
sejong-dating-server/
├── index.js            # 서버 진입점 (Express 설정 & Socket.io 로직)
├── routes/             # 기능별 API 라우터 분리
│   ├── auth.js         # 세종대 포털 인증 기반 로그인
│   ├── user.js         # 사용자 프로필, 목록, 신고, 피드백, 푸시 토큰
│   ├── admin.js        # 관리자 대시보드 통계 및 데이터 관리
│   ├── chat.js         # 채팅 메시지 이력 및 방 관리
│   └── public.js       # 비로그인 접근 가능 공용 API
├── models/             # MongoDB 데이터 모델 (Mongoose Schemas)
│   ├── User.js         # 유저 정보 및 권한
│   ├── ChatRoom.js     # 채팅방 상태 및 마지막 메시지
│   ├── Message.js      # 채팅 메시지 기록
│   ├── Notice.js       # 공지사항 데이터
│   ├── Feedback.js     # 유저 피드백 데이터
│   └── Report.js       # 사용자 신고 데이터
├── utils/              # 공통 유틸리티
│   └── auth.js         # 포털 로그인 및 학생 정보 추출 로직
├── scripts/            # 서버 운영 및 관리용 독립 스크립트
│   ├── grant_admin.js  # 특정 학번에 관리자 권한 부여
│   └── check_db.js     # 데이터베이스 연결 및 상태 확인
└── .env                # 환경 변수 설정 (Git 관리 제외)
```

---

## 🚀 API 엔드포인트 요약 (API Endpoints)

### 인증 (Auth)
- `POST /auth`: 세종대 포털 인증 및 가입/로그인

### 사용자 및 프로필 (User)
- `GET /users`: 전체 사용자 목록 조회 (본인 제외)
- `GET /profile/:studentId`: 특정 사용자 프로필 상세 조회
- `POST /profile`: 내 프로필 정보 설정 및 수정
- `DELETE /users/:studentId`: 회원 탈퇴 처리
- `POST /push-token`: 푸시 알림용 Expo 토큰 저장
- `POST /feedback`: 서비스 피드백 전송
- `POST /report`: 불량 사용자 신고 접수

### 채팅 (Chat)
- `GET /chat/:roomId`: 해당 채팅방의 이전 메시지 이력 조회
- `DELETE /chat/:roomId/leave`: 채팅방 나가기 (대화방 삭제 로직 포함)

### 관리자 (Admin)
- `GET /admin/stats`: DAU, WAU, MAU 및 총 가입자 통계
- `GET /admin/users`: 전체 사용자 목록 (관리용 상세 정보 포함)
- `PATCH /admin/users/:studentId/role`: 유저 권한 변경 (admin/user)
- `DELETE /admin/users/:studentId`: 유저 강제 탈퇴 (추방)
- `GET/POST/DELETE /admin/notices`: 공지사항 관리
- `GET/DELETE /admin/reports`: 신고 내역 모니터링 및 처리
- `GET /admin/feedbacks`: 유저 피드백 확인

### 공용 (Public)
- `GET /notices/active`: 현재 활성화된(만료되지 않은) 최신 공지사항 조회

---

## 💬 실시간 소켓 통신 (Socket.io)

서버는 다음과 같은 실시간 이벤트를 처리합니다:
- **`login`**: 사용자의 개인 채널(학번 기반) 입장
- **`join_room`**: 특정 채팅방 입장
- **`send_message`**: 메시지 전송 및 저장, 읽음 카운트 업데이트, 푸시 알림 트리거
- **`receive_message`**: 상대방에게 실시간 메시지 전달
- **`chat_list_update`**: 상대방의 채팅 목록 화면 실시간 갱신 신호

---

## ⚙️ 실행 방법 (How to Run)

1. **의존성 설치**:
   ```bash
   npm install
   ```

2. **환경 변수 설정 (`.env`)**:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/sejong-dating
   ```

3. **서버 실행**:
   ```bash
   node index.js
   ```

---

*본 백엔드 시스템은 보안과 성능을 최우선으로 고려하여 개발되었습니다.*
