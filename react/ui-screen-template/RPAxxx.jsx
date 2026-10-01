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
 * 3. 실제 업무 로직은 가급적 Hook으로 분리한다.
 */
const RPAxxx = () => {
  // 검색조건 및 초기값 관리
  const filter = useRPAxxxFilter();

  // 필터 값을 기준으로 메인 조회 및 Grid 데이터를 관리
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

      <ResultGrid
        rowData={grid.rowData}
        columnDefs={grid.columnDefs}
        loading={grid.loading}
      />
    </div>
  );
};

export default RPAxxx;
