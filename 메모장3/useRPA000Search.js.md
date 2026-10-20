# useRPA000Search.js — Fetch 분리 수정본

> 기존 퍼블리싱 구조 유지. API 호출 없음. 최초값/초기 SOM 코드 목록을 보관하고, 검색조건 변경 및 초기화만 담당.

```jsx
import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isoWeekYear from 'dayjs/plugin/isoWeekYear';

dayjs.extend(isoWeek);
dayjs.extend(isoWeekYear);

// Hook 밖: 렌더링마다 재선언할 필요가 없는 순수 함수
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
    const { setValue, getValues } = formMethods;

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
        // 최초 1회만 각 검색조건 설정 (공통 반복 setValue 함수 사용 안 함)
        setValue('stockMonth', values.stockMonth);
        setValue('salesDemandWeek', values.salesDemandWeek);
        setValue('somMonth', values.somMonth);
        setValue('somCd', values.somCd);
        setValue('salesResultMonth', values.salesResultMonth);
        setValue('inboundDemandWeek', values.inboundDemandWeek);
        return formatMonth(values.somMonth);
    }, [setValue]);

    // aaa02 결과를 전달받아 옵션 갱신 및 첫 코드 선택
    // 조회 요청에 사용한 월도 함께 받아, 현재 선택 월과 다른 늦은 응답은 무시
    const applySomCodes = useCallback((rows, requestedMonth) => {
        if (formatMonth(getValues('somMonth')) !== requestedMonth) return;

        // item.plnVer는 메모장2의 예시 응답 필드
        const options = (rows ?? []).map((item) => ({
            label: item.plnVer,
            value: item.plnVer
        }));

        setSomCodeList(options);
        setValue('somCd', options[0]?.value ?? null);

        // null로 구분하므로 최초 옵션이 []여도 다시 덮어쓰지 않음
        if (initialSomCodeListRef.current === null &&
            initialFiltersRef.current !== null &&
            requestedMonth === formatMonth(initialFiltersRef.current.somMonth)) {
            initialSomCodeListRef.current = [...options];
            initialFiltersRef.current.somCd = options[0]?.value ?? null;
        }
    }, [getValues, setValue]);

    // SOM 월 변경: API 호출 없이 현재 선택 상태만 변경
    const handleSomMonthChange = useCallback((newMonth) => {
        setValue('somMonth', newMonth);
        setValue('somCd', null);
        setSomCodeList([]);
        return formatMonth(newMonth); // Tab이 Fetch의 setSomMonth에 전달
    }, [setValue]);

    // 초기화: 저장한 최초값 복원, reset() 및 API 호출 없음
    const resetFilters = useCallback(() => {
        if (initialFiltersRef.current === null) return;

        const initial = { ...initialFiltersRef.current };
        // 초기화 버튼에서만 실행. reset() 또는 전체 필드 반복 함수 사용 안 함
        setValue('stockMonth', initial.stockMonth);
        setValue('salesDemandWeek', initial.salesDemandWeek);
        setValue('somMonth', initial.somMonth);
        setValue('somCd', initial.somCd);
        setValue('salesResultMonth', initial.salesResultMonth);
        setValue('inboundDemandWeek', initial.inboundDemandWeek);
        setFilters(initial);
        setSomCodeList(initialSomCodeListRef.current ?? []);
    }, [setValue]);

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

## RPA000Tab.jsx 연결 시 주의

- `RPA000.jsx`에서 `useRPA000Search()`를 호출하고 반환 함수를 기존 `getPaneProps()`로 Tab에 전달.
- Tab에서 `useRPA000Fetch(tabId)` 호출.
- 최초 `initialData` 성공 시 `applyInitialData(initialData)` 호출. Hook 내부의 `initialFiltersRef`가 최초 한 번만 적용하도록 방어하며, Tab effect에서 매 렌더마다 재호출하지 않도록 의존성을 점검. 반환한 월이 있으면 `setSomMonth(월)` 호출.
- SOM 코드 조회 성공 시 `applySomCodes(somCodeData, somMonth)` 호출. 단, **조회 결과가 확정된 현재 월**에 대해서만 적용. React Query의 `isSuccess`와 `somMonth`를 확인.
- SOM 월 변경 시 `setSomMonth(handleSomMonthChange(newMonth))`.
- 초기화 시 `resetFilters()`를 호출하고, Fetch의 `setSomMonth(null)`도 호출해 이전 SOM 조회 상태를 비활성화. **기존 캐시/응답을 다시 폼에 적용하는 effect가 없도록 조건 확인**. 이후 사용자가 SOM 월을 선택하면 다시 조회 가능.
- 메인 조회는 `search(getSearchParams())` → `gridData`를 TableComp로 전달.

## 확인이 필요한 실제 프로젝트 사항

1. `item.type`, `item.code`, `item.plnVer`는 기존 문서의 **가상 응답 필드**. 실제 필드로 교체.
2. 최초 월·주차는 최초 한 번만 개별 `setValue()`로 적용합니다. 초기화도 버튼 클릭 시 개별 적용하며 `reset()`/공통 반복 함수는 사용하지 않습니다. 단, 기존 DatePicker가 문자열을 정상 표시하는지 확인하세요. 날짜 변환은 `getSearchParams()`에서 검색 API 요청을 만들 때만 수행합니다.
3. `formatWeek`는 ISO 주차 기준 예시. 실제 업무 주차 규칙 확인.
4. SOM 옵션 조회 실패/재시도와 초기화의 순서가 겹치는 경우, Tab의 useEffect 조건을 함께 확인해야 함.
5. 기존 `filters` 상태는 퍼블리싱 호환을 위해 유지. 실제 폼 입력의 현재값은 `formMethods`가 관리.
