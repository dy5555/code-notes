# TableComp.jsx — 조회 결과 그리드 + 일괄보정 버튼 (풀코드)

메모장3 대비 수정
- 요약/버튼 연결 예시 → 풀코드
- 일괄보정 버튼과 보정 건수 계산은 메모장3대로 이 파일에 유지
- 조회 중(`isLoading`)에는 일괄보정 버튼 비활성화
- 컬럼 `일괄보정여부`, `보정 RP_SOM_CD`를 실제 응답 필드(`gnlCrrYn`, `tobeRpSomcd`)에 연결

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Typography } from 'antd';

const columns = [
    { title: '구분', dataIndex: 'category', key: 'category' },
    { title: 'SALES_PROD_ID', dataIndex: 'salesProdId', key: 'salesProdId' },
    { title: 'RP_SOM_CD', dataIndex: 'rpSomCd', key: 'rpSomCd' },
    { title: '일괄보정여부', dataIndex: 'gnlCrrYn', key: 'gnlCrrYn' },
    { title: '보정 RP_SOM_CD', dataIndex: 'tobeRpSomcd', key: 'tobeRpSomcd' }
];

export default function TableComp({
    rowData,
    isLoading,
    isSearched,
    handleBatchAdjust,
    isAdjusting
}) {
    // 현재 조회된 rowData 중 보정 가능(gnlCrrYn === 'Y') 행 수
    const adjustCount = (rowData ?? []).filter(
        (item) => item.gnlCrrYn === 'Y'
    ).length;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Typography.Text strong>조회 결과</Typography.Text>
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
    isAdjusting: PropTypes.bool
};

TableComp.defaultProps = {
    rowData: [],
    isLoading: false,
    isSearched: false,
    isAdjusting: false
};
```

- `category`, `rpSomCd` 필드명은 퍼블리셔 기준이며 실제 응답 필드와 대조가 필요합니다.
- 버튼 건수(`gnlCrrYn === 'Y'`)와 `AAA013Tab`의 `handleBatchAdjust` 전송 대상 필터는 같은 조건이어야 합니다.
