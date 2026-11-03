import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Typography, Space } from 'antd';

// 그리드 컬럼
const columnDefs = [
    { headerName: '구분', field: 'category', width: 120 },
    { headerName: 'SALES_PROD_ID', field: 'salesProdId', width: 180 },
    { headerName: 'RP_SOM_CD', field: 'rpSomCd', width: 150 },
    { headerName: '일괄보정여부', field: 'gnlCrrYn', width: 130 },
    { headerName: '보정 RP_SOM_CD', field: 'tobeRpSomcd', width: 160 }
];

// 전체 컬럼 공통 옵션
const defaultColDef = {
    sortable: true,
    resizable: true
};

const EXCEL_FILE_NAME = 'SOM코드보정_조회결과';
const GRID_HEIGHT = 500;

// 행 고유키: salesProdId
const getRowId = (params) => String(params.data.salesProdId);

export default function TableComp({
    rowData,
    isLoading,
    isSearched,
    handleBatchAdjust,
    isAdjusting
}) {
    // 그리드 api 담을 ref
    const gridApi = useRef(null);

    // 그리드 준비 완료 시 api 저장
    const handleGridReady = (params) => {
        gridApi.current = params.api;
    };

    // 화면 그리드 기준 엑셀 다운로드 함수
    const { handleScreenExcelDownload } = useScreenExcelDownload({ gridApi });

    // 현재 조회된 rowData 중 보정 가능(gnlCrrYn === 'Y') 행 수
    const adjustCount = (rowData ?? []).filter(
        (item) => item.gnlCrrYn === 'Y'
    ).length;

    const noRowsMsg = isSearched
        ? '조회결과가 존재하지 않습니다.'
        : '조회조건을 선택한 후 조회하세요.';

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Typography.Text strong>조회 결과</Typography.Text>
                <Space>
                    <ToolbarExcel
                        onScreenExcelExport={handleScreenExcelDownload}
                        fileName={EXCEL_FILE_NAME}
                    />
                    <Button
                        type="primary"
                        onClick={handleBatchAdjust}
                        loading={isAdjusting}
                        disabled={isAdjusting || isLoading || adjustCount === 0}
                    >
                        {isAdjusting
                            ? '일괄보정 처리 중...'
                            : `보정 가능 데이터 : ${adjustCount}건 일괄보정`}
                    </Button>
                </Space>
            </div>
            <div style={{ height: GRID_HEIGHT, width: '100%' }}>
                <Content.Grid
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    getRowId={getRowId}
                    loading={isLoading}
                    overlayNoRowsTemplate={`<span>${noRowsMsg}</span>`}
                    onGridReady={handleGridReady}
                />
            </div>
        </>
    );
}

TableComp.propTypes = {
    rowData: PropTypes.array,
    isLoading: PropTypes.bool,
    isSearched: PropTypes.bool,
    handleBatchAdjust: PropTypes.func.isRequired,
    isAdjusting: PropTypes.bool
};

TableComp.defaultProps = {
    rowData: [],
    isLoading: false,
    isSearched: false,
    isAdjusting: false
};
