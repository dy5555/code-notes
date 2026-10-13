# RPA000 useSearch - 최초 월·주차 조회 및 초기화

기존 `useForm`, `reset()`, `resetFilters()` 구조를 유지한 예제입니다.

```jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';

export function useRPA000Search() {

    // 1. API에서 조회한 최초 월·주차 보관
    // 사용자가 검색조건을 변경해도 이 값은 유지됨
    const initialFiltersRef = useRef(null);

    // 2. 초기 검색조건 생성
    // API 조회 전에는 null, 조회 후에는 최초 조회값 반환
    const createInitialFilters = () => ({
        stockMonth: initialFiltersRef.current?.stockMonth ?? null,
        salesDemandWeek: initialFiltersRef.current?.salesDemandWeek ?? null,
        somMonth: initialFiltersRef.current?.somMonth ?? null,
        somCds: [...(initialFiltersRef.current?.somCds ?? [])],
        salesResultMonth: initialFiltersRef.current?.salesResultMonth ?? null,
        inboundDemandWeek: initialFiltersRef.current?.inboundDemandWeek ?? null
    });

    // 3. 기존 filters
    const [filters] = useState(createInitialFilters);

    // 4. 기존 React Hook Form
    const formMethods = useForm({
        defaultValues: createInitialFilters()
    });

    const { reset } = formMethods;

    // 5. 화면 최초 진입 시 월·주차 조회
    useEffect(() => {

        const loadInitialFilters = async () => {
            try {
                // 실제 프로젝트 API 함수로 교체
                const result = await getInitialMonthWeek();

                // 최초 조회값 보관
                initialFiltersRef.current = {
                    ...result,
                    somCds: [...(result.somCds ?? [])]
                };

                // 조회한 월·주차를 화면 검색조건에 설정
                reset(createInitialFilters());

            } catch (error) {
                console.error('초기 검색조건 조회 실패', error);
            }
        };

        loadInitialFilters();

    }, [reset]);

    // 6. 기존 초기화 함수
    const resetFilters = useCallback(async () => {

        // 최초 API 조회값으로 검색조건 복원
        reset(createInitialFilters());

    }, [reset]);

    // 7. 다른 컴포넌트에서 사용
    return {
        filters,
        formMethods,
        resetFilters
    };
}
```

## 동작 예시

| 상황 | 재고 월 |
|---|---|
| 최초 화면 진입 | `null` |
| API 조회 완료 | `202609` |
| 사용자가 월 변경 | `202608` |
| 초기화 버튼 클릭 | `202609` |

**주의:** `getInitialMonthWeek()`는 예시 API 함수명이므로 실제 프로젝트 함수로 교체해야 합니다. `filters`는 `useState` 초기값으로 고정되어 API 조회 후 자동 변경되지 않습니다. 따라서 `FilterComp defaultValues={filters}`가 실제 폼 초기값으로 쓰이는 경우 동기화 여부를 확인해야 합니다.
