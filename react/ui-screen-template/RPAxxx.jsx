import React from "react";
import SearchFilter from "./RPAxxx/components/SearchFilter";
import ResultGrid from "./RPAxxx/components/ResultGrid";
import useRPAxxxFilter from "./RPAxxx/hooks/useRPAxxxFilter";
import useRPAxxxGrid from "./RPAxxx/hooks/useRPAxxxGrid";

/**
 * RPAxxx 메인 화면
 *
 * 역할
 * 1. 필터 Hook과 Grid Hook을 연결한다.
 * 2. SearchFilter / ResultGrid 컴포넌트를 배치한다.
 * 3. 보정 가능 건수와 일괄보정 버튼을 표시한다.
 */
const RPAxxx = () => {
  const filter = useRPAxxxFilter();
  const grid = useRPAxxxGrid(filter.values);

  return (
    <div>
      <SearchFilter
        values={filter.values}
        somCodeOptions={filter.somCodeOptions}
        onChange={filter.handleChange}
        onSomCodeChange={filter.handleSomCodeChange}
        onReset={filter.resetFilter}
        onSearch={grid.search}
      />

      {/*
        보정 가능 데이터가 1건 이상일 때만 일괄보정 버튼 활성화
        예) 보정 가능 데이터 : 15건  [일괄보정]
      */}
      <div className="correction-area">
        <span>보정 가능 데이터 : {grid.correctionCount}건</span>

        <button
          type="button"
          onClick={grid.batchCorrect}
          disabled={grid.correctionCount <= 0 || grid.loading}
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
