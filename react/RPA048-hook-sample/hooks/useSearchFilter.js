import { useState } from 'react';
import dayjs from 'dayjs';

const useSearchFilter = () => {
  // 화면에서 사용하는 검색조건을 하나의 객체로 관리
  const [searchForm, setSearchForm] = useState({
    stockMonth: null,
    salesDemandWeek: '',
    somMonth: null,
    salesResultMonth: null,
    inboundDemandWeek: ''
  });

  // 검색조건 하나를 변경할 때 공통으로 사용하는 함수
  const handleChange = (name, value) => {
    setSearchForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // S001에서 조회한 최초 월/주차 값을 검색조건에 세팅한다.
  //
  // 서버 응답 예:
  // [
  //   { type: 'stock_ym', code: '202605', plnRev: 'ccc' },
  //   { type: 'sales_demand_week', code: '202622', plnRev: null }
  // ]
  const setInitialFilter = (result) => {
    // 배열로 받은 데이터를 type을 key로 하는 객체로 변경한다.
    //
    // 예:
    // { type: 'stock_ym', code: '202605', plnRev: 'ccc' }
    //                  ↓
    // initData.stock_ym.code   -> '202605'
    // initData.stock_ym.plnRev -> 'ccc'
    const initData = Object.fromEntries(
      result.map((item) => [item.type, item])
    );

    setSearchForm((prev) => ({
      ...prev,

      // 월 DatePicker는 문자열이 아니라 dayjs 객체를 사용한다.
      stockMonth: initData.stock_ym?.code
        ? dayjs(initData.stock_ym.code, 'YYYYMM')
        : null,

      // 주차는 문자열 값을 그대로 사용한다.
      salesDemandWeek: initData.sales_demand_week?.code ?? '',

      // SOM 월
      somMonth: initData.som_ym?.code
        ? dayjs(initData.som_ym.code, 'YYYYMM')
        : null,

      // 판매실적 월
      salesResultMonth: initData.sales_result_ym?.code
        ? dayjs(initData.sales_result_ym.code, 'YYYYMM')
        : null,

      // 입고 Demand 주차
      inboundDemandWeek: initData.inbound_demand_week?.code ?? ''
    }));
  };

  // 검색조건 초기화
  const reset = () => {
    setSearchForm({
      stockMonth: null,
      salesDemandWeek: '',
      somMonth: null,
      salesResultMonth: null,
      inboundDemandWeek: ''
    });
  };

  return {
    searchForm,
    setSearchForm,
    handleChange,
    setInitialFilter,
    reset
  };
};

export default useSearchFilter;
