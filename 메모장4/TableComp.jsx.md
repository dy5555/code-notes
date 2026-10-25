# TableComp.jsx — 조회 결과 그리드 (풀코드)

메모장3 대비 수정
- 요약/버튼 연결 예시 → 퍼블리셔 `components/TableComp.jsx` 기준 풀코드
- 일괄보정 버튼과 건수 계산은 퍼블리셔 배치대로 `AAA013Tab`으로 이동 → 이 파일은 표시만 담당
- 컬럼 `일괄보정여부`, `보정 RP_SOM_CD`를 실제 응답 필드(`gnlCrrYn`, `tobeRpSomcd`)에 연결

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const columns = [
    { title: '구분', dataIndex: 'category', key: 'category' },
    { title: 'SALES_PROD_ID', dataIndex: 'salesProdId', key: 'salesProdId' },
    { title: 'RP_SOM_CD', dataIndex: 'rpSomCd', key: 'rpSomCd' },
    { title: '일괄보정여부', dataIndex: 'gnlCrrYn', key: 'gnlCrrYn' },
    { title: '보정 RP_SOM_CD', dataIndex: 'tobeRpSomcd', key: 'tobeRpSomcd' }
];

export default function TableComp({ rowData, isLoading, isSearched }) {
    return (
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
    );
}

TableComp.propTypes = {
    rowData: PropTypes.array,
    isLoading: PropTypes.bool,
    isSearched: PropTypes.bool
};

TableComp.defaultProps = {
    rowData: [],
    isLoading: false,
    isSearched: false
};
```

- `category`, `rpSomCd` 필드명은 퍼블리셔 기준이며 실제 응답 필드와 대조가 필요합니다.
