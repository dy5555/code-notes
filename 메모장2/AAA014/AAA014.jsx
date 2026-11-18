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
        disabledSearchBox,
        applyFamilyData,
        resetFilters,
        getSearchParams
    } = useAAA014Search();

    return (
        <AAA014Tab
            tabId={SCREEN_ID} // 화면 ID: React Query 캐시 키 구분용 (탭 없는 화면이라 화면 ID 고정)
            filters={filters} // 초기 필터 원본: SearchConditionForm defaultValues, 초기화 기준
            formMethods={formMethods} // RHF 폼 객체: 검색조건 단일 관리 위해 SearchFilterComp까지 통째로 전달
            familyOpts={familyOpts} // family Radio 옵션
            familyParams={familyParams} // family 목록 조회 조건 (고정)
            comboParams={comboParams} // 콤보 a~h apiCodeSelect params (상위 값 바뀌면 다시 계산)
            disabledSearchBox={disabledSearchBox} // 조회 버튼 비활성 여부
            applyFamilyData={applyFamilyData} // family 조회 결과 반영 함수: 조회는 Tab(Fetch 훅), 상태 저장은 Search 훅
            resetFilters={resetFilters} // 초기화 버튼: 최초 필터 값으로 복원
            getSearchParams={getSearchParams} // 조회 시점의 현재 폼 값 읽기
        />
    );
}
