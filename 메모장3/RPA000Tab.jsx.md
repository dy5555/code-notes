# RPA000Tab.jsx — Search / Fetch 연결 예시

> 기존 Tab 퍼블리싱을 교체하지 말고 **아래 연결 부분만 기존 코드에 반영**하세요. SearchFilterComp / TableComp의 실제 props 이름과 tabId 취득 방식은 기존 소스를 유지합니다.

```jsx
import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { useRPA000Fetch } from '../hooks/useRPA000Fetch';
// 기존 SearchFilterComp, TableComp import는 유지

export default function RPA000Tab({
    tabId,
    // RPA000.jsx에서 useRPA000Search()를 호출하고 getPaneProps()로 전달
    filters,
    formMethods,
    somCodeList,
    applyInitialData,
    applySomCodes,
    handleSomMonthChange,
    resetFilters,
    getSearchParams
}) {
    const {
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
    } = useRPA000Fetch(tabId);

    // 최초 월·주차 결과는 Tab 생명주기에서 한 번만 적용.
    // Search Hook 내부 initialFiltersRef도 중복 적용을 방어함.
    const initialAppliedRef = useRef(false);

    useEffect(() => {
        if (!isInitialSuccess || initialAppliedRef.current) return;
        initialAppliedRef.current = true;

        const initialSomMonth = applyInitialData(initialData);
        if (initialSomMonth) setSomMonth(initialSomMonth);
    }, [isInitialSuccess, initialData, applyInitialData, setSomMonth]);

    // SOM 코드 결과를 현재 월에만 적용.
    // 동일 월/동일 결과 객체로 effect가 반복되어 선택값을 덮지 않도록 보호.
    const appliedSomRef = useRef({ month: null, data: null });

    useEffect(() => {
        if (!somMonth) {
            appliedSomRef.current = { month: null, data: null };
            return;
        }
        if (!isSomSuccess) return;

        if (appliedSomRef.current.month === somMonth &&
            appliedSomRef.current.data === somCodeData) return;

        appliedSomRef.current = { month: somMonth, data: somCodeData };
        applySomCodes(somCodeData, somMonth);
    }, [isSomSuccess, somCodeData, somMonth, applySomCodes]);

    // SOM 월 변경: 폼의 월 값은 RHF onChange가 반영; SOM 코드 초기화 및 Fetch 월 갱신
    const onSomMonthChange = (newMonth) => {
        handleSomMonthChange(newMonth);
        setSomMonth(newMonth ? dayjs(newMonth).format('YYYYMM') : null);
    };

    // 기존 퍼블리싱 함수명 유지: 조회 버튼
    const handleSearch = async () => {
        search(getSearchParams());
    };

    // 기존 퍼블리싱 함수명 유지: 초기화 버튼 (API 재조회 없음)
    const handleReset = async () => {
        resetFilters();
        setSomMonth(null); // 이전 SOM 결과가 초기화 후 다시 적용되지 않도록 중지
        appliedSomRef.current = { month: null, data: null };
        clearGrid(); // 기존 화면에서 초기화 시 그리드를 비우는 경우에만 유지
    };

    // 보정 가능 행만 확인 후 전송. 취소 시 API를 호출하지 않음.
    const handleBatchAdjust = () => {
        if (isAdjusting) return;

        const targets = (rowData ?? [])
            .filter((item) => item.gnlCrrYn === 'Y')
            .map((item) => ({
                salesProdId: item.salesProdId,
                tobeRpSomcd: item.tobeRpSomcd
            }));

        if (targets.length === 0) return;

        Modal.confirm({
            title: '일괄보정 확인',
            content: 'SOM CD 일괄보정을 진행하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: async () => {
                await batchAdjust({ adjustList: targets });
                search(getSearchParams()); // 성공 후 그리드/건수 재조회
                Modal.success({
                    title: '알림',
                    content: 'SOM CD 일괄 보정을 완료하였습니다.'
                });
            }
        });
    };

    // 기존 퍼블리싱의 handleSearch / handleReset 및 JSX prop 이름을 그대로 유지하세요.
    // 아래는 기존 퍼블리싱 JSX에 연결할 값만 표시한 예시입니다.
    // 실제 컴포넌트 props 명칭/그리드 구성은 기존 RPA000Tab.jsx를 유지하세요.
    return (
        <>
            {/* 기존 SearchFilterComp에 아래 값을 기존 prop 이름으로 전달
                filters, formMethods, somCodeList,
                onSomMonthChange, handleSearch, handleReset
            */}
            {/* 기존 TableComp에 rowData, isLoading, isSearched, handleBatchAdjust, isAdjusting 전달 */}
        </>
    );
}

// RPA000.jsx에서 RPA000Tab.jsx로 전달하는 props만 선언
RPA000Tab.propTypes = {
    tabId: PropTypes.string,
    filters: PropTypes.object,
    formMethods: PropTypes.object,
    somCodeList: PropTypes.array,
    applyInitialData: PropTypes.func,
    applySomCodes: PropTypes.func,
    handleSomMonthChange: PropTypes.func,
    resetFilters: PropTypes.func,
    getSearchParams: PropTypes.func
};
```

## 실제 프로젝트에 반영할 때 꼭 확인

1. **기존 함수명 `handleSearch`, `handleReset` 및 `async` 선언 방식 유지.** 기존 JSX의 이벤트 prop 이름도 변경하지 마세요. 위 return은 **설명용 자리표시자**입니다. 그대로 붙이면 검색 UI와 그리드가 표시되지 않습니다. 기존 Tab의 JSX를 그대로 두고 Hook/이벤트/useEffect 연결만 옮겨야 합니다.
2. `propTypes`는 **부모에서 전달받는 props**만 선언합니다. Tab 내부에서 만든 `handleSearch`, `handleReset`, `onSomMonthChange`, `appliedSomRef`는 Tab의 propTypes에 넣지 않습니다. 실제 `tabId` 자료형이 숫자이거나 필수라면 기존 정의에 맞춰 조정하세요.
3. `useRPA000Search`는 **RPA000.jsx에서 호출**, `useRPA000Fetch`는 **Tab에서 호출**. `getPaneProps()`가 필요한 props를 전달해야 합니다.
3. **중요:** 조회는 Search Hook의 `getSearchParams()`가 `formMethods.getValues()`로 화면의 현재 값을 읽습니다. SearchFilterComp / SearchConditionForm이 동일한 `formMethods`를 사용해야 합니다. SOM 월 필드는 RHF 기존 `onChange`로 값을 반영하면서 `onSomMonthChange`도 호출해 옵션을 다시 조회해야 합니다.
4. SOM 코드 조회용 `somMonth`는 Tab에서 `YYYYMM` 문자열로 변환합니다. RHF DatePicker 값은 그대로 유지합니다. `applySomCodes`는 요청 월과 현재 RHF 월을 `YYYYMM` 기준으로 비교합니다.
5. 초기화에서 `setSomMonth(null)`은 추가 SOM 조회를 막지만, **초기화 이후 다시 최초 SOM 월을 선택했을 때는 재조회할 수 있습니다.** 최초 옵션 목록은 Search Hook에 보관되어 있어 초기화 자체는 재조회하지 않습니다.
6. `clearGrid()`는 현재 Fetch 예시에서 React Query 캐시의 `rowData`를 직접 지우지 않습니다. 기존 회사의 그리드 초기화 처리 방식에 맞춰 유지하거나 교체하세요.
7. `initialAppliedRef`는 Tab 인스턴스 기준입니다. Tab이 언마운트 후 다시 마운트되면 재실행될 수 있으며, Search Hook의 `initialFiltersRef`도 함께 보호합니다.
8. `fetchaaa01301/02/03`, API 결과의 `item.type/code/plnVer`는 메모장3에서 아직 실제 프로젝트 응답과 대조되지 않은 **예시**입니다.

일괄보정은 현재 `rowData` 전체에서 `gnlCrrYn === 'Y'`인 행만 대상으로 합니다. Java는 전달받은 목록을 FOR 반복하여 `salesProdId`, `tobeRpSomcd`로 프로시저를 호출해야 합니다. 서버 DB 전체 재조회가 필요한 경우에는 API 설계를 변경해야 합니다.

> 일괄보정 확인창은 Ant Design `Modal.confirm` 예시입니다. 실제 사내 공통 Confirm/알림 Modal이 있으면 해당 컴포넌트로 교체하세요. 취소 시 호출하지 않고, 성공 시에만 재조회 및 완료 알림을 실행합니다. 요청 본문은 `{ adjustList: targets }` 형태입니다.
