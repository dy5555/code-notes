# useRPA000Fetch.js — API 호출 전담 예시

> 회사의 기존 **Tab에서 Fetch Hook 호출** 패턴에 맞춘 예시입니다. API 함수 이름, import 경로 및 응답 구조는 실제 프로젝트에 맞춰 바꿔야 합니다.

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 이미 만든 실제 API 함수로 교체해서 import
// import { fetchaaa01301, fetchaaa01302, fetchaaa01303 } from '실제 API 경로';

export function useRPA000Fetch(tabId) {
    const [somMonth, setSomMonth] = useState(null);
    const [searchParams, setSearchParams] = useState(null);
    const [trigger, setTrigger] = useState(0);
    const [isSearched, setIsSearched] = useState(false);

    // aaa01: 최초 월·주차 조회
    const { data: initialData = [] } = useQuery({
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

    // aaa02: SOM 월별 코드 조회
    const { data: somCodeData = [] } = useQuery({
        queryKey: ['RPA000_SOM', tabId, somMonth],
        queryFn: async () => {
            if (!somMonth) return [];
            const result = await fetchaaa01302({ somMonth });
            return result.data ?? [];
        },
        enabled: !!somMonth,
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000
    });

    // aaa03: 조회 버튼으로 실행하는 메인 그리드
    const { data: gridData = [], isFetching } = useQuery({
        queryKey: ['RPA000_GRID', tabId, searchParams, trigger],
        queryFn: async () => {
            if (!searchParams) return [];
            const result = await fetchaaa01303(searchParams);
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
        setTrigger((prev) => prev + 1);
        setIsSearched(true);
    };

    const clearGrid = () => {
        setSearchParams(null);
        setIsSearched(false);
        // 주의: useQuery의 기존 data가 즉시 []가 되는 것은 아님.
        // 실제 회사 clearGrid 구현이 있으면 그 코드를 유지할 것.
    };

    return {
        initialData,
        somCodeData,
        gridData,
        isFetching,
        isSearched,
        setSomMonth,
        search,
        clearGrid
    };
}
```

## 실제 연결 경로

```text
RPA000.jsx
  └─ useRPA000Search()
       └─ 검색조건 / applyInitialData / applySomCodes / handleSomMonthChange

RPA000Tab.jsx
  └─ useRPA000Fetch(tabId)
       ├─ aaa01 → initialData → applyInitialData(initialData)
       │                        └─ 반환 SOM 월 → setSomMonth(...)
       ├─ aaa02 → somCodeData → applySomCodes(somCodeData)
       └─ aaa03 → gridData → TableComp
```

## 주의사항

1. `fetchaaa01301`, `fetchaaa01302`, `fetchaaa01303`은 예시 함수명입니다. **이미 작성한 실제 API 함수를 사용하세요.**
2. 최초 조회의 `result.data`가 배열이 아닐 경우 실제 응답 형태에 맞춰 변경하세요.
3. `clearGrid()`는 실제 회사 구현이 있다면 **그대로 유지**해야 합니다. 위 코드는 최소 구조 설명용입니다.
4. React Query의 `staleTime: 0`은 마운트/재활성화 상황에서 재조회가 가능하다는 뜻이지, 무조건 최초 한 번만 실행한다는 뜻이 아닙니다.
5. Search의 초기화가 Fetch의 SOM 월 상태까지 초기화하지 않으므로, 초기화 이후 다시 같은 SOM 월을 선택하는 경우 등은 실제 화면 이벤트에 맞춰 동기화해야 합니다.
