import React, { useRef, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button, Typography, Space, Pagination } from 'antd';

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
const PAGE_SIZE = 20; // [페이징] 한 페이지 행 수

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

    // [페이징] 현재 페이지 (1부터 시작)
    const [pageNo, setPageNo] = useState(1);

    // 그리드 준비 완료 시 api 저장
    const handleGridReady = (params) => {
        gridApi.current = params.api;
    };

    // 화면 그리드 기준 엑셀 다운로드 함수
    const { handleScreenExcelDownload } = useScreenExcelDownload({ gridApi });

    // 전체 조회 결과 중 보정 가능(gnlCrrYn === 'Y') 행 수: 페이징과 무관하게 전체 기준
    const adjustCount = rowData.filter((item) => item.gnlCrrYn === 'Y').length;

    // [페이징] 현재 페이지 행만 잘라서 그리드에 전달 (2페이지 = 21~40번째 행)
    const pageRowList = useMemo(() => {
        const startIdx = (pageNo - 1) * PAGE_SIZE;
        return rowData.slice(startIdx, startIdx + PAGE_SIZE);
    }, [rowData, pageNo]);

    // [페이징] 재조회하면 1페이지로 복귀
    useEffect(() => {
        setPageNo(1);
    }, [rowData]);

    // [페이징] 페이지 이동: 페이지 번호만 바꾸면 pageRowList가 다시 계산됨
    const handlePageChange = (nextPageNo) => {
        setPageNo(nextPageNo);
    };

    const noRowsMsg = isSearched
        ? '조회결과가 존재하지 않습니다.'
        : '조회조건을 선택한 후 조회하세요.';

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Typography.Text strong>조회 결과</Typography.Text>
                <Space>
                    <ToolbarExcel
                        onScreenExcelExport={handleScreenExcelDownload} // 화면 그리드 기준 엑셀 다운로드 (페이징 시 현재 페이지만 나가는지 확인 필요)
                        fileName={EXCEL_FILE_NAME} // 다운로드 파일명
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
                    rowData={pageRowList} // [페이징] 전체가 아닌 현재 페이지 행만 전달
                    columnDefs={columnDefs} // 그리드 컬럼 정의 (엑셀 컬럼·너비도 이 기준)
                    defaultColDef={defaultColDef} // 전체 컬럼 공통 옵션 (정렬·너비조절)
                    getRowId={getRowId} // 행 고유키 지정: 재조회 시 같은 행 재사용해 깜빡임·선택 꼬임 방지
                    loading={isLoading} // 조회 중 로딩 오버레이 표시
                    overlayNoRowsTemplate={`<span>${noRowsMsg}</span>`} // 데이터 없을 때 문구 (조회 전/결과 없음 구분)
                    onGridReady={handleGridReady} // 그리드 준비 완료 시 api 저장: 엑셀 다운로드에서 그리드 api 사용
                />
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                    size="small" // 크기 고정
                    current={pageNo} // 현재 페이지
                    pageSize={PAGE_SIZE} // 한 페이지 행 수
                    total={rowData.length} // 전체 건수: 잘라낸 행이 아닌 전체 조회 결과 기준
                    showQuickJumper // 페이지 번호 입력 이동칸 (점퍼)
                    showSizeChanger={false} // 행 수 변경 콤보 숨김
                    onChange={handlePageChange} // 페이지 이동
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
