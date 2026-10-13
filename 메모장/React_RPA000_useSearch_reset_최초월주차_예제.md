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
    // API 조회 전 사용할 기본 검색조건
    const createInitialFilters = () => ({
        stockMonth: null,
        salesDemandWeek: null,
        somMonth: null,
        somCds: [],
        salesResultMonth: null,
        inboundDemandWeek: null
    });

    // 3. 기존 filters
    const [filters, setFilters] = useState(createInitialFilters);

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

                // API 응답 data 배열(5행)을 검색조건 필드에 매핑
                const initialValues = createInitialFilters();

                result.data.forEach((item) => {
                    switch (item.type) {
                        case 'STOCK_YM':
                            initialValues.stockMonth = item.code;
                            break;
                        case 'SALES_DEMAND_YM':
                            initialValues.salesDemandWeek = item.code;
                            break;
                        case 'SOM_YM':
                            initialValues.somMonth = item.code;
                            break;
                        case 'SALES_ACT_YM':
                            initialValues.salesResultMonth = item.code;
                            break;
                        case 'GR_DEMAND_YM':
                            initialValues.inboundDemandWeek = item.code;
                            break;
                        default:
                            break;
                    }
                });

                // 최초 조회한 검색조건 전체 보관
                initialFiltersRef.current = initialValues;

                // SearchFilterComp에 전달할 filters 갱신
                setFilters(initialFiltersRef.current);

                // React Hook Form에도 조회값 설정
                reset(initialFiltersRef.current);

            } catch (error) {
                console.error('초기 검색조건 조회 실패', error);
            }
        };

        loadInitialFilters();

    }, [reset]);

    // 6. 기존 초기화 함수
    const resetFilters = useCallback(async () => {

        // 최초 API 조회값 전체로 검색조건 복원
        reset({
            ...initialFiltersRef.current,
            somCds: [...(initialFiltersRef.current?.somCds ?? [])]
        });

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

**주의:** `getInitialMonthWeek()`는 예시 API 함수명이므로 실제 프로젝트 함수로 교체해야 합니다. API 조회 후 `setFilters()`와 `reset()`으로 검색조건을 갱신합니다. `MonthPickerField`에 값이 표시되려면 폼 연결 및 날짜 형식이 맞아야 합니다.
