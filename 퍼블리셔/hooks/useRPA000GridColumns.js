// 퍼블리싱 전용: 그리드 컬럼 표시 정의만 유지
// API, 보정 상태 및 이벤트 로직 없음
export default function useRPA000GridColumns() {
    return [
        { title: '구분', dataIndex: 'category', key: 'category' },
        { title: 'SALES_PROD_ID', dataIndex: 'salesProdId', key: 'salesProdId' },
        { title: 'RP_SOM_CD', dataIndex: 'rpSomCd', key: 'rpSomCd' },
        { title: '일괄보정여부', dataIndex: 'adjustYn', key: 'adjustYn' },
        { title: '보정 RP_SOM_CD', dataIndex: 'adjustRpSomCd', key: 'adjustRpSomCd' }
    ];
}
