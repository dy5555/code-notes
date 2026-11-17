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
    comboOpts,
    applyComboData
}) {
    const { initComboData, isInitComboSuccess } = useAAA014Fetch(tabId);

    // aaa01 최초 콤보(family + a~h): 한 번만 적용
    const initComboAppliedRef = useRef(false);

    useEffect(() => {
        if (!isInitComboSuccess || initComboAppliedRef.current) return;
        initComboAppliedRef.current = true;
        applyComboData(initComboData);
    }, [isInitComboSuccess, initComboData, applyComboData]);

    // TODO: 조회/초기화 버튼, family 변경 재조회, a~g 연쇄 필터

    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={4}>AAA014</Typography.Title>
            <Card size="small" style={{ marginBottom: 12 }}>
                <SearchFilterComp
                    filters={filters} // 퍼블리셔 초기 필터 원본: 규약상 props 구조 유지용
                    formMethods={formMethods} // RHF 폼 객체: 각 필드를 Controller로 바인딩하는 기준
                    familyOpts={familyOpts} // family Radio 옵션: 최초 조회 결과
                    comboOpts={comboOpts} // 콤보 a~h 옵션: { A: [...], B: [...], ... }
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
    comboOpts: PropTypes.object.isRequired,
    applyComboData: PropTypes.func.isRequired
};
