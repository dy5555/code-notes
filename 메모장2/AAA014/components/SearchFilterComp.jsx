import React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { DatePicker, Form, Select, Radio, Input } from 'antd';
// TODO: 사내 공통 컴포넌트 import 경로 실제 값으로 교체
import SearchConditionForm from '../../common/SearchConditionForm';
import SearchRow from '../../common/SearchRow';
import CustomField from '../../common/CustomField';
import apiCodeSelect from '../../common/apiCodeSelect';
import { W_OPTS, COMM_COMBO_URL, COMBO_FIELD_NMS, COMBO_TITLES } from '../consts/AAA014Vars';

// 퍼블리셔 SearchFilterComp 구조 기준
// - SearchConditionForm 속성은 퍼블리셔 그대로 (조회/초기화 버튼, 펼치기, 모달은 SearchConditionForm이 처리)
// - 콤보 a~h: apiCodeSelect + params (상위 조건은 Search 훅에서 SC_SEQ 기준으로 생성)
// - TODO: SearchRow rowKey, month / w / family / rp cd / pln prod id 컴포넌트는 퍼블리셔 코드 기준으로 교체
export const SearchFilterComp = ({
    filters,
    formMethods,
    onSearch,
    onReset,
    disabledSearchBox,
    handleToggle,
    expanded,
    isModalOpen,
    setIsModalOpen,
    familyOpts,
    comboParams
}) => {
    const { control } = formMethods;

    return (
        <SearchConditionForm
            defaultValues={filters}
            formMethods={formMethods}
            onSearch={onSearch}
            onReset={onReset}
            disabled={disabledSearchBox}
            onToggle={handleToggle}
            expanded={expanded}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
        >
            {/* 1줄: month + w 콤보 */}
            <SearchRow rowKey="basic">
                <Form.Item label="month">
                    <Controller
                        name="month"
                        control={control}
                        render={({ field }) => (
                            <DatePicker {...field} picker="month" placeholder="년월 선택" />
                        )}
                    />
                </Form.Item>
                <Form.Item label="w">
                    <Controller
                        name="wCd"
                        control={control}
                        render={({ field }) => (
                            <Select {...field} options={W_OPTS} />
                        )}
                    />
                </Form.Item>
            </SearchRow>

            {/* 2줄: family solid Radio (목록은 공통 콤보 API로 조회) */}
            <SearchRow rowKey="detail1">
                <Form.Item label="family">
                    <Controller
                        name={COMBO_FIELD_NMS.FAMILY}
                        control={control}
                        render={({ field }) => (
                            <Radio.Group {...field} optionType="button" buttonStyle="solid" options={familyOpts} />
                        )}
                    />
                </Form.Item>
            </SearchRow>

            {/* 3줄: 콤보 a~e */}
            <SearchRow rowKey="detail2">
                <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.A} title={COMBO_TITLES.A} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.A} />
                <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.B} title={COMBO_TITLES.B} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.B} />
                <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.C} title={COMBO_TITLES.C} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.C} />
                <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.D} title={COMBO_TITLES.D} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.D} />
                <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.E} title={COMBO_TITLES.E} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.E} />
            </SearchRow>

            {/* 4줄: 콤보 f~h + rp cd 검색박스 */}
            <SearchRow rowKey="detail3">
                <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.F} title={COMBO_TITLES.F} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.F} />
                <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.G} title={COMBO_TITLES.G} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.G} />
                <CustomField component={apiCodeSelect} name={COMBO_FIELD_NMS.H} title={COMBO_TITLES.H} placeholder="전체" method="post" api={COMM_COMBO_URL} params={comboParams.H} />
                <Form.Item label="rp cd">
                    {/* TODO: 검색 로직 추후 */}
                    <Controller
                        name="rpCd"
                        control={control}
                        render={({ field }) => <Input.Search {...field} placeholder="rp cd" />}
                    />
                </Form.Item>
            </SearchRow>

            {/* 5줄: pln prod id 검색박스 */}
            <SearchRow rowKey="detail4">
                <Form.Item label="pln prod id">
                    {/* TODO: 검색 로직 추후 */}
                    <Controller
                        name="plnProdId"
                        control={control}
                        render={({ field }) => <Input.Search {...field} placeholder="pln prod id" />}
                    />
                </Form.Item>
            </SearchRow>
        </SearchConditionForm>
    );
};

SearchFilterComp.propTypes = {
    filters: PropTypes.object.isRequired,
    formMethods: PropTypes.object.isRequired,
    onSearch: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    disabledSearchBox: PropTypes.bool,
    handleToggle: PropTypes.func.isRequired,
    expanded: PropTypes.bool,
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func.isRequired,
    familyOpts: PropTypes.array,
    comboParams: PropTypes.object.isRequired
};

SearchFilterComp.defaultProps = {
    disabledSearchBox: false,
    expanded: false,
    isModalOpen: false,
    familyOpts: []
};
