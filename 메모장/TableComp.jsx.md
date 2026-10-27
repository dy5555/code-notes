# TableComp.jsx — 조회 결과 그리드 + 엑셀 다운로드 + 일괄보정 버튼 (풀코드)

메모장3 대비 수정
- 요약/버튼 연결 예시 → 풀코드
- 일괄보정 버튼과 보정 건수 계산은 메모장3대로 이 파일에 유지
- 조회 중(`isLoading`)에는 일괄보정 버튼 비활성화
- 컬럼 `일괄보정여부`, `보정 RP_SOM_CD`를 실제 응답 필드(`gnlCrrYn`, `tobeRpSomcd`)에 연결
- 사내 `ToolbarExcel` 엑셀 다운로드 추가 (오른쪽, 일괄보정 버튼 왼쪽)

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Typography, Space } from 'antd';
// ToolbarExcel: 사내 레이아웃 공통 컴포넌트 (import 필요 시 실제 경로 추가)

// 그리드·엑셀 공통 컬럼
const columns = [
    { title: '구분', dataIndex: 'category', key: 'category' },
    { title: 'SALES_PROD_ID', dataIndex: 'salesProdId', key: 'salesProdId' },
    { title: 'RP_SOM_CD', dataIndex: 'rpSomCd', key: 'rpSomCd' },
    { title: '일괄보정여부', dataIndex: 'gnlCrrYn', key: 'gnlCrrYn' },
    { title: '보정 RP_SOM_CD', dataIndex: 'tobeRpSomcd', key: 'tobeRpSomcd' }
];

// TODO: 엑셀 다운로드 API 주소 입력
const EXCEL_URL = '';
const EXCEL_FILE_NAME = 'SOM코드보정_조회결과';

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

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Typography.Text strong>조회 결과</Typography.Text>
                <Space>
                    <ToolbarExcel
                        url={EXCEL_URL}
                        params={excelParams ?? {}}
                        columns={columns}
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
            <Table
                columns={columns}
                dataSource={rowData}
                loading={isLoading}
                rowKey="salesProdId"
                size="small"
                bordered
                pagination={false}
                scroll={{ x: 900 }}
                locale={{
                    emptyText: isSearched
                        ? '조회결과가 존재하지 않습니다.'
                        : '조회조건을 선택한 후 조회하세요.'
                }}
            />
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
- `ToolbarExcel`의 `columns` 형식(`title`/`dataIndex`)이 사내 규격과 같은지 확인하세요.
