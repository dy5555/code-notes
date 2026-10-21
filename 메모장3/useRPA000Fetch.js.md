# useRPA000Fetch.js — 회사 Tab 호출 패턴

> API 호출만 담당. 이미 작성된 실제 API 함수명을 import해서 사용. 아래 함수명은 예시.

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isoWeekYear from 'dayjs/plugin/isoWeekYear';

dayjs.extend(isoWeek);
dayjs.extend(isoWeekYear);

// API 요청 직전에서만 날짜 형식 변환
const formatMonth = (value) => {
    if (!value) return null;
    if (/^\d{6}$/.test(String(value))) return String(value);
    const date = dayjs(value);
    return date.isValid() ? date.format('YYYYMM') : null;
};

const formatWeek = (value) => {
    if (!value) return null;
    if (/^\d{6}$/.test(String(value))) return String(value);
    const date = dayjs(value);
    return date.isValid()
        ? `${date.isoWeekYear()}${String(date.isoWeek()).padStart(2, '0')}`
        : null;
};


// 실제 프로젝트에서 만들어 둔 API 함수 import
// import { fetchaaa01301, fetchaaa01302, fetchaaa01303 } from '실제 API 경로';

export function useRPA000Fetch(tabId) {
    const [somMonth, setSomMonth] = useState(null);
    const [searchParams, setSearchParams] = useState(null);
    const [searchTrigger, setSearchTrigger] = useState(0);
    const [isSearched, setIsSearched] = useState(false);

    // aaa01: 최초 월·주차
    const {
        data: initialData = [],
        isSuccess: isInitialSuccess
    } = useQuery({
        queryKey: ['RPA000_INITIAL', tabId],
        queryFn: async () => {
            const result = await fetchaaa01301({});
            return result.data ?? [];
        },
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000
    });

    // aaa02: SOM 월 변경 시 코드 목록
    const {
        data: somCodeData = [],
        isSuccess: isSomSuccess
    } = useQuery({
        queryKey: ['RPA000_SOM', tabId, somMonth],
        queryFn: async () => {
            if (!somMonth) return [];
            const result = await fetchaaa01302({ somMonth: formatMonth(somMonth) });
            return result.data ?? [];
        },
        enabled: !!somMonth,
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000
    });

    // aaa03: 조회 버튼으로 실행하는 메인 그리드
    const {
        data: rowData = [],
        isLoading
    } = useQuery({
        queryKey: ['RPA000_GRID', tabId, searchParams, searchTrigger],
        queryFn: async () => {
            if (!searchParams) return [];
            const params = {
                ...searchParams,
                stockMonth: formatMonth(searchParams.stockMonth),
                salesDemandWeek: formatWeek(searchParams.salesDemandWeek),
                somMonth: formatMonth(searchParams.somMonth),
                salesResultMonth: formatMonth(searchParams.salesResultMonth),
                inboundDemandWeek: formatWeek(searchParams.inboundDemandWeek)
            };
            const result = await fetchaaa01303(params);
            return result.data ?? [];
        },
        enabled: !!searchParams,
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000
    });

    const search = (params) => {
        setSearchParams(params);
        setSearchTrigger((prev) => prev + 1);
        setIsSearched(true);
    };

    const clearGrid = () => {
        setSearchParams(null);
        setIsSearched(false);
        // 실제 회사의 clearGrid 구현이 있으면 기존 코드 유지.
        // 이 예시만으로 기존 그리드 데이터가 즉시 []가 되는 것은 아님.
    };

    return {
        initialData,
        isInitialSuccess,
        somCodeData,
        isSomSuccess,
        somMonth,
        rowData,
        isLoading,
        isSearched,
        setSomMonth,
        search,
        clearGrid
    };
}
```

## 역할/연결

```text
RPA000.jsx
  └─ useRPA000Search()   // 검색조건 관리
        ↓ props
RPA000Tab.jsx
  └─ useRPA000Fetch(tabId)
       ├─ aaa01 → initialData → applyInitialData()
       ├─ aaa02 → somCodeData → applySomCodes()
       └─ aaa03 → rowData / isLoading → TableComp
```

검색조건 및 SOM 월은 원본값으로 상태 관리하며, **aaa02/aaa03 API 호출 직전에서만 날짜를 변환**합니다. 월은 YYYYMM, 주차는 ISO YYYYWW 예시이며 실제 업무 주차 규칙을 확인해야 합니다.

Tab의 최초 데이터/옵션 반영은 `isInitialSuccess`, `isSomSuccess`로 성공 상태를 확인한 후 실행합니다. `isSomSuccess`가 true라도 초기화 직후 `somMonth`가 null이면 옵션을 적용하지 않아야 합니다. 초기화 이벤트에서는 `resetFilters()`와 `setSomMonth(null)`를 함께 호출하면 추가 SOM API 요청 없이 Fetch 쿼리를 비활성화할 수 있습니다.

**주의:** `fetchaaa01301~03`, 응답 `result.data`는 실제 API 규격에 맞게 확인해야 합니다. `isLoading`은 React Query의 최초 로딩 상태이며 재조회 진행 여부까지 표시하려면 `isFetching`이 별도로 필요합니다.
