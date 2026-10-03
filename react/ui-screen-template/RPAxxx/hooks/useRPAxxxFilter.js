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
    stockMonth: null,          // 재고조회 월
    salesDemandWeek: "",       // 판매 Demand 주차
    somMonth: null,            // 수요 SOM 월
    somCds: [],                // 수요 SOM 코드 멀티콤보 선택값
    salesResultMonth: null,    // 판매실적 월
    inboundDemandWeek: "",     // 입고 Demand 주차
  });

  // SOM 월 기준 코드 멀티콤보 목록
  const [somCdOptions, setSomCdOptions] = useState([]);

  /** 화면 최초 진입 시 최신 월/주차를 서버에서 한 번에 조회 */
  const fetchInitialFilterValues = useCallback(async () => {
    // TODO: 실제 프로젝트 초기 필터 조회 API로 교체
    // const result = await api.fetchInitialFilterValues();

    const result = {
      stockMonth: "202610",
      salesDemandWeek: "202640",
      somMonth: "202609",
      salesResultMonth: "202609",
      inboundDemandWeek: "202640",
    };

    setSearchFilter({
      stockMonth: result.stockMonth ? dayjs(result.stockMonth, "YYYYMM") : null,
      salesDemandWeek: result.salesDemandWeek || "",
      somMonth: result.somMonth ? dayjs(result.somMonth, "YYYYMM") : null,
      somCds: [],
      salesResultMonth: result.salesResultMonth
        ? dayjs(result.salesResultMonth, "YYYYMM")
        : null,
      inboundDemandWeek: result.inboundDemandWeek || "",
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
