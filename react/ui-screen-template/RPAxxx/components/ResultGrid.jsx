import React from "react";
import { AgGridReact } from "ag-grid-react";

/**
 * 조회 결과 Grid 영역
 *
 * Grid 자체의 표현만 담당한다.
 * 데이터 조회/API 호출은 useRPAxxxGrid.js에서 처리한다.
 */
const ResultGrid = ({ rowData, columnDefs, loading }) => {
  return (
    <div className="ag-theme-alpine" style={{ width: "100%", height: 500 }}>
      {loading && <div>조회 중...</div>}

      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        // 공통 기본 컬럼 옵션은 프로젝트 규칙에 맞게 추가
        defaultColDef={{
          sortable: true,
          resizable: true,
          filter: true,
        }}
      />
    </div>
  );
};

export default ResultGrid;
