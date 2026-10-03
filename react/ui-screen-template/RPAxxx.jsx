import React from "react";
import SearchFilter from "./RPAxxx/components/SearchFilter";
import ResultGrid from "./RPAxxx/components/ResultGrid";
import useRPAxxxFilter from "./RPAxxx/hooks/useRPAxxxFilter";
import useRPAxxxGrid from "./RPAxxx/hooks/useRPAxxxGrid";

/**
 * RPAxxx 메인 화면
 * 메인에서는 화면 조립과 Hook 연결만 담당한다.
 */
const RPAxxx = () => {
  const filter = useRPAxxxFilter();
  const grid = useRPAxxxGrid(filter.searchFilter);

  return (
    <div>
      <SearchFilter
        values={filter.searchFilter}
        somCodeOptions={filter.somCdOptions}
        onChange={filter.handleFilterChange}
        onSomCodeChange={filter.handleSomCdChange}
        onReset={filter.handleFilterReset}
        onSearch={grid.handleSearch}
      />

      <div className="correction-area">
        <span>보정 가능 데이터 : {grid.correctionAvailableCnt}건</span>

        <button
          type="button"
          onClick={grid.handleBatchCorrection}
          disabled={grid.correctionAvailableCnt <= 0 || grid.loading}
        >
          일괄보정
        </button>
      </div>

      <ResultGrid
        rowData={grid.rowData}
        columnDefs={grid.columnDefs}
        loading={grid.loading}
      />
    </div>
  );
};

export default RPAxxx;
