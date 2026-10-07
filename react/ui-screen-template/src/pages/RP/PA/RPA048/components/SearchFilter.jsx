import React from "react";

/**
 * RPA048 검색조건 UI
 *
 * 실제 프로젝트에서는 사내 공통 FormSearchFilter / DatePicker /
 * MultiCombo 컴포넌트로 교체해서 사용한다.
 *
 * 검색조건
 * - 재고조회 월
 * - 판매 Demand 주차
 * - 수요 SOM 월
 * - 수요 SOM 코드
 * - 판매실적 월
 * - 입고 Demand 주차
 */
const SearchFilter = () => {
  return (
    <div className="search-filter">
      <div>재고조회 월</div>
      <div>판매 Demand 주차</div>
      <div>수요 SOM 월</div>
      <div>수요 SOM 코드</div>
      <div>판매실적 월</div>
      <div>입고 Demand 주차</div>

      <div>
        <button type="button">초기화</button>
        <button type="button">조회</button>
      </div>
    </div>
  );
};

export default SearchFilter;
