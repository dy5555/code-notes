# useRPA000Search.js — RHF 단일 조회조건 관리

> 기존 초기 필터 `const [filters] = useState(createInitialFilters)`는 유지하되, 화면의 변경값은 React Hook Form의 `formMethods`만 사용합니다. SearchFilterComp / SearchConditionForm에 동일한 `formMethods`를 통째로 전달하세요. API 요청 날짜 변환은 Fetch Hook에서 처리하고, RHF DatePicker에 넣는 월 필드만 Dayjs로 변환합니다.

```jsx
import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const createInitialFilters = () => ({
    stockMonth: null,
    salesDemandWeek: null,
    somMonth: null,
    somCd: null,
    salesResultMonth: null,
    inboundDemandWeek: null
});

// RHF DatePicker에 전달할 월 필드만 Dayjs로 변환
const toFormValues = (values) => ({
    ...values,
    stockMonth: values.stockMonth ? dayjs(values.stockMonth, 'YYYYMM') : null,
    somMonth: values.somMonth ? dayjs(values.somMonth, 'YYYYMM') : null,
    salesResultMonth: values.salesResultMonth ? dayjs(values.salesResultMonth, 'YYYYMM') : null
});

export function useRPA000Search() {
    // 기존 퍼블리싱의 초기 필터 상태는 유지 (변경 setter는 사용하지 않음)
    const [filters] = useState(createInitialFilters);
    const formMethods = useForm({ defaultValues: createInitialFilters() });
    const { reset, getValues, setValue } = formMethods;
    const [somCodeList, setSomCodeList] = useState([]);
    const initialFiltersRef = useRef(null);
    const initialSomCodeListRef = useRef(null);

    // aaa01: 최초 검색조건은 폼에 한 번만 설정
    const applyInitialData = useCallback((rows) => {
        if (initialFiltersRef.current !== null) return null;

        const values = createInitialFilters();
        // item.type / item.code는 예시. 실제 응답 필드에 맞추세요.
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
        reset(toFormValues(values));
        return values.somMonth;
    }, [reset]);

    // aaa02: SOM 코드 조회 결과를 옵션에 반영 (월 비교/변환 없음)
    const applySomCodes = useCallback((rows, requestedMonth) => {
        // item.plnVer는 예시. 실제 응답 필드에 맞추세요.
        const options = (rows ?? []).map((item) => ({
            label: item.plnVer,
            value: item.plnVer
        }));

        setSomCodeList(options);
        const firstCode = options[0]?.value ?? null;
        setValue('somCd', firstCode);

        if (initialSomCodeListRef.current === null &&
            initialFiltersRef.current !== null &&
            String(requestedMonth) === String(initialFiltersRef.current.somMonth)) {
            initialSomCodeListRef.current = [...options];
            initialFiltersRef.current.somCd = firstCode;
        }
    }, [setValue]);

    // SOM 월 변경: 월 값은 SearchConditionForm의 RHF 바인딩이 변경함.
    // 이 함수는 SOM 코드 선택값과 옵션만 초기화.
    const handleSomMonthChange = useCallback((newMonth) => {
        setValue('somCd', null);
        setSomCodeList([]);
        return newMonth;
    }, [setValue]);

    // 초기화: 최초 폼 값과 SOM 옵션 복원, API 재조회 없음
    const resetFilters = useCallback(() => {
        if (initialFiltersRef.current === null) return;
        reset(toFormValues(initialFiltersRef.current));
        setSomCodeList(initialSomCodeListRef.current ?? []);
    }, [reset]);

    const getSearchParams = useCallback(() => ({ ...getValues() }), [getValues]);

    return {
        filters,
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

## 기존 컴포넌트 연결 시 주의

- 기존 `filters`는 초기값 용도로만 유지하고 `setFilters`는 추가하지 않습니다.
- `SearchFilterComp`에 `formMethods`를 그대로 전달하고, 각 필드는 RHF `Controller`/`register` 등 기존 바인딩을 유지합니다.
- SOM 월 필드의 기존 RHF `onChange`가 값을 반영한 뒤 `onSomMonthChange(newMonth)`도 호출해야 코드 목록을 다시 조회합니다. 이 콜백을 기존 RHF `onChange` 대신 넣으면 폼의 월 값이 갱신되지 않을 수 있습니다.
- 조회는 `getSearchParams()`가 `getValues()`로 읽습니다. DatePicker용 월 변환은 `reset()` 직전에, API 요청용 날짜 변환은 Fetch에서 합니다.
- 최초 `reset()`과 `resetFilters()`에서 월 필드 3개만 Dayjs로 변환합니다. 주차 필드의 컴포넌트 자료형은 별도 확인이 필요합니다. `resetFilters()`는 API 재호출 없이 폼과 옵션을 복원합니다.
- 최초 `somCd`가 API 결과로 설정되면 `initialFiltersRef`에도 저장합니다.
- 실제 회사 소스의 `item.type`, `item.code`, `item.plnVer`는 확인되지 않은 예시 필드입니다.
