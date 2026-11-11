/**
 * AG Grid + antd Pagination(simple) 화면 페이징
 * - 전체 데이터를 한 번에 조회 → 화면에서만 페이지 나눔 (서버 수정 없음)
 * - AG Grid 기본 페이징 바는 숨기고 antd Pagination(입력 이동 방식)으로 조작
 * - 정렬은 현재 페이지가 아니라 전체 데이터 기준으로 동작
 */
import React, { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Pagination } from 'antd';

const PAGE_SIZE = 20; // 한 페이지 행 수
const GRID_HEIGHT = 500;

// ── return 위: ref, state, 함수 ──
const gridApi = useRef(null); // 그리드 api 보관 (페이지 이동에 사용)
const [pageNo, setPageNo] = useState(1); // 현재 페이지 (antd 기준 1부터 시작)

// 그리드 준비 완료 시 api 저장
const handleGridReady = (params) => {
    gridApi.current = params.api;
};

// 재조회하면 1페이지로 복귀
useEffect(() => {
    setPageNo(1);
    gridApi.current?.paginationGoToPage(0);
}, [rowData]);

// 페이지 이동: antd(1부터) → AG Grid(0부터) 변환
const handlePageChange = (nextPageNo) => {
    setPageNo(nextPageNo);
    gridApi.current?.paginationGoToPage(nextPageNo - 1);
};

// ── return 안: 화면 ──
return (
    <>
        <div className="ag-theme-alpine" style={{ height: GRID_HEIGHT, width: '100%' }}>
            <AgGridReact
                rowData={rowData} // 조회 결과
                columnDefs={columnDefs} // 그리드 컬럼 정의
                pagination // 그리드 페이징 사용
                paginationPageSize={PAGE_SIZE} // 한 페이지 행 수
                suppressPaginationPanel // 그리드 기본 페이징 바 숨김: antd Pagination으로 통일
                onGridReady={handleGridReady} // 페이지 이동에 쓸 api 저장
            />
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
                simple // 페이지 번호 입력 이동 (점퍼 방식)
                size="small" // 크기 고정 (퍼블리셔 예제의 size 라디오는 사용 안 함)
                current={pageNo} // 현재 페이지
                pageSize={PAGE_SIZE} // 한 페이지 행 수
                total={rowData.length} // 전체 건수: 예제값 9990 대신 조회 결과 건수
                onChange={handlePageChange} // 페이지 이동 시 그리드도 같이 이동
            />
        </div>
    </>
);
