import React from "react";
import SearchFilter from "./RPA048/components/SearchFilter";
import ResultGrid from "./RPA048/components/ResultGrid";

/**
 * RPA048 메인 화면
 *
 * 현재는 UI 구성만 유지한다.
 * API / 조회 / 보정 로직은 이후 실제 프로젝트 패턴에 맞춰 추가한다.
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
