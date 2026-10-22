# useRPA000Fetch.js — 회사 Tab 호출 패턴

> API 호출만 담당. 이미 작성된 실제 API 함수명을 import해서 사용. 아래 함수명은 예시.

```jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
// 실제 프로젝트에서 만들어 둔 API 함수 import
// import { fetchaaa01301, fetchaaa01302, fetchaaa01303, fetchaaa01304 } from '실제 API 경로';

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
            const result = await fetchaaa01302({ somMonth: somMonth });
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
                stockMonth: searchParams.stockMonth?.format('YYYYMM') ?? null,
                salesDemandWeek: searchParams.salesDemandWeek?.format('YYYYww') ?? null,
                somMonth: searchParams.somMonth?.format('YYYYMM') ?? null,
                salesResultMonth: searchParams.salesResultMonth?.format('YYYYMM') ?? null,
                inboundDemandWeek: searchParams.inboundDemandWeek?.format('YYYYww') ?? null
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

    // aaa04: Java에 보정 대상 목록을 한 번 전달. Java에서 행별 프로시저 호출.
    const { mutateAsync: batchAdjust, isPending: isAdjusting } = useMutation({
        mutationFn: async (rows) => {
            return await fetchaaa01304(rows);
        }
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
        clearGrid,
        batchAdjust,
        isAdjusting
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
       ├─ aaa03 → rowData / isLoading → TableComp
       └─ aaa04 → batchAdjust(rows) → Java 반복 프로시저 호출
```

검색조건은 Dayjs 값으로 관리하고, API 호출 직전에 각 필드의 `.format()`으로 문자열을 전달합니다. 월은 `YYYYMM`, 주차는 `YYYYww`를 사용합니다. SOM 코드 조회용 `somMonth`가 이미 문자열이면 그대로 전달해야 합니다.

Tab의 최초 데이터/옵션 반영은 `isInitialSuccess`, `isSomSuccess`로 성공 상태를 확인한 후 실행합니다. `isSomSuccess`가 true라도 초기화 직후 `somMonth`가 null이면 옵션을 적용하지 않아야 합니다. 초기화 이벤트에서는 `resetFilters()`와 `setSomMonth(null)`를 함께 호출하면 추가 SOM API 요청 없이 Fetch 쿼리를 비활성화할 수 있습니다.

**주의:** `fetchaaa01301~03`, 응답 `result.data`는 실제 API 규격에 맞게 확인해야 합니다. `isLoading`은 React Query의 최초 로딩 상태이며 재조회 진행 여부까지 표시하려면 `isFetching`이 별도로 필요합니다.

일괄보정 요청 본문 예시: `[{ salesProdId: '...', tobeRpSomcd: '...' }]`. `fetchaaa01304`는 임시 API 함수명이며 실제 API 및 요청 래핑 규격에 맞춰 연결해야 합니다.
