/*
 * React Hooks 초보자 정리
 * 작성일: 2026-09-10
 *
 * 처음에는 1~5번을 우선 이해하면 됩니다.
 * 1. useState    = 값 저장
 * 2. useEffect   = 어떤 일이 일어난 뒤 작업
 * 3. useRef      = 렌더링 없이 값 기억 / DOM 접근
 * 4. useMemo     = 계산 결과 기억
 * 5. useCallback = 함수 기억
 */

/*
 * [자주 사용하는 순서 기준]
 *
 *  1. useState
 *     값을 저장하고 변경할 때 사용.
 *     값이 변경되면 React가 화면을 다시 렌더링한다.
 *
 *  2. useEffect
 *     화면이 처음 열렸거나 특정 값이 변경된 뒤 작업할 때 사용.
 *     API 조회, 이벤트 처리, 값 변경 감지 등에 많이 사용한다.
 *
 *  3. useRef
 *     값을 저장하지만 값이 바뀌어도 화면을 다시 렌더링하지 않는다.
 *     input 같은 HTML DOM 요소에 직접 접근할 때도 사용한다.
 *
 *  4. useMemo
 *     계산한 '결과값'을 기억한다.
 *     같은 계산을 렌더링할 때마다 반복하는 것을 줄일 수 있다.
 *
 *  5. useCallback
 *     '함수' 자체를 기억한다.
 *     렌더링할 때 불필요하게 함수를 새로 만드는 것을 줄일 수 있다.
 *
 *  6. useContext
 *     여러 컴포넌트에서 사용하는 공통 데이터를 가져올 때 사용.
 *     로그인 사용자, 테마, 언어 등의 공통 정보에 활용한다.
 *
 *  7. useReducer
 *     useState만으로 상태 관리가 복잡할 때 사용.
 *     여러 상태 변경 규칙을 reducer 한 곳에서 관리한다.
 *
 *  8. useLayoutEffect
 *     useEffect와 비슷하지만 브라우저가 화면을 보여주기 전에 실행된다.
 *     화면 위치나 크기를 측정해야 하는 특별한 경우에 사용한다.
 *
 *  9. useId
 *     HTML 요소에 사용할 고유 ID를 생성한다.
 *     label과 input 연결 등에 유용하다.
 *
 * 10. useTransition
 *     시간이 걸리는 화면 변경의 우선순위를 낮춰 UI가 덜 버벅이게 한다.
 *
 * 11. useDeferredValue
 *     특정 값의 화면 반영을 늦춰 무거운 렌더링의 부담을 줄인다.
 *     검색어에 따른 큰 검색 결과 화면 등에 활용할 수 있다.
 *
 * 12. useImperativeHandle
 *     부모가 ref를 통해 자식 컴포넌트의 특정 기능을 실행할 수 있게 한다.
 *
 * 13. useSyncExternalStore
 *     React 외부의 상태 저장소 변경을 구독할 때 사용한다.
 *
 * 14. useDebugValue
 *     직접 만든 Custom Hook의 값을 React 개발자 도구에서 보기 쉽게 표시한다.
 *
 * 15. useInsertionEffect
 *     화면 스타일을 그리기 전에 CSS를 삽입할 때 사용한다.
 *     일반 앱 개발보다는 CSS 라이브러리 제작에서 주로 사용한다.
 *
 * 16. use
 *     Promise나 Context 같은 리소스의 값을 읽는 데 사용하는 React API다.
 *
 * 17. useOptimistic
 *     서버 응답을 기다리는 동안 성공했다고 가정하고 화면을 먼저 변경한다.
 *
 * 18. useActionState
 *     폼 제출 같은 Action의 결과와 상태를 관리한다.
 *
 * 19. useFormStatus
 *     현재 폼이 제출 중인지 등의 상태를 확인한다.
 *
 * 20. Custom Hook
 *     useXXX 형태로 직접 Hook을 만들어 공통 로직을 재사용하는 방법이다.
 */

// ------------------------------------------------------------
// 1. useState : 값 저장
// ------------------------------------------------------------
const [name, setName] = useState("");
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
const [list, setList] = useState([]);

// 예: setName("홍길동")을 실행하면 name 값이 바뀌고 화면도 다시 렌더링된다.


// ------------------------------------------------------------
// 2. useEffect : 최초 실행 / 값 변경 후 작업
// ------------------------------------------------------------
useEffect(() => {
    // 화면이 처음 열릴 때 1번 실행
    console.log("최초 실행");
}, []);

useEffect(() => {
    // name이 변경될 때마다 실행
    console.log("name 변경:", name);
}, [name]);


// ------------------------------------------------------------
// 3. useRef : 렌더링 없이 값 기억 / DOM 접근
// ------------------------------------------------------------
const inputRef = useRef(null);
const previousValueRef = useRef("");

// inputRef.current.focus(); 처럼 실제 HTML 요소에 접근할 수 있다.
// previousValueRef.current 값이 바뀌어도 그것만으로 화면이 다시 렌더링되지는 않는다.


// ------------------------------------------------------------
// 4. useMemo : 계산 '결과값' 기억
// ------------------------------------------------------------
const total = useMemo(() => {
    return price * count;
}, [price, count]);

// price 또는 count가 바뀌었을 때 다시 계산한다.
// 핵심: useMemo = 계산된 '값'을 기억


// ------------------------------------------------------------
// 5. useCallback : '함수' 기억
// ------------------------------------------------------------
const handleClick = useCallback(() => {
    console.log("클릭");
}, []);

// 핵심: useCallback = '함수'를 기억


/*
 * 초보자 암기용
 * ------------------------------------------------------------
 * useState    = 값 저장
 * useEffect   = 변경 후 뭔가 실행
 * useRef      = 렌더링 없이 기억 / DOM 잡기
 * useMemo     = 계산값 기억
 * useCallback = 함수 기억
 *
 * 처음에는 위 5개를 먼저 익히고,
 * 나머지는 실제 코드에서 필요할 때 하나씩 익히면 된다.
 */
