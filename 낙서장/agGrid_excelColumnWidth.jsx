/**
 * AG Grid 엑셀 다운로드 시 컬럼 너비를 화면 그리드 너비 그대로 내보내기
 *
 * - defaultExcelExportParams 를 <AgGridReact> 에 넣으면
 *   exportDataAsExcel() 을 어디서 호출하든 이 옵션이 기본 적용됨
 * - 엑셀에서 좁아 보이면 EXCEL_WIDTH_RATIO 를 1.2 ~ 1.5 로 조정
 */

const EXCEL_WIDTH_RATIO = 1.0;   // 화면 너비 대비 엑셀 너비 비율
const DEFAULT_COL_WIDTH = 100;   // 컬럼 정보가 없을 때 기본 너비(px)

// 엑셀 컬럼 너비 계산: 화면 그리드 컬럼 너비 기준
const getExcelColWidth = (params) => {
  const gridColWidth = params.column?.getActualWidth() ?? DEFAULT_COL_WIDTH;
  return Math.round(gridColWidth * EXCEL_WIDTH_RATIO);
};

// ─────────────────────────────────────────────
// 방법 1. 그리드 기본 옵션으로 지정 (권장)
// ─────────────────────────────────────────────
<AgGridReact
  ref={gridRef}
  rowData={rowData}
  columnDefs={columnDefs}
  defaultExcelExportParams={{
    columnWidth: getExcelColWidth,
  }}
/>

// ─────────────────────────────────────────────
// 방법 2. 다운로드 호출부에 직접 지정
// ─────────────────────────────────────────────
gridRef.current.api.exportDataAsExcel({
  fileName: '목록.xlsx',
  columnWidth: getExcelColWidth,
});
