# useRPA000Search.js — API 호출 분리 버전

> 기존 메모장2의 useRPA000Search를 기반으로 수정. **이 Hook 안에서는 API를 호출하지 않습니다.** Fetch 결과는 상위 화면/Tab이 콜백으로 전달합니다.

```jsx
import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isoWeekYear from 'dayjs/plugin/isoWeekYear';

dayjs.extend(isoWeek);
dayjs.extend(isoWeekYear);

const createInitialFilters = () => ({
    stockMonth: null,
    salesDemandWeek: null,
    somMonth: null,
    somCd: null,
    salesResultMonth: null,
    inboundDemandWeek: null
});

const formatMonth = (value) => {
    if (!value) return null;
    if (/^\d{6}$/.test(String(value))) return String(value);
    return dayjs(value).format('YYYYMM');
};

const formatWeek = (value) => {
    if (!value) return null;
    if (/^\d{6}$/.test(String(value))) return String(value);
    const date = dayjs(value);
    return `${date.isoWeekYear()}${String(date.isoWeek()).padStart(2, '0')}`;
};

export function useRPA000Search() {
    const [filters, setFilters] = useState(createInitialFilters);
    const initialFiltersRef = useRef(null);
    const initialSomCodeListRef = useRef([]);
    const [somCodeList, setSomCodeList] = useState([]);

    const formMethods = useForm({ defaultValues: createInitialFilters() });
    const { setValue, getValues } = formMethods;

    // 실제 DatePicker가 dayjs 등을 요구한다면 이 함수에서 변환.
    // API의 YYYYMM 문자열을 그대로 setValue하면 오류가 날 수 있음.
    const applyFormValues = useCallback((values) => {
        Object.entries(values).forEach(([key, value]) => {
            setValue(key, value);
        });
    }, [setValue]);

    // aaa01의 조회 결과를 Tab에서 전달받음 (API 호출 X).
    // item.type / item.code는 메모장2에서 사용한 예시 필드이므로 실제 응답에 맞춰 교체.
    const applyInitialData = useCallback((rows) => {
        if (initialFiltersRef.current) return null; // 최초 1회만 적용

        const initialValues = createInitialFilters();
        (rows ?? []).forEach((item) => {
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

        initialFiltersRef.current = { ...initialValues };
        setFilters(initialValues);
        applyFormValues(initialValues);
        return formatMonth(initialValues.somMonth); // Tab이 aaa02 조회에 사용
    }, [applyFormValues]);

    // aaa02의 조회 결과를 Tab에서 전달받음 (API 호출 X).
    // 옵션 변환 필드 item.plnVer도 기존 문서의 예시이므로 실제 필드로 변경.
    const applySomCodes = useCallback((rows) => {
        const options = (rows ?? []).map((item) => ({
            label: item.plnVer,
            value: item.plnVer
        }));
        setSomCodeList(options);
        setValue('somCd', options[0]?.value ?? null);

        // 최초 SOM 코드 목록은 초기화용으로 1회 저장
        if (initialSomCodeListRef.current.length === 0 &&
            initialFiltersRef.current &&
            formatMonth(getValues('somMonth')) === formatMonth(initialFiltersRef.current.somMonth)) {
            initialSomCodeListRef.current = options;
            initialFiltersRef.current.somCd = options[0]?.value ?? null;
        }
    }, [getValues, setValue]);

    // SOM 월 변경: 검색조건만 변경. API 호출은 Tab의 setSomMonth가 담당.
    const handleSomMonthChange = useCallback((newMonth) => {
        setValue('somMonth', newMonth);
        setValue('somCd', null);
        setSomCodeList([]);
        return formatMonth(newMonth);
    }, [setValue]);

    // 초기화: 최초값/옵션 복원. API 재조회 X, reset() 미사용.
    const resetFilters = useCallback(() => {
        if (!initialFiltersRef.current) return;
        applyFormValues(initialFiltersRef.current);
        setFilters({ ...initialFiltersRef.current });
        setSomCodeList(initialSomCodeListRef.current);
    }, [applyFormValues]);

    const getSearchParams = useCallback(() => {
        const params = getValues();
        return {
            ...params,
            stockMonth: formatMonth(params.stockMonth),
            salesDemandWeek: formatWeek(params.salesDemandWeek),
            somMonth: formatMonth(params.somMonth),
            salesResultMonth: formatMonth(params.salesResultMonth),
            inboundDemandWeek: formatWeek(params.inboundDemandWeek)
        };
    }, [getValues]);

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

## 연결 시 주의

- `RPA000.jsx`는 기존처럼 `useRPA000Search()`를 호출하고, 반환 함수들을 `getPaneProps()`로 `RPA000Tab`에 전달합니다.
- `RPA000Tab.jsx`는 `useRPA000Fetch(tabId)`를 호출합니다. Fetch의 `initialData`가 들어오면 `applyInitialData(initialData)`를 호출하고, 반환된 SOM 월을 `setSomMonth()`에 전달합니다.
- Fetch의 `somCodeData`가 갱신되면 `applySomCodes(somCodeData)`를 호출합니다. SOM 월 변경 이벤트에서는 `setSomMonth(handleSomMonthChange(newMonth))`를 호출합니다.
- 조회 버튼은 `search(getSearchParams())`로 연결합니다.
- **중요:** 초기화할 때는 `resetFilters()`만 실행하고 `setSomMonth()`를 호출하지 않으면 초기화로 인한 SOM API 재조회는 발생하지 않습니다. 기존 Fetch의 SOM 월과 폼 월이 일시적으로 다를 수 있으므로 이후 이벤트 연결을 확인해야 합니다.
- `applyInitialData`는 최초 한 번만 적용합니다. `applySomCodes`는 SOM 조회 결과가 갱신될 때 호출해야 하며, 오래된 응답이 뒤늦게 도착하는 경우에 대한 보호는 실제 Tab 구현에서 확인해야 합니다.
- **날짜 값 타입 주의:** 기존 프로젝트의 DatePicker가 Dayjs를 기대하면 `applyFormValues`에서 월·주차 값을 해당 타입으로 변환해야 합니다. 이 예시는 실제 컴포넌트 타입을 알 수 없어 임의 변환하지 않았습니다.
- 메모장2의 `item.type`, `item.code`, `item.plnVer`, ISO 주차 변환은 검증된 실제 응답 규격이 아닌 예시입니다.
