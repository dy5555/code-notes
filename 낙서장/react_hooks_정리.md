# React Hooks 정리 (자주 쓰는 순서)

> 훅(Hook) = 함수 컴포넌트 안에서 React 기능(state, 생명주기 등)을 쓰게 해주는 함수
> 이름이 항상 `use`로 시작하고, **컴포넌트 최상단에서만** 호출합니다. (if문, for문 안에서 호출 X)

---

## 매일 쓰는 것

### 1. `useState` — 화면에 보여줄 값 저장
값이 바뀌면 화면을 다시 그려야 하는 데이터를 담습니다.
넥사크로의 **Dataset / 컴포넌트 value**에 해당합니다.

```jsx
const [rowData, setRowData] = useState([]);     // 그리드 데이터
const [srchText, setSrchText] = useState('');   // 검색어
const [pageNo, setPageNo] = useState(1);        // 현재 페이지

setPageNo(2);   // 값 변경 → 화면 다시 그려짐(리렌더링)
```

**주의**
- 값은 `setXxx()`로만 바꿔야 합니다. `pageNo = 2`처럼 직접 바꾸면 화면이 안 바뀝니다.
- 배열/객체는 새로 만들어서 넣어야 합니다.
  ```jsx
  rowData.push(newRow);                  // X : 바뀐 걸 인식 못함
  setRowData([...rowData, newRow]);      // O : 새 배열로 교체
  ```
- `set` 직후에 바로 값을 읽으면 아직 이전 값입니다. (다음 렌더링 때 반영됨)

---

### 2. `useEffect` — 화면이 그려진 뒤 실행할 작업
조회 호출, 타이머, 이벤트 등록처럼 **"화면 표시 외의 작업"**을 할 때 씁니다.
넥사크로의 **form_onload / onchanged / onclose**에 해당합니다.

```jsx
// 처음 한 번만 실행 → form_onload
useEffect(() => {
  fn_search();
}, []);

// pageNo가 바뀔 때마다 실행 → onchanged 이벤트
useEffect(() => {
  fn_search();
}, [pageNo]);

// 화면 닫힐 때 정리 → onclose
useEffect(() => {
  const timer = setInterval(fn_refresh, 5000);
  return () => clearInterval(timer);   // return 함수 = 정리(cleanup)
}, []);
```

**의존성 배열(두 번째 인자)**
| 형태 | 실행 시점 |
|---|---|
| `[]` | 처음 화면 뜰 때 한 번 |
| `[a, b]` | 처음 한 번 + a 또는 b가 바뀔 때마다 |
| 생략 | 렌더링될 때마다 매번 (거의 안 씀) |

---

### 3. `useRef` — 화면과 상관없는 값 저장 / DOM·그리드 직접 접근
값이 바뀌어도 **화면을 다시 그리지 않습니다.**
넥사크로에서 `this.grdList`처럼 **컴포넌트를 직접 잡아서 쓰는 것**과 비슷합니다.

```jsx
const gridRef = useRef(null);      // AG Grid 접근용
const inputRef = useRef(null);     // input 접근용
const isFirstRef = useRef(true);   // 화면에 안 보여도 되는 값

<AgGridReact ref={gridRef} ... />
<input ref={inputRef} />

gridRef.current.api.getSelectedRows();   // 선택된 행 가져오기
inputRef.current.focus();                // 포커스 주기
```

**useState와 차이**
- `useState` : 값 바뀌면 화면 다시 그림 → 화면에 보여줄 값
- `useRef` : 값 바뀌어도 화면 그대로 → 내부에서만 쓰는 값, 컴포넌트 접근

---

## 자주 쓰는 것 (성능 / 최적화)

### 4. `useMemo` — 계산 결과를 저장해두고 재사용
React는 state가 바뀌면 컴포넌트 함수 전체를 다시 실행합니다.
무거운 계산을 매번 다시 하지 않도록, **의존성 값이 바뀔 때만 다시 계산**합니다.

```jsx
// rowData, pageNo가 바뀔 때만 다시 자름
const pagedList = useMemo(() => {
  const startIdx = (pageNo - 1) * pageSize;
  return rowData.slice(startIdx, startIdx + pageSize);
}, [rowData, pageNo]);

// AG Grid 컬럼 정의 → 처음 한 번만 만들기
const colDefs = useMemo(() => [
  { field: 'memoId', headerName: '메모ID' },
  { field: 'memoTitle', headerName: '제목' },
], []);
```

**동작 흐름**
1. `setPageNo(2)` → 리렌더링
2. useMemo가 `rowData`, `pageNo`를 이전 값과 비교
3. 바뀌었으면 다시 계산 / 안 바뀌었으면 저장된 값 그대로 사용

**주의**
- 의존성에는 state나 props를 넣어야 합니다. 일반 변수는 바뀌어도 리렌더링이 안 일어납니다.
- 가벼운 계산까지 다 감쌀 필요는 없습니다. 무거운 계산이나 그리드 컬럼처럼 "매번 새로 만들면 문제가 되는 것"에만 씁니다.

---

### 5. `useCallback` — 함수를 저장해두고 재사용
useMemo가 **값**을 저장한다면, useCallback은 **함수**를 저장합니다.
리렌더링될 때마다 함수가 새로 만들어지는 것을 막습니다.

```jsx
const fn_search = useCallback(async () => {
  const res = await getMemoList({ srchText, pageNo });
  setRowData(res.data);
}, [srchText, pageNo]);   // srchText, pageNo가 바뀔 때만 함수 새로 만듦

// AG Grid 이벤트 핸들러
const onRowDoubleClicked = useCallback((e) => {
  fn_openDetail(e.data.memoId);
}, []);
```

**언제 쓰나**
- 자식 컴포넌트나 그리드에 이벤트 함수로 넘길 때
- useEffect 의존성 배열에 함수를 넣어야 할 때

**useMemo와 비교**
```jsx
useMemo(() => 값, [deps])          // 값을 반환
useCallback(() => {...}, [deps])   // 함수 자체를 반환
```

---

## 가끔 쓰는 것

### 6. `useContext` — 여러 화면에서 공통 값 공유
로그인 사용자 정보, 공통코드처럼 **여러 컴포넌트가 같이 쓰는 값**을 props로 계속 넘기지 않고 꺼내 씁니다.
넥사크로의 **application 전역변수(gv_userId 등)**에 해당합니다.

```jsx
// 1) 만들기 (공통 파일)
export const UserContext = createContext(null);

// 2) 최상위에서 감싸기
<UserContext.Provider value={loginUser}>
  <App />
</UserContext.Provider>

// 3) 아무 화면에서나 꺼내 쓰기
const loginUser = useContext(UserContext);
console.log(loginUser.userId);
```

---

### 7. 커스텀 훅 (`useXxx`) — 내가 만드는 훅
여러 훅을 묶어서 **조회 로직, 그리드 컬럼 등을 따로 빼는 것**입니다.
화면 컴포넌트는 화면만, 로직은 훅으로 나누면 깔끔해집니다.

```jsx
// hooks/useMemoList.js
export function useMemoList() {
  const [rowData, setRowData] = useState([]);
  const [pageNo, setPageNo] = useState(1);

  const fn_search = useCallback(async () => {
    const res = await getMemoList({ pageNo });
    setRowData(res.data);
  }, [pageNo]);

  useEffect(() => { fn_search(); }, [fn_search]);

  return { rowData, pageNo, setPageNo, fn_search };
}

// pages/MemoPage.jsx
const { rowData, pageNo, setPageNo } = useMemoList();
```

---

## 한눈에 비교

| 훅 | 역할 | 넥사크로로 치면 | 값 바뀌면 리렌더링? |
|---|---|---|---|
| `useState` | 화면에 보여줄 값 | Dataset, 컴포넌트 value | O |
| `useEffect` | 화면 그린 뒤 작업 실행 | form_onload, onchanged, onclose | - |
| `useRef` | 컴포넌트 접근 / 내부 값 | `this.grdList` | X |
| `useMemo` | 계산 결과 캐싱 | 필터 걸어둔 결과 캐싱 | - |
| `useCallback` | 함수 캐싱 | - | - |
| `useContext` | 전역 공유 값 | application 전역변수 | O |
| 커스텀 훅 | 로직 분리 | 공통 함수 스크립트 | - |
