# useRPA000Search.js — Fetch 분리 수정본

> API 호출 없음. `filters`를 검색조건의 기준으로 사용하며, 최초값/초기 SOM 코드 목록을 보관하고 초기화를 담당. **SearchFilterComp가 `filters` 기반으로 입력값을 관리하는지 확인 필요.**

```jsx
import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
const createInitialFilters = () => ({
    stockMonth: null,
    salesDemandWeek: null,
    somMonth: null,
    somCd: null,
    salesResultMonth: null,
    inboundDemandWeek: null
});

export function useRPA000Search() {
    const [filters, setFilters] = useState(createInitialFilters);
    const [somCodeList, setSomCodeList] = useState([]);

    // 최초값 보관: 검색조건 6개 + 최초 SOM 옵션
    const initialFiltersRef = useRef(null);
    const initialSomCodeListRef = useRef(null); // null=아직 저장 안 함, []=정상적인 빈 결과

    const formMethods = useForm({ defaultValues: createInitialFilters() });

    // aaa01 결과를 외부(Tab)에서 전달받아 최초 한 번만 적용
    const applyInitialData = useCallback((rows) => {
        if (initialFiltersRef.current !== null) return null;

        const values = createInitialFilters();

        // 아래 item.type / item.code는 메모장2의 예시 필드.
        // 실제 API 응답의 구분값/코드 필드로 교체해야 함.
        (rows ?? []).forEach((item) => {
            switch (item.type) {
                case 'STOCK_YM':
                    values.stockMonth = item.code;
                    break;
                case 'SALES_DEMAND_YM':
                    values.salesDemandWeek = item.code;
                    break;
                case 'SOM_YM':
                    values.somMonth = item.code;
                    break;
                case 'SALES_ACT_YM':
                    values.salesResultMonth = item.code;
                    break;
                case 'GR_DEMAND_YM':
                    values.inboundDemandWeek = item.code;
                    break;
                default:
                    break;
            }
        });

        initialFiltersRef.current = { ...values };
        setFilters({ ...values });
        // 최초 조회값은 filters에 한 번만 반영. 개별 setValue() 사용 안 함.
        return values.somMonth; // 최초 SOM 월도 변환 없이 그대로 전달
    }, []);

    // aaa02 결과를 전달받아 옵션 갱신 및 첫 코드 선택
    // 조회 요청에 사용한 월도 함께 받아, 현재 선택 월과 다른 늦은 응답은 무시
    const applySomCodes = useCallback((rows, requestedMonth) => {
        if (String(filters.somMonth) !== String(requestedMonth)) return;

        // item.plnVer는 메모장2의 예시 응답 필드
        const options = (rows ?? []).map((item) => ({
            label: item.plnVer,
            value: item.plnVer
        }));

        setSomCodeList(options);
        setFilters((prev) => ({ ...prev, somCd: options[0]?.value ?? null }));

        // null로 구분하므로 최초 옵션이 []여도 다시 덮어쓰지 않음
        if (initialSomCodeListRef.current === null &&
            initialFiltersRef.current !== null &&
            String(requestedMonth) === String(initialFiltersRef.current.somMonth)) {
            initialSomCodeListRef.current = [...options];
            initialFiltersRef.current.somCd = options[0]?.value ?? null;
        }
    }, [filters.somMonth]);

    // SOM 월 변경: API 호출 없이 현재 선택 상태만 변경
    const handleSomMonthChange = useCallback((newMonth) => {
        setFilters((prev) => ({ ...prev, somMonth: newMonth, somCd: null }));
        setSomCodeList([]);
        return newMonth; // 날짜 변환 없이 Tab의 Fetch에 전달
    }, []);

    // 초기화: 저장한 최초값 복원, reset() 및 API 호출 없음
    const resetFilters = useCallback(() => {
        if (initialFiltersRef.current === null) return;

        const initial = { ...initialFiltersRef.current };
        // 초기화 버튼에서만 filters 복원. reset()/setValue() 사용 안 함.
        setFilters(initial);
        setSomCodeList(initialSomCodeListRef.current ?? []);
    }, []);

    // 조회조건은 원본 상태 그대로 전달. API 직전에 Fetch에서 날짜 변환.
    const getSearchParams = useCallback(() => ({ ...filters }), [filters]);

    return {
        filters,
        setFilters,
        formMethods,
        somCodeList,
        applyInitialData,
        applySomCodes,
        handleSomMonthChange,
        resetFilters,
        getSearchParams
    };
}
```

## RPA000Tab.jsx 연결 시 주의

- `RPA000.jsx`에서 `useRPA000Search()`를 호출하고 반환 함수를 기존 `getPaneProps()`로 Tab에 전달.
- Tab에서 `useRPA000Fetch(tabId)` 호출.
- 최초 `initialData` 성공 시 `applyInitialData(initialData)` 호출. Hook 내부의 `initialFiltersRef`가 최초 한 번만 적용하도록 방어하며, Tab effect에서 매 렌더마다 재호출하지 않도록 의존성을 점검. 반환한 월이 있으면 `setSomMonth(월)` 호출.
- SOM 코드 조회 성공 시 `applySomCodes(somCodeData, somMonth)` 호출. 단, **조회 결과가 확정된 현재 월**에 대해서만 적용. React Query의 `isSuccess`와 `somMonth`를 확인.
- SOM 월 변경 시 `setSomMonth(handleSomMonthChange(newMonth))`.
- 초기화 시 `resetFilters()`를 호출하고, Fetch의 `setSomMonth(null)`도 호출해 이전 SOM 조회 상태를 비활성화. **기존 캐시/응답을 다시 폼에 적용하는 effect가 없도록 조건 확인**. 이후 사용자가 SOM 월을 선택하면 다시 조회 가능.
- 메인 조회는 `search(getSearchParams())` → `rowData`를 TableComp로 전달.

## 확인이 필요한 실제 프로젝트 사항

1. `item.type`, `item.code`, `item.plnVer`는 기존 문서의 **가상 응답 필드**. 실제 필드로 교체.
2. 최초 월·주차는 API 응답값을 날짜 변환 없이 `setFilters(values)` 한 번으로 적용합니다. `applyInitialData()`가 Tab에 반환하는 최초 SOM 월도 원본값 그대로입니다. 초기화는 `setFilters(initial)`만 사용합니다. 날짜 변환은 Search Hook에서 하지 않고 Fetch의 API 호출 직전에만 수행합니다.
3. Fetch의 `formatWeek`는 ISO 주차 기준 예시. 실제 업무 주차 규칙 확인.
4. SOM 옵션 조회 실패/재시도와 초기화의 순서가 겹치는 경우, Tab의 useEffect 조건을 함께 확인해야 함.
5. **`filters`가 검색조건의 단일 기준입니다.** SearchFilterComp의 모든 입력 변경은 `setFilters`로 연결하고, 표시값도 `filters`에서 받아야 합니다. 기존 컴포넌트가 React Hook Form `Controller`/`getValues()`를 기준으로 동작한다면 이 코드만으로는 동기화되지 않으므로 SearchFilterComp 연결도 함께 조정해야 합니다. `formMethods`는 기존 props 호환을 위해 유지했습니다.
