import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, Typography } from 'antd';
import SearchFilterComp from '../components/SearchFilterComp';
import TableComp from '../components/TableComp';
import { useAAA014Fetch } from '../hooks/useAAA014Fetch';

export default function AAA014Tab({
    tabId,
    filters,
    formMethods,
    familyOpts,
    familyParams,
    comboParams,
    applyFamilyData
}) {
    const { familyData, isFamilySuccess } = useAAA014Fetch(tabId, familyParams);

    // family 목록: 한 번만 적용
    const familyAppliedRef = useRef(false);

    useEffect(() => {
        if (!isFamilySuccess || familyAppliedRef.current) return;
        familyAppliedRef.current = true;
        applyFamilyData(familyData);
    }, [isFamilySuccess, familyData, applyFamilyData]);

    // TODO: 조회/초기화 버튼

    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={4}>AAA014</Typography.Title>
            <Card size="small" style={{ marginBottom: 12 }}>
                <SearchFilterComp
                    filters={filters} // 퍼블리셔 초기 필터 원본: 규약상 props 구조 유지용
                    formMethods={formMethods} // RHF 폼 객체: 각 필드 바인딩 기준
                    familyOpts={familyOpts} // family Radio 옵션: 공통 콤보 API 조회 결과
                    comboParams={comboParams} // 콤보 a~h apiCodeSelect params: family/부모 값 반영된 조회 조건
                />
            </Card>
            <Card size="small">
                <TableComp />
            </Card>
        </div>
    );
}

AAA014Tab.propTypes = {
    tabId: PropTypes.string,
    filters: PropTypes.object,
    formMethods: PropTypes.object.isRequired,
    familyOpts: PropTypes.array,
    familyParams: PropTypes.object.isRequired,
    comboParams: PropTypes.object.isRequired,
    applyFamilyData: PropTypes.func.isRequired
};
