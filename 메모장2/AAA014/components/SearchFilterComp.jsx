import React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { DatePicker, Form, Select, Radio, Input, Row, Col } from 'antd';
// TODO: 사내 공통 컴포넌트 import 경로 실제 값으로 교체
import CustomField from '../../common/CustomField';
import apiCodeSelect from '../../common/apiCodeSelect';
import { W_OPTS, COMM_COMBO_URL, COMBO_FIELD_NMS, COMBO_TITLES } from '../consts/AAA014Vars';

// 퍼블리셔 레이아웃(SearchRow 등)에 맞춰 옮길 때는
// 각 콤보 CustomField의 name / api / params 세 속성만 그대로 가져가면 됨
export default function SearchFilterComp({
    formMethods,
    familyOpts,
    comboParams
}) {
    const { control } = formMethods;

    return (
        <Form layout="vertical">
            {/* 1줄: month + w 콤보 */}
            <Row gutter={16}>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="month">
                        <Controller
                            name="month"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    picker="month"
                                    style={{ width: '100%' }}
                                    placeholder="년월 선택"
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="w">
                        <Controller
                            name="wCd"
                            control={control}
                            render={({ field }) => (
                                <Select {...field} style={{ width: '100%' }} options={W_OPTS} />
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>

            {/* 2줄: family solid Radio (단일 선택, 목록은 공통 콤보 API로 조회) */}
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item label="family">
                        <Controller
                            name={COMBO_FIELD_NMS.FAMILY}
                            control={control}
                            render={({ field }) => (
                                <Radio.Group
                                    {...field}
                                    optionType="button"
                                    buttonStyle="solid"
                                    options={familyOpts}
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>

            {/* 3줄: 콤보 a~e (apiCodeSelect가 params로 각자 조회) */}
            <Row gutter={16}>
                <Col flex="1">
                    <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.A} title={COMBO_TITLES.A} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.A} />
                </Col>
                <Col flex="1">
                    <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.B} title={COMBO_TITLES.B} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.B} />
                </Col>
                <Col flex="1">
                    <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.C} title={COMBO_TITLES.C} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.C} />
                </Col>
                <Col flex="1">
                    <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.D} title={COMBO_TITLES.D} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.D} />
                </Col>
                <Col flex="1">
                    <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.E} title={COMBO_TITLES.E} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.E} />
                </Col>
            </Row>

            {/* 4줄: 콤보 f~h + rp cd 검색박스 */}
            <Row gutter={16}>
                <Col flex="1">
                    <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.F} title={COMBO_TITLES.F} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.F} />
                </Col>
                <Col flex="1">
                    <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.G} title={COMBO_TITLES.G} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.G} />
                </Col>
                <Col flex="1">
                    <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.H} title={COMBO_TITLES.H} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.H} />
                </Col>
                <Col flex="1">
                    <Form.Item label="rp cd">
                        {/* TODO: 검색 로직 추후 */}
                        <Controller
                            name="rpCd"
                            control={control}
                            render={({ field }) => (
                                <Input.Search {...field} placeholder="rp cd" />
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>

            {/* 5줄: pln prod id 검색박스 */}
            <Row gutter={16}>
                <Col xs={24} md={12} lg={8}>
                    <Form.Item label="pln prod id">
                        {/* TODO: 검색 로직 추후 */}
                        <Controller
                            name="plnProdId"
                            control={control}
                            render={({ field }) => (
                                <Input.Search {...field} placeholder="pln prod id" />
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}

SearchFilterComp.propTypes = {
    formMethods: PropTypes.object.isRequired,
    familyOpts: PropTypes.array,
    comboParams: PropTypes.object.isRequired
};

SearchFilterComp.defaultProps = {
    familyOpts: []
};
