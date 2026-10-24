import React from 'react';
import { DatePicker, Form, Select, Row, Col } from 'antd';

// 최초 요청한 6개 검색조건의 정적 UI. 이벤트 및 데이터 연결 없음.
export default function SearchFilterComp() {
    return (
        <Form layout="vertical">
            <Row gutter={16}>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="재고조회 월"><DatePicker picker="month" style={{ width: '100%' }} placeholder="년월 선택" /></Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="판매수요 주차"><Select placeholder="주차 선택" options={[]} /></Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="SOM 월"><DatePicker picker="month" style={{ width: '100%' }} placeholder="년월 선택" /></Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="SOM CD"><Select placeholder="SOM CD 선택" options={[]} /></Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="판매실적 월"><DatePicker picker="month" style={{ width: '100%' }} placeholder="년월 선택" /></Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="입고수요 주차"><Select placeholder="주차 선택" options={[]} /></Form.Item>
                </Col>
            </Row>
        </Form>
    );
}
