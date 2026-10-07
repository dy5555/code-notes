import React from "react";
import SearchFilter from "./RPA048/components/SearchFilter";
import ResultGrid from "./RPA048/components/ResultGrid";

/**
 * RPA048
 * 현재는 UI 구성만 유지한다.
 * 기능/API 로직은 하나씩 추가한다.
 */
const RPA048 = () => {
  return (
    <div>
      <SearchFilter />

      <div className="correction-area">
        <span>보정 가능 데이터 : 0건</span>
        <button type="button" disabled>
          일괄보정
        </button>
      </div>

      <ResultGrid />
    </div>
  );
};

export default RPA048;
