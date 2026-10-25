import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import SearchFilterComp from '../components/SearchFilterComp';
import TableComp from '../components/TableComp';

// UI 배치만 담당. API / 조회 / 보정 / Hook 로직 없음.
export default function AAA013Tab() {
    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={4}>SOM 코드 보정</Typography.Title>
            <Card size="small" style={{ marginBottom: 12 }}>
                <SearchFilterComp />
                <Space style={{ marginTop: 12, width: '100%', justifyContent: 'flex-end' }}>
                    <Button>초기화</Button>
                    <Button type="primary">조회</Button>
                </Space>
            </Card>
            <Card size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Typography.Text strong>조회 결과</Typography.Text>
                    <Button type="primary">보정 가능 데이터 : 0건 일괄보정</Button>
                </div>
                <TableComp />
            </Card>
        </div>
    );
}
