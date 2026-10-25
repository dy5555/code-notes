import React from "react";
import SearchFilterComp from "../components/SearchFilterComp";
import TableComp from "../components/TableComp";
import useRPA000Search from "../hooks/useRPA000Search";

/**
 * [Tab의 역할]
 * 1. Hook을 호출해 검색조건 값을 가져옵니다.
 * 2. props로 SearchFilterComp에 값을 전달합니다.
 * 3. 검색 컴포넌트는 전달받은 값을 표시하기만 합니다.
 */
const RPA000Tab = () => {
  // 구조 분해 할당: Hook이 반환한 객체에서 필요한 값만 꺼냅니다.
  const { searchFilter, loading, error } = useRPA000Search();

  return (
    <div>
      <SearchFilterComp searchFilter={searchFilter} loading={loading} error={error} />
      <div className="correction-area">
        <span>보정 가능 데이터 : 0건</span>
        <button type="button" disabled>일괄보정</button>
      </div>
      <TableComp />
    </div>
  );
};

export default RPA000Tab;
