# AAA013 useSearch - 최초 월·주차 조회 및 초기화

기존 `useForm`, `reset()`, `resetFilters()` 구조를 유지한 예제입니다.

```jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isoWeekYear from 'dayjs/plugin/isoWeekYear';

dayjs.extend(isoWeek);
dayjs.extend(isoWeekYear);

export function useAAA013Search() {

    // 1. API에서 조회한 최초 월·주차 보관
    // 사용자가 검색조건을 변경해도 이 값은 유지됨
    const initialFiltersRef = useRef(null);

    // 2. 초기 검색조건 생성
    // API 조회 전 사용할 기본 검색조건
    const createInitialFilters = () => ({
        stockMonth: null,
        salesDemandWeek: null,
        somMonth: null,
        somCd: null, // 단일 선택 SOM 코드
        salesResultMonth: null,
        inboundDemandWeek: null
    });

    // 3. 기존 filters
    const [filters, setFilters] = useState(createInitialFilters);

    // SOM 월에 해당하는 코드 목록 (단일 선택 콤보 옵션)
    const [somCodeList, setSomCodeList] = useState([]);

    // 4. 기존 React Hook Form
    const formMethods = useForm({
        defaultValues: createInitialFilters()
    });

    const { reset, setValue } = formMethods;

    // SOM 코드 목록 공통 조회: 최초 진입과 SOM 월 변경 시 함께 사용
    const loadSomCodes = useCallback(async (somMonth) => {
        if (!somMonth) {
            setSomCodeList([]);
            return [];
        }

        // 실제 프로젝트 API 함수로 교체
        const result = await getSomCodeList({ somMonth });
        const list = result.data ?? [];

        // SelectField용 옵션: plnVer 컬럼만 표시/선택
        const options = list.map((item) => ({
            label: item.plnVer,
            value: item.plnVer
        }));
        setSomCodeList(options);

        // 최초 선택값 설정에 사용할 원본 목록 반환
        return list;
    }, []);

    // SOM 월 변경 시 호출할 함수 (MonthPickerField의 onChange에 연결)
    const handleSomMonthChange = useCallback(async (newMonth) => {
        // 월 변경 시 이전 선택값을 먼저 비움
        // 변경된 SOM 필드만 React Hook Form에 반영 (다른 월·주차 유지)
        setValue('somMonth', newMonth);
        setValue('somCd', null);
        setSomCodeList([]);
        try {
            // DatePicker 값은 그대로 보관하고 API 요청값만 YYYYMM으로 변환
            const plnYm = dayjs(newMonth).format('YYYYMM');
            const list = await loadSomCodes(plnYm);
            // 변경된 월에서도 조회 결과 첫 번째 코드를 기본 선택
            const firstSomCd = list[0]?.plnVer ?? null;
            setValue('somCd', firstSomCd);
        } catch (error) {
            console.error('SOM 코드 조회 실패', error);
        }
    }, [loadSomCodes, setValue]);

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

                // 최초 SOM 월로 코드 목록 조회하고 첫 번째 코드 선택
                const somCodes = await loadSomCodes(initialValues.somMonth);
                initialValues.somCd = somCodes[0]?.plnVer ?? null;

                // 최초 조회한 검색조건 전체 보관
                initialFiltersRef.current = initialValues;

                // SearchFilterComp에 전달할 filters 갱신
                setFilters(initialValues);

                // 주의: 기존 화면에서 reset() 실행 시 반복 렌더링 발생
                // 원인 확인 전까지 최초 조회에서는 호출하지 않음
                // reset(initialFiltersRef.current);

            } catch (error) {
                console.error('초기 검색조건 조회 실패', error);
            }
        };

        loadInitialFilters();

    }, [loadSomCodes]);

    // 6. 기존 초기화 함수
    const resetFilters = useCallback(() => {

        if (!initialFiltersRef.current) return;

        // 최초 API 조회값으로 filters와 React Hook Form을 함께 복원
        const initialValues = { ...initialFiltersRef.current };
        setFilters(initialValues);
        reset(initialValues);

    }, [reset]);

    // 7. 메인 조회 API에 전달할 검색조건 생성
    // DatePicker의 내부 값은 유지하고 월 필드만 YYYYMM으로 변환
    const getSearchParams = () => {
        const params = formMethods.getValues();

        const formatMonth = (value) =>
            value ? dayjs(value).format('YYYYMM') : null;

        // DB 주차가 ISO 주차 기준(YYYYWW)이라는 가정
        const formatWeek = (value) => {
            if (!value) return null;
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

    // 8. 다른 컴포넌트에서 사용
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

## 수정 사항 (SOM 월 변경 시 다른 검색조건 초기화 방지)

- `handleSomMonthChange()` 안의 `setFilters((prev) => ...)` 두 군데를 삭제했습니다.
- SOM 월·코드는 `setValue()`로만 변경하고, 기존 다른 월·주차 입력값은 유지합니다.
- 최초 조회의 `setFilters(initialValues)`와 기존 초기화 함수는 유지했습니다. 다만 초기화 함수의 `reset()` 동작은 별도 검증이 필요합니다.
- 다른 곳에서 `filters.somMonth` 또는 `filters.somCd`를 읽는 경우에는 변경값이 반영되지 않을 수 있으므로 폼 값 사용 여부를 확인해야 합니다.

## SOM 코드 목록 연결

- `somCodeList`: SOM 월 기준 조회한 단일 선택 콤보 옵션 목록. `loadSomCodes()`에서 원본 조회 결과의 `plnVer`를 `{ label, value }`로 변환해 저장합니다. 실제 컴포넌트의 옵션 prop에 전달합니다.
- `handleSomMonthChange(newMonth)`: SOM 월 변경 이벤트에서 호출합니다. DatePicker의 `newMonth` 값은 그대로 유지하고 API 요청 시에만 `dayjs(newMonth).format('YYYYMM')`으로 변환합니다. `setValue`로 React Hook Form의 SOM 월·코드 필드만 동기화하며 다른 월·주차는 유지합니다.
- `getSomCodeList`: 예시 API 이름이므로 실제 함수로 교체해야 합니다.
- `somCd`: 선택된 SOM 코드 1개. 최초 조회 및 SOM 월 변경 시 목록의 첫 번째 `plnVer`를 자동 선택합니다. 목록이 비면 `null`입니다.
- 최초 선택은 원본 목록의 `somCodes[0]?.plnVer`를 사용합니다. `SelectField`에서 `options={somCodeList}`로 연결하되, 프로젝트 컴포넌트가 `{ label, value }` 형식을 지원하는지 확인해야 합니다.

## 동작 예시

| 상황 | 재고 월 |
|---|---|
| 최초 화면 진입 | `null` |
| API 조회 완료 | `202609` |
| 사용자가 월 변경 | `202608` |
| 초기화 버튼 클릭 | `202609` |

**주의:** `getInitialMonthWeek()`는 예시 API 함수명이므로 실제 프로젝트 함수로 교체해야 합니다. API 조회 후 `setFilters()`로 검색조건을 갱신합니다. 이전 테스트에서 최초 조회 시 `reset()`으로 반복 렌더링이 발생해 해당 호출은 주석 상태로 유지했습니다. `resetFilters()`는 `setFilters()`와 `reset()`을 함께 호출하도록 수정했습니다. 초기화 버튼에서 `reset()` 반복 렌더링 여부는 별도 검증이 필요합니다. `MonthPickerField`에 값이 표시되려면 폼 연결 및 날짜 형식이 맞아야 합니다.

## 메인 조회조건 변환 추가

- `getSearchParams()`를 필터 Hook에 추가하고 반환 객체에 포함했습니다.
- 월 필드 `stockMonth`, `somMonth`, `salesResultMonth`만 `YYYYMM` 문자열로 변환합니다. `somCd`는 그대로 유지합니다.
- **주차** `salesDemandWeek`, `inboundDemandWeek`는 `YYYYWW` 형식(예: `202640`)으로 변환하도록 추가했습니다. 현재는 **ISO 주차 기준**으로 구현했으며, DB 주차 계산 기준이 다르면 맞춰 수정해야 합니다. 연말 연초 경계는 `isoWeekYear()`를 사용합니다.
- Tab에서 `await search(getSearchParams());`로 호출합니다. `getSearchParams`도 기존 Hook → 메인 → Tab Props 경로로 전달해야 합니다.
- 참고: 날짜 필드에 실제로 밀리초 숫자가 들어 있다면 dayjs가 변환할 수 있습니다. 최초 API의 `YYYYMM` 문자열이 폼에 그대로 남아 있는 경우에는 해당 문자열의 파싱 방식도 확인해야 합니다.

### 주차 형식 확인

- `202640`은 2026년 40주차를 의미합니다. DB가 ISO 주차(월요일 시작, ISO 주차 연도)를 쓰는지 확인하세요.
- DatePicker가 반환하는 값이 날짜 타임스탬프/객체일 때 위 변환을 사용합니다. 값이 이미 `202640` 문자열이라면 다시 날짜로 해석하지 말고 그대로 보내야 합니다.
