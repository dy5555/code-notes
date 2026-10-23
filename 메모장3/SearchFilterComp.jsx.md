# SearchFilterComp.jsx — SOM 월 이벤트 연결 예시

> 실제 회사 SearchFilterComp 퍼블리싱 소스가 아니므로 전체 교체하지 마세요. **기존 JSX / SearchConditionForm / 이벤트 구조는 유지**하고 SOM 월 변경 연결 부분만 참고하세요.

```jsx
import PropTypes from 'prop-types';

// 실제 프로젝트의 SearchConditionForm / DatePicker import는 기존 코드 유지
export default function SearchFilterComp({
    filters,
    formMethods,
    somCodeList,
    disabledSearchBox,
    initialStockMonth,
    initialSalesResultMonth,
    onSomMonthChange
}) {
    // 공통 SearchConditionForm의 기존 disabled prop에 disabledSearchBox 전달:
    // <SearchConditionForm
    //     {...기존Props}
    //     disabled={disabledSearchBox}
    // />
    // 기존 필터 UI 및 폼 컴포넌트는 유지
    // 실제 JSX에서 쓰는 props만 구조분해하세요. 조회/초기화 버튼이
    // 이 컴포넌트 안에 있다면 기존 버튼 이벤트에 handleSearch/handleReset을 연결하세요.
    // 재고조회 월(stockMonth) DatePicker에는 최초 API 조회 월 이후를 비활성화:
    // disabledDate={(current) =>
    //     Boolean(current && initialStockMonth && current.isAfter(initialStockMonth, 'month'))
    // }
    // 예: 최초 202610이면 202611부터 선택 불가. 현재 선택값을 상한으로 쓰지 마세요.
    // 판매실적 월(salesResultMonth) DatePicker에도 동일한 상한 적용:
    // disabledDate={(current) =>
    //     Boolean(current && initialSalesResultMonth && current.isAfter(initialSalesResultMonth, 'month'))
    // }
    // SOM 월 필드의 RHF Controller render 내부에서만 다음처럼 연결:
    //
    // <DatePicker
    //     {...field}
    //     onChange={(newMonth) => {
    //         field.onChange(newMonth);     // RHF 폼 값 변경
    //         onSomMonthChange(newMonth);  // SOM 코드 초기화 및 조회 월 변경
    //     }}
    // />
    //
    // 이미 기존 handleSomMonthChange 이벤트가 있다면
    // 해당 이벤트 안에서 onSomMonthChange(newMonth)를 호출하세요.
    // 별도 중복 이벤트를 만들지 마세요.

    return (
        <>
            {/* 기존 SearchConditionForm, 조회조건 JSX, 조회/초기화 버튼을 그대로 유지 */}
            {/* 기존 컴포넌트에 formMethods 통째로 전달 */}
            {/* SOM 코드 옵션에는 somCodeList 사용 */}
        </>
    );
}

SearchFilterComp.propTypes = {
    filters: PropTypes.object,
    formMethods: PropTypes.object,
    somCodeList: PropTypes.array,
    disabledSearchBox: PropTypes.bool,
    initialStockMonth: PropTypes.object,
    initialSalesResultMonth: PropTypes.object,
    onSomMonthChange: PropTypes.func
};
```

## 조회 버튼 비활성화

기존 공통 `SearchConditionForm`은 `disabled` prop을 지원하므로 수정하지 않습니다. 기존 `disabledSearchBox`를 `useRPA000Search`에서 관리하고, SOM 코드 목록이 없을 때 true로 설정해 `SearchConditionForm disabled={disabledSearchBox}`로 전달합니다. 이 문서의 JSX는 연결 예시이며 회사의 실제 UI를 교체하지 마세요.

## 재고조회 월 상한 연결

`useRPA000Search()`가 기존 `initialFiltersRef.current.stockMonth`에서 반환하는 `initialStockMonth`를 `RPA000.jsx`의 기존 `getPaneProps()`를 통해 `RPA000Tab.jsx`에 전달하고, 다시 `SearchFilterComp`로 전달하세요. 기존 재고조회 월 DatePicker에만 위 `disabledDate`를 추가합니다. 초기 조회 월은 변경하지 않으며 다른 월 선택에도 상한이 움직이지 않습니다.

## 판매실적 월 상한 연결

최초 `SALES_ACT_YM`으로 설정된 `salesResultMonth`를 `initialFiltersRef`에서 읽어 `initialSalesResultMonth`로 전달합니다. 판매실적 월 DatePicker에만 해당 `disabledDate`를 추가하세요. 재고조회 월 제한과 각각 독립적으로 적용됩니다.

## 연결 흐름

```text
RPA000Tab.jsx
  onSomMonthChange(newMonth)
    ├─ handleSomMonthChange(newMonth)  // somCd 및 옵션 초기화
    └─ setSomMonth(newMonth)          // Fetch Hook에서 SOM 코드 재조회
       ↓ prop 전달
SearchFilterComp.jsx
  기존 SOM 월 필드 onChange
    ├─ field.onChange(newMonth)       // RHF 값 갱신
    └─ onSomMonthChange(newMonth)     // Tab 콜백 호출
```

- **기존 RHF 바인딩을 유지**하세요. `onSomMonthChange`만 호출하고 `field.onChange`를 생략하면 폼의 SOM 월이 갱신되지 않을 수 있습니다.
- 기존 `handleSomMonthChange`가 있다면 이름을 바꾸지 말고 그 안에서 전달받은 콜백을 호출하면 됩니다.
- 조회/초기화 버튼이 이 컴포넌트 안에 있다면 `handleSearch`, `handleReset`을 props로 받아 실제 버튼에 연결하세요. 버튼이 다른 컴포넌트에 있다면 여기서 선언할 필요 없습니다.
- 기존 검색/초기화 버튼의 타입과 이벤트 연결을 유지하세요. 이 문서의 `return`은 설명용이며 실제 화면을 렌더링하지 않습니다.
