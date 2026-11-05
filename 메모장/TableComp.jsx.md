# TableComp.jsx — 조회 결과 그리드 + 엑셀 다운로드 + 일괄보정 버튼 (풀코드)

메모장3 대비 수정
- 요약/버튼 연결 예시 → 풀코드
- 일괄보정 버튼과 보정 건수 계산은 메모장3대로 이 파일에 유지
- 조회 중(`isLoading`)에는 일괄보정 버튼 비활성화
- 컬럼 `일괄보정여부`, `보정 RP_SOM_CD`를 실제 응답 필드(`gnlCrrYn`, `tobeRpSomcd`)에 연결
- `ToolbarExcel` 엑셀 다운로드 추가 (오른쪽, 일괄보정 버튼 왼쪽)

메모장4 수정
- 그리드를 antd `Table` → AG Grid `AgGridReact`로 변경
- 컬럼 `title`/`dataIndex` → `headerName`/`field`, 컬럼별 `width` 추가
- `dataSource` → `rowData`, `rowKey` → `getRowId`, 빈 데이터 문구 → `overlayNoRowsTemplate`

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { Button, Typography, Space } from 'antd';

// 그리드·엑셀 공통 컬럼
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

// TODO: 엑셀 다운로드 API 주소 입력
const EXCEL_URL = '';
const EXCEL_FILE_NAME = 'SOM코드보정_조회결과';
const GRID_HEIGHT = 500;

// 행 고유키: salesProdId
const getRowId = (params) => String(params.data.salesProdId);

export default function TableComp({
    rowData,
    isLoading,
    isSearched,
    handleBatchAdjust,
    isAdjusting,
    excelParams
}) {
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
                        url={EXCEL_URL} // 엑셀 다운로드 API 주소 (사내 ToolbarExcel 규약상 서버에서 엑셀 생성)
                        params={excelParams ?? {}} // 마지막 조회 조건, 조회 전(null)이면 빈 객체로 전달해 오류 방지
                        columns={columnDefs} // 그리드와 같은 컬럼 정의 공유: 화면·엑셀 컬럼 항상 일치
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
            <div className="ag-theme-alpine" style={{ height: GRID_HEIGHT, width: '100%' }}>
                <AgGridReact
                    rowData={rowData} // aaa03 조회 결과
                    columnDefs={columnDefs} // 그리드 컬럼 정의
                    defaultColDef={defaultColDef} // 전체 컬럼 공통 옵션 (정렬·너비조절)
                    getRowId={getRowId} // 행 고유키 지정: 재조회 시 같은 행 재사용해 깜빡임·선택 꼬임 방지
                    loading={isLoading} // 조회 중 로딩 오버레이 표시
                    overlayNoRowsTemplate={`<span>${noRowsMsg}</span>`} // 데이터 없을 때 문구 (조회 전/결과 없음 구분)
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
    isAdjusting: PropTypes.bool,
    excelParams: PropTypes.object
};

TableComp.defaultProps = {
    rowData: [],
    isLoading: false,
    isSearched: false,
    isAdjusting: false,
    excelParams: null
};
```

- `category`, `rpSomCd` 필드명은 퍼블리셔 기준이며 실제 응답 필드와 대조가 필요합니다.
- 버튼 건수(`gnlCrrYn === 'Y'`)와 `AAA013Tab`의 `handleBatchAdjust` 전송 대상 필터는 같은 조건이어야 합니다.
- `excelParams`는 마지막 조회 조건입니다. 조회 후 조건만 바꾸고 조회하지 않으면 엑셀은 화면 그리드와 같은 이전 조건으로 받습니다.
- `ToolbarExcel`의 `columns`에 AG Grid 컬럼(`headerName`/`field`)을 그대로 넘기고 있으니, 회사 코드의 넘기는 형식과 같은지 확인하세요.
- `loading` 속성은 AG Grid v32.2 이상에서 동작합니다. 그보다 낮은 버전이면 회사 코드의 로딩 처리 방식으로 맞추세요.
- 그리드 테마(`ag-theme-alpine`)와 높이(`GRID_HEIGHT`)는 회사 화면 기준으로 맞추세요.
