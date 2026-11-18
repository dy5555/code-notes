import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Card, Typography } from 'antd';
import { SearchFilterComp } from '../components/SearchFilterComp';
import TableComp from '../components/TableComp';
import { useAAA014Fetch } from '../hooks/useAAA014Fetch';

export default function AAA014Tab({
    tabId,
    filters,
    formMethods,
    familyOpts,
    familyParams,
    comboParams,
    disabledSearchBox,
    applyFamilyData,
    resetFilters,
    getSearchParams
}) {
    const { familyData, isFamilySuccess } = useAAA014Fetch(tabId, familyParams);

    // 검색영역 화면 상태 (SearchConditionForm에 그대로 전달)
    const [expanded, setExpanded] = useState(false); // 상세 검색 펼침 여부
    const [isModalOpen, setIsModalOpen] = useState(false); // 검색영역 모달 열림 여부

    // family 목록: 한 번만 적용
    const familyAppliedRef = useRef(false);

    useEffect(() => {
        if (!isFamilySuccess || familyAppliedRef.current) return;
        familyAppliedRef.current = true;
        applyFamilyData(familyData);
    }, [isFamilySuccess, familyData, applyFamilyData]);

    // 상세 검색 펼치기/접기
    const handleToggle = useCallback(() => {
        setExpanded((prev) => !prev);
    }, []);

    // 조회 버튼
    const handleSearch = useCallback(() => {
        if (disabledSearchBox) return;
        const searchParams = getSearchParams();
        // TODO: 메인 조회 연결 (Fetch 훅의 조회 함수에 searchParams 전달)
        return searchParams;
    }, [disabledSearchBox, getSearchParams]);

    // 초기화 버튼 (API 재조회 없음)
    const handleReset = useCallback(() => {
        resetFilters();
        // TODO: 메인 조회 붙으면 그리드도 비우기
    }, [resetFilters]);

    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={4}>AAA014</Typography.Title>
            <Card size="small" style={{ marginBottom: 12 }}>
                <SearchFilterComp
                    filters={filters} // 퍼블리셔 초기 필터 원본: SearchConditionForm defaultValues
                    formMethods={formMethods} // RHF 폼 객체: 각 필드 바인딩 기준
                    onSearch={handleSearch} // 조회 버튼
                    onReset={handleReset} // 초기화 버튼
                    disabledSearchBox={disabledSearchBox} // 조회 버튼 비활성 여부
                    handleToggle={handleToggle} // 상세 검색 펼치기/접기
                    expanded={expanded} // 상세 검색 펼침 여부
                    isModalOpen={isModalOpen} // 검색영역 모달 열림 여부
                    setIsModalOpen={setIsModalOpen} // 검색영역 모달 열기/닫기
                    familyOpts={familyOpts} // family Radio 옵션: 공통 콤보 API 조회 결과
                    comboParams={comboParams} // 콤보 a~h apiCodeSelect params: SC_SEQ 기준 상위 조건 반영
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
    filters: PropTypes.object.isRequired,
    formMethods: PropTypes.object.isRequired,
    familyOpts: PropTypes.array,
    familyParams: PropTypes.object.isRequired,
    comboParams: PropTypes.object.isRequired,
    disabledSearchBox: PropTypes.bool,
    applyFamilyData: PropTypes.func.isRequired,
    resetFilters: PropTypes.func.isRequired,
    getSearchParams: PropTypes.func.isRequired
};
