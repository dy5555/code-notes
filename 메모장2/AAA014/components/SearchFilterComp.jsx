import React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { DatePicker, Form, Select, Radio, Input, Row, Col } from 'antd';
import { W_OPTS, COMBO_FIELD_NMS, COMBO_LABELS } from '../consts/AAA014Vars';

export default function SearchFilterComp({
    formMethods,
    familyOpts,
    comboOpts
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
                                <Select
                                    {...field}
                                    style={{ width: '100%' }}
                                    options={W_OPTS}
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>

            {/* 2줄: family solid Radio (단일 선택) */}
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item label="family">
                        <Controller
                            name="family"
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

            {/* 3줄: 콤보 a~e */}
            <Row gutter={16}>
                <Col flex="1">
                    <Form.Item label={COMBO_LABELS.A}>
                        <Controller
                            name={COMBO_FIELD_NMS.A}
                            control={control}
                            render={({ field }) => (
                                <Select {...field} style={{ width: '100%' }} options={comboOpts.A} />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col flex="1">
                    <Form.Item label={COMBO_LABELS.B}>
                        <Controller
                            name={COMBO_FIELD_NMS.B}
                            control={control}
                            render={({ field }) => (
                                <Select {...field} style={{ width: '100%' }} options={comboOpts.B} />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col flex="1">
                    <Form.Item label={COMBO_LABELS.C}>
                        <Controller
                            name={COMBO_FIELD_NMS.C}
                            control={control}
                            render={({ field }) => (
                                <Select {...field} style={{ width: '100%' }} options={comboOpts.C} />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col flex="1">
                    <Form.Item label={COMBO_LABELS.D}>
                        <Controller
                            name={COMBO_FIELD_NMS.D}
                            control={control}
                            render={({ field }) => (
                                <Select {...field} style={{ width: '100%' }} options={comboOpts.D} />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col flex="1">
                    <Form.Item label={COMBO_LABELS.E}>
                        <Controller
                            name={COMBO_FIELD_NMS.E}
                            control={control}
                            render={({ field }) => (
                                <Select {...field} style={{ width: '100%' }} options={comboOpts.E} />
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>

            {/* 4줄: 콤보 f~h + rp cd 검색박스 */}
            <Row gutter={16}>
                <Col flex="1">
                    <Form.Item label={COMBO_LABELS.F}>
                        <Controller
                            name={COMBO_FIELD_NMS.F}
                            control={control}
                            render={({ field }) => (
                                <Select {...field} style={{ width: '100%' }} options={comboOpts.F} />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col flex="1">
                    <Form.Item label={COMBO_LABELS.G}>
                        <Controller
                            name={COMBO_FIELD_NMS.G}
                            control={control}
                            render={({ field }) => (
                                <Select {...field} style={{ width: '100%' }} options={comboOpts.G} />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col flex="1">
                    <Form.Item label={COMBO_LABELS.H}>
                        <Controller
                            name={COMBO_FIELD_NMS.H}
                            control={control}
                            render={({ field }) => (
                                <Select {...field} style={{ width: '100%' }} options={comboOpts.H} />
                            )}
                        />
                    </Form.Item>
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
    comboOpts: PropTypes.object.isRequired
};

SearchFilterComp.defaultProps = {
    familyOpts: []
};
