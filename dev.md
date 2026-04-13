# Mind Orbit 개발 단계서 v2 (1일 완성형)

기준 문서: `prd.md`  
목표: 하루(실개발 8~10시간) 내 데모 가능한 MVP 완성

---

## 0. 작업 원칙

- 오늘 목표는 "완성도"보다 "동작"이다.
- 저장 안정성(유실 방지) > UI 디테일 > 확장 기능 순으로 우선한다.
- Sprint 6 범위 중에서도 필수(P0)만 오늘 고정한다.
- 머지 기준은 MUST 핵심 플로우 통과 + 치명 버그 0건이다.

---

## 1. 범위 분리 (필수 / 후순위)

## 필수(P0) — 오늘 반드시 완료

### P0-1. 앱 뼈대/라우팅
- [ ] `/`, `/dashboard`, `/editor/:mapId` 라우트 연결
- [ ] 페이지 전환 동작 확인

### P0-2. IndexedDB 최소 구현
- [ ] `mindmaps` store 생성
- [ ] `getAllMaps`, `getMap`, `putMap`, `deleteMap` 구현
- [ ] `updatedAt` 최신순 조회

### P0-3. 대시보드 핵심
- [ ] 새 맵 생성 → 에디터 이동
- [ ] 목록 조회/열기
- [ ] 삭제(즉시 삭제)

### P0-4. 에디터 핵심
- [ ] React Flow 캔버스 렌더링(nodes/edges)
- [ ] 첫 노드 생성 (Empty State 포함)
- [ ] 자식/형제 추가
- [ ] 노드 삭제(루트 제외, 하위 포함)
- [ ] 노드 텍스트 편집(더블클릭/모바일 대응 1가지)

### P0-5. 저장 핵심
- [ ] 자동저장(1.5초 debounce)
- [ ] 수동저장(저장 버튼 또는 `Cmd/Ctrl+S` 중 1개 우선)
- [ ] 새로고침 복구

### P0-6. 최소 모바일 대응
- [ ] 레이아웃 깨짐 방지 (`max-width`, safe-area)
- [ ] 기본 터치 조작(탭/드래그/핀치) 동작 확인

### P0-7. 오늘의 완료 기준 (컷라인)
- [ ] 생성 → 편집 → 저장 → 재접속 복구 성공
- [ ] 대시보드 삭제/재진입 반영 성공
- [ ] 콘솔 치명 에러 없음

---

## 후순위(P1/P2) — 시간 남으면 또는 다음 스프린트

## P1 (시간 남으면 오늘)
- [ ] SaveModal(pre-fill, Enter/ESC)
- [ ] B/I/U 텍스트 스타일
- [ ] 상대시간(오늘/어제) 포맷
- [ ] JSON 클립보드 공유
- [ ] 저장 실패 토스트(단일 타입)

## P2 (다음 스프린트 권장)
- [ ] `visualViewport` 키보드 정교 보정
- [ ] 노드 1클릭 인라인 편집 (PC/모바일)
- [ ] `Tab`/`Enter`/`Delete` 단축키 우선 적용
- [ ] 캔버스 확장 + 루트 노드 초기 중앙 정렬
- [ ] 삭제 Undo 토스트(2초)
- [ ] 오류 상태 UI 고도화(재시도/배너)
- [ ] URL 인코딩 공유

---

## 2. 1일 실행 플랜 (시간 박스)

### Block A (2h) — 기반
- [ ] 라우팅 구성
- [ ] DB 유틸 구성
- [ ] 페이지 스켈레톤 생성

### Block B (3h) — 대시보드
- [ ] 생성/목록/열기/삭제 연결
- [ ] 최소 카드 UI

### Block C (3h) — 에디터+저장
- [ ] 노드 CRUD 연결
- [ ] 편집 동작 연결
- [ ] 자동저장/복구 연결

### Block D (1~2h) — QA/픽스
- [ ] 모바일 기본 검증
- [ ] 리그레션 테스트
- [ ] 치명 이슈 우선 수정

---

## 3. 구현 순서 (파일 단위)

1) `src/main.jsx`, `src/App.jsx`  
- [ ] 라우터 엔트리/레이아웃 연결

2) `src/utils/db.js`  
- [ ] IndexedDB 초기화 및 CRUD

3) `src/pages/DashboardPage.jsx`  
- [ ] 목록/생성/삭제/진입

4) `src/pages/EditorPage.jsx`  
- [ ] 캔버스/헤더/툴바 배치

5) `src/hooks/useMindMap.js`  
- [ ] 자식/형제/삭제 핵심 액션

6) `src/hooks/useAutoSave.js`  
- [ ] debounce 자동저장

7) `src/components/*`  
- [ ] EmptyState, Header, 최소 Toolbar

---

## 4. 테스트 시나리오 (오늘 최소)

- [ ] 시나리오 A: 새 맵 생성 → 첫 노드 입력 → 자동저장 → 새로고침 복구
- [ ] 시나리오 B: 자식/형제 추가 → 삭제 → 저장 → 재진입 상태 확인
- [ ] 시나리오 C: 대시보드 복귀 → 목록 반영 → 다시 열기
- [ ] 시나리오 D: 모바일 브라우저에서 탭/패닝/핀치 기본 동작

---

## 5. 오늘 버릴 것(명시적 스코프 컷)

- [ ] Undo/Redo 고도화
- [ ] 정교한 모바일 키보드 레이아웃 보정
- [ ] 공유 URL 인코딩
- [ ] 애니메이션/스타일 디테일 튜닝

---

## 6. 작업 티켓 예시 (v2 기준)

- [ ] `feat/router-and-page-skeleton`
- [ ] `feat/indexeddb-crud`
- [ ] `feat/dashboard-core-crud`
- [ ] `feat/editor-node-crud`
- [ ] `feat/autosave-and-restore`
- [ ] `test/mvp-day1-regression`
- [ ] `fix/mobile-basic-interaction`

