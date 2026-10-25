# useAAA013Fetch.js — 회사 Tab 호출 패턴

> API 호출만 담당. 이미 작성된 실제 API 함수명을 import해서 사용. 아래 함수명은 예시.

```jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
// 실제 프로젝트에서 만들어 둔 API 함수 import
// import { fetchaaa01301, fetchaaa01302, fetchaaa01303, fetchaaa01304, fetchaaa01305 } from '실제 API 경로';

export function useAAA013Fetch(tabId) {
    const [somMonth, setSomMonth] = useState(null);
    const [searchParams, setSearchParams] = useState(null);
    const [searchTrigger, setSearchTrigger] = useState(0);
    const [isSearched, setIsSearched] = useState(false);

    // aaa01: 최초 월·주차
    const {
        data: initialData = [],
        isSuccess: isInitialSuccess
    } = useQuery({
        queryKey: ['AAA013_INITIAL', tabId],
        queryFn: async () => {
            const result = await fetchaaa01301({});
            return result.data ?? [];
        },
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000
    });

    // aaa05: SOM CD가 존재하는 전체 년월(YYYYMM), 화면 최초 진입 시 1회 조회
    const {
        data: somAvailableMonthData = [],
        isSuccess: isSomAvailableMonthSuccess,
        isLoading: isSomAvailableMonthLoading
    } = useQuery({
        queryKey: ['AAA013_SOM_AVAILABLE_MONTHS'],
        queryFn: async () => {
            const result = await fetchaaa01305({});
            return result.data ?? [];
        },
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000
    });

    // aaa02: SOM 월 변경 시 코드 목록
    const {
        data: somCodeData = [],
        isSuccess: isSomSuccess
    } = useQuery({
        queryKey: ['AAA013_SOM', tabId, somMonth],
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
        queryKey: ['AAA013_GRID', tabId, searchParams, searchTrigger],
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
            toast.loading('조회 중입니다.', 0);
            const result = await fetchaaa01303(params).finally(() => toast.destroy());
            if (!result.data?.length) {
                toast.info('조회결과가 존재하지 않습니다.');
            }
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
        somAvailableMonthData,
        isSomAvailableMonthSuccess,
        isSomAvailableMonthLoading,
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
AAA013.jsx
  └─ useAAA013Search()   // 검색조건 관리
        ↓ props
AAA013Tab.jsx
  └─ useAAA013Fetch(tabId)
       ├─ aaa01 → initialData → applyInitialData()
       ├─ aaa05 → somAvailableMonthData → applyAvailableSomMonths() (최초 1회)
       ├─ aaa02 → somCodeData → applySomCodes()
       ├─ aaa03 → rowData / isLoading → TableComp
       └─ aaa04 → batchAdjust(rows) → Java 반복 프로시저 호출
```

검색조건은 Dayjs 값으로 관리하고, API 호출 직전에 각 필드의 `.format()`으로 문자열을 전달합니다. 월은 `YYYYMM`, 주차는 `YYYYww`를 사용합니다. SOM 코드 조회용 `somMonth`가 이미 문자열이면 그대로 전달해야 합니다.

Tab의 최초 데이터/옵션 반영은 `isInitialSuccess`, `isSomSuccess`로 성공 상태를 확인한 후 실행합니다. `isSomSuccess`가 true라도 초기화 직후 `somMonth`가 null이면 옵션을 적용하지 않아야 합니다. 초기화 이벤트에서는 `resetFilters()`와 `setSomMonth(null)`를 함께 호출하면 추가 SOM API 요청 없이 Fetch 쿼리를 비활성화할 수 있습니다.

**주의:** `fetchaaa01301~03`, 응답 `result.data`는 실제 API 규격에 맞게 확인해야 합니다. `isLoading`은 React Query의 최초 로딩 상태이며 재조회 진행 여부까지 표시하려면 `isFetching`이 별도로 필요합니다.

일괄보정 요청 본문 예시: `[{ salesProdId: '...', tobeRpSomcd: '...' }]`. `fetchaaa01304`는 임시 API 함수명이며 실제 API 및 요청 래핑 규격에 맞춰 연결해야 합니다.


`aaa05`는 신규 API 예시입니다. 기존 `aaa03`(그리드), `aaa04`(일괄보정)는 변경하지 않습니다. `fetchaaa01305` 실제 구현 및 import는 프로젝트 API 파일에 추가해야 합니다. 서버 응답은 `[{ somYm: '202608' }]` 형태를 가정합니다. React Query 캐시는 컴포넌트가 마운트된 동안 유지되며 페이지 새로고침이나 캐시 만료 후에는 재조회될 수 있습니다.
