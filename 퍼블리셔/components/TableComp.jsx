import React from 'react';
import { Table } from 'antd';

// 그리드 모양만 구성. 실제 데이터 / 컬럼 Hook / API 없음.
const columns = [
    { title: '구분', dataIndex: 'category', key: 'category' },
    { title: 'SALES_PROD_ID', dataIndex: 'salesProdId', key: 'salesProdId' },
    { title: 'RP_SOM_CD', dataIndex: 'rpSomCd', key: 'rpSomCd' },
    { title: '일괄보정여부', dataIndex: 'adjustYn', key: 'adjustYn' },
    { title: '보정 RP_SOM_CD', dataIndex: 'adjustRpSomCd', key: 'adjustRpSomCd' }
];

export default function TableComp() {
    return <Table columns={columns} dataSource={[]} rowKey="salesProdId" size="small" bordered pagination={false} scroll={{ x: 900 }} />;
}
