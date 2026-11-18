import React from 'react';
import AAA014Tab from './tabs/AAA014Tab';
import { useAAA014Search } from './hooks/useAAA014Search';

const SCREEN_ID = 'AAA014';

export default function AAA014() {
    const {
        filters,
        formMethods,
        familyOpts,
        familyParams,
        comboParams,
        applyFamilyData
    } = useAAA014Search();

    return (
        <AAA014Tab
            tabId={SCREEN_ID} // 화면 ID: React Query 캐시 키 구분용 (탭 없는 화면이라 화면 ID 고정)
            filters={filters} // 퍼블리셔 초기 필터 원본: 규약상 유지만 하고 값 변경은 formMethods로만 함
            formMethods={formMethods} // RHF 폼 객체: 검색조건 단일 관리 위해 SearchFilterComp까지 통째로 전달
            familyOpts={familyOpts} // family Radio 옵션
            familyParams={familyParams} // family 목록 조회 조건 (고정)
            comboParams={comboParams} // 콤보 a~h apiCodeSelect params (family/부모 값 바뀌면 다시 계산)
            applyFamilyData={applyFamilyData} // family 조회 결과 반영 함수: 조회는 Tab(Fetch 훅), 상태 저장은 Search 훅
        />
    );
}
