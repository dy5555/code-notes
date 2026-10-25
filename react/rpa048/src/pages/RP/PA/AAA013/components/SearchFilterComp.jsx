import React from "react";

/**
 * [화면 표시 전용 컴포넌트]
 * 부모(Tab)가 전달한 searchFilter를 화면에 보여 줍니다.
 * 여기서는 API를 호출하지 않습니다.
 *
 * TODO: 아래 기본 input을 사내 공통 DatePicker / WeekPicker로 교체하세요.
 * 월은 dayjs로 보관하고 있으므로 표시할 때 YYYY-MM으로 변환합니다.
 * 주차는 서버 원본 문자열을 임시로 표시합니다(WeekPicker 규격 확인 필요).
 */
const SearchFilterComp = ({ searchFilter, loading, error }) => {
  const monthText = (value) => value?.format?.("YYYY-MM") ?? "";
  return (
    <div className="search-filter">
      <label>재고조회 월 <input readOnly value={monthText(searchFilter.stockMonth)} /></label>
      <label>판매 Demand 주차 <input readOnly value={searchFilter.salesDemandWeek ?? ""} /></label>
      <label>수요 SOM 월 <input readOnly value={monthText(searchFilter.somMonth)} /></label>
      <label>수요 SOM 코드 <input readOnly value={searchFilter.somCds.join(", ")} /></label>
      <label>판매실적 월 <input readOnly value={monthText(searchFilter.salesResultMonth)} /></label>
      <label>입고 Demand 주차 <input readOnly value={searchFilter.inboundDemandWeek ?? ""} /></label>
      {loading && <div>월·주차 초기값을 조회하는 중입니다.</div>}
      {error && <div role="alert">{error}</div>}
      <div>
        <button type="button" disabled>초기화</button>
        <button type="button" disabled>조회</button>
      </div>
    </div>
  );
};

export default SearchFilterComp;
