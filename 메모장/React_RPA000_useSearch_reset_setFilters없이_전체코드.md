# useaaaSearch - reset 기반 최초 월·주차 조회 (setFilters 미사용)

기존 GitHub 메모장은 수정하지 않고 새로 작성한 예제입니다.

- 기존 `const [filters] = useState(createInitialFilters)` 유지
- 기존 `useForm({ defaultValues: createInitialFilters() })` 유지
- API 최초 조회 결과는 `reset(initialValues)`로 반영
- 초기화 버튼은 `reset()`으로 최초 조회값 복원
- SOM 월 변경은 `setValue()`로 처리
- 최초 SOM 코드 옵션은 ref에 보관해 초기화 시 복원

> **주의**: `getInitialMonthWeek`, `getSomCodeList`는 기존 베이스의 예시 API 함수명입니다. 실제 API로 교체하세요. 폼 필드가 React Hook Form과 연결되어 있어야 `reset`이 화면에 반영됩니다.

```jsx
import { useState, useEffect, useCallback, useRef } from 'react';
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

export function useaaaSearch() {
    const [filters] = useState(createInitialFilters);
    const initialSomCodesRef = useRef([]);
    const [somCodeList, setSomCodeList] = useState([]);

    const formMethods = useForm({
        defaultValues: createInitialFilters()
    });

    const { reset, setValue, getValues } = formMethods;

    const loadSomCodes = useCallback(async (somMonth) => {
        if (!somMonth) {
            setSomCodeList([]);
            return [];
        }

        // 실제 프로젝트 API 함수로 교체
        const result = await getSomCodeList({ somMonth });
        const list = result.data ?? [];
        const options = list.map((item) => ({
            label: item.plnVer,
            value: item.plnVer
        }));
        setSomCodeList(options);
        return list;
    }, []);

    const handleSomMonthChange = useCallback(async (newMonth) => {
        setValue('somMonth', newMonth);
        setValue('somCd', null);
        setSomCodeList([]);

        if (!newMonth) return;

        try {
            // API 요청 시에만 YYYYMM 변환
            const somMonth = dayjs(newMonth).format('YYYYMM');
            const list = await loadSomCodes(somMonth);
            setValue('somCd', list[0]?.plnVer ?? null);
        } catch (error) {
            console.error('SOM 코드 조회 실패', error);
        }
    }, [loadSomCodes, setValue]);

    useEffect(() => {
        let cancelled = false;

        const loadInitialFilters = async () => {
            try {
                // 실제 프로젝트 API 함수로 교체
                const result = await getInitialMonthWeek();
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

                const somCodes = await loadSomCodes(initialValues.somMonth);
                if (cancelled) return;

                initialSomCodesRef.current = somCodes.map((item) => ({
                    label: item.plnVer,
                    value: item.plnVer
                }));
                initialValues.somCd = somCodes[0]?.plnVer ?? null;

                reset(initialValues);
            } catch (error) {
                if (!cancelled) {
                    console.error('초기 검색조건 조회 실패', error);
                }
            }
        };

        loadInitialFilters();
        return () => { cancelled = true; };
    }, [loadSomCodes, reset]);

    const resetFilters = useCallback(() => {
        reset();
        setSomCodeList(initialSomCodesRef.current);
    }, [reset]);

    const getSearchParams = () => {
        const params = getValues();

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

        return {
            ...params,
            stockMonth: formatMonth(params.stockMonth),
            salesDemandWeek: formatWeek(params.salesDemandWeek),
            somMonth: formatMonth(params.somMonth),
            salesResultMonth: formatMonth(params.salesResultMonth),
            inboundDemandWeek: formatWeek(params.inboundDemandWeek)
        };
    };

    return {
        filters,
        formMethods,
        resetFilters,
        somCodeList,
        handleSomMonthChange,
        getSearchParams
    };
}
```

## 적용 전 확인

1. `filters`는 최초 null 값으로 고정됩니다. 필드가 `filters` 자체를 표시값으로 쓰는 경우 `reset`만으로는 갱신되지 않습니다.
2. 월·주차 필드에 전달하는 값은 컴포넌트가 요구하는 날짜 형식이어야 합니다. `reset`은 타입 변환을 하지 않습니다.
3. 주차 변환은 ISO 주차 기준의 예시입니다. DB 기준과 다르면 수정해야 합니다.
4. 최초 API 조회 후 `reset(initialValues)`가 실행되어야 이후 `reset()`이 해당 값으로 돌아갑니다.
5. 이전에 `reset` 반복 렌더링 문제가 있었으므로 의존성과 폼 연결 상태를 확인하세요.
