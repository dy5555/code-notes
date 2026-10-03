import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";

/**
 * 검색 필터 전용 Custom Hook
 *
 * 네이밍 원칙
 * - 누구나 바로 이해하는 공통 약어는 사용한다. (code -> cd, count -> cnt 등)
 * - 의미를 파악하기 어려운 과도한 축약은 사용하지 않는다.
 * - 관련 검색조건은 searchFilter 객체로 묶어서 관리한다.
 * - 최신 월/주차는 서버 API 한 번으로 조회한다.
 */
const useRPAxxxFilter = () => {
  const [searchFilter, setSearchFilter] = useState({
    stockMonth: null,          // 재고조회 월 DatePicker 값
    salesDemandWeek: null,     // 판매 Demand 주차 DatePicker 값
    somMonth: null,            // 수요 SOM 월 DatePicker 값
    somCds: [],                // 수요 SOM 코드 멀티콤보 선택값
    salesResultMonth: null,    // 판매실적 월 DatePicker 값
    inboundDemandWeek: null,   // 입고 Demand 주차 DatePicker 값
  });

  // SOM 월 기준 코드 멀티콤보 목록
  const [somCdOptions, setSomCdOptions] = useState([]);

  /**
   * 화면 최초 진입 시 초기 필터값 조회
   *
   * - Spring Boot API를 한 번만 호출하여 아래 5개 최신 기준값을 한 번에 조회한다.
   *   1. 재고조회 월
   *   2. 판매 Demand 주차
   *   3. 수요 SOM 월
   *   4. 판매실적 월
   *   5. 입고 Demand 주차
   * - 서버에서는 MyBatis를 통해 각 테이블의 최신값을 조회하여 반환한다.
   * - 월 값은 YYYYMM 형식으로 반환한다. 예: 202610
   * - 주차 값은 YYYYWW 형식으로 반환한다. 예: 202640 = 2026년 40주차
   * - 월 DatePicker는 dayjs 객체를 사용하므로 YYYYMM -> dayjs로 변환한다.
   * - 주차도 DatePicker를 사용할 예정이므로 state는 null/dayjs 기준으로 관리한다.
   * - 단, YYYYWW -> dayjs 변환은 회사 기존 주차 DatePicker의 주차 계산 기준 확인 후 적용한다.
   *   (임의로 ISO Week 기준을 적용하지 않는다.)
   * - SOM 코드 선택값은 최초 진입 시 비워두고, somMonth 세팅 후 해당 월 기준 코드 목록을 조회한다.
   */
  const fetchInitialFilterValues = useCallback(async () => {
    // TODO: 실제 프로젝트의 API import/함수명에 맞게 변경
    const result = await api.fetchInitialFilterValues();

    setSearchFilter({
      stockMonth: result.stockMonth ? dayjs(result.stockMonth, "YYYYMM") : null,

      // 서버 반환값 예: 202640
      // TODO: 회사 기존 주차 DatePicker 변환 방식 확인 후 dayjs 값으로 변환
      salesDemandWeek: result.salesDemandWeek || null,

      somMonth: result.somMonth ? dayjs(result.somMonth, "YYYYMM") : null,
      somCds: [],
      salesResultMonth: result.salesResultMonth
        ? dayjs(result.salesResultMonth, "YYYYMM")
        : null,

      // 서버 반환값 예: 202640
      // TODO: 회사 기존 주차 DatePicker 변환 방식 확인 후 dayjs 값으로 변환
      inboundDemandWeek: result.inboundDemandWeek || null,
    });
  }, []);

  /** 선택한 SOM 월 기준 코드 목록 조회 */
  const fetchSomCdOptions = useCallback(async (somMonth) => {
    if (!somMonth) {
      setSomCdOptions([]);
      return;
    }

    const params = {
      somMonth: dayjs(somMonth).format("YYYYMM"),
    };

    // TODO: 실제 SOM 코드 목록 API로 교체
    // const result = await api.fetchSomCdOptions(params);
    // setSomCdOptions(result);

    console.log("SOM 코드 목록 조회조건", params);

    setSomCdOptions([
      { value: "SOM001", label: `${params.somMonth} / SOM001` },
      { value: "SOM002", label: `${params.somMonth} / SOM002` },
    ]);
  }, []);

  /** 일반 검색조건 변경 */
  const handleFilterChange = useCallback((name, value) => {
    setSearchFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /** SOM 코드 멀티콤보 선택값 변경 */
  const handleSomCdChange = useCallback((selectedSomCds) => {
    setSearchFilter((prev) => ({
      ...prev,
      somCds: selectedSomCds,
    }));
  }, []);

  /** 검색조건 초기화 */
  const handleFilterReset = useCallback(async () => {
    await fetchInitialFilterValues();
  }, [fetchInitialFilterValues]);

  useEffect(() => {
    fetchInitialFilterValues();
  }, [fetchInitialFilterValues]);

  /** SOM 월 변경 -> 기존 선택 코드 초기화 -> 해당 월 코드 목록 재조회 */
  useEffect(() => {
    if (!searchFilter.somMonth) {
      setSomCdOptions([]);
      return;
    }

    setSearchFilter((prev) => ({
      ...prev,
      somCds: [],
    }));

    fetchSomCdOptions(searchFilter.somMonth);
  }, [searchFilter.somMonth, fetchSomCdOptions]);

  return {
    searchFilter,
    somCdOptions,
    handleFilterChange,
    handleSomCdChange,
    handleFilterReset,
  };
};

export default useRPAxxxFilter;
