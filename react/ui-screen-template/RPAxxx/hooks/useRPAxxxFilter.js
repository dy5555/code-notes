import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  getInitialFilterValues,
  getSomCdOptions,
} from "../../../api/r/pm/pla/RPAxxxApi";

/**
 * 검색 필터 전용 Custom Hook
 */
const useRPAxxxFilter = () => {
  const [searchFilter, setSearchFilter] = useState({
    stockMonth: null,
    salesDemandWeek: null,
    somMonth: null,
    somCds: [],
    salesResultMonth: null,
    inboundDemandWeek: null,
  });

  const [somCdOptions, setSomCdOptions] = useState([]);

  /**
   * 최초 필터값 조회
   * 서버 월: YYYYMM
   * 서버 주차: YYYYWW (예: 202640)
   */
  const fetchInitialFilterValues = useCallback(async () => {
    const result = await getInitialFilterValues();

    setSearchFilter({
      stockMonth: result.stockMonth ? dayjs(result.stockMonth, "YYYYMM") : null,

      // TODO: 회사 주차 DatePicker 변환 방식 확인 후 YYYYWW -> dayjs 변환
      salesDemandWeek: result.salesDemandWeek || null,

      somMonth: result.somMonth ? dayjs(result.somMonth, "YYYYMM") : null,
      somCds: [],
      salesResultMonth: result.salesResultMonth
        ? dayjs(result.salesResultMonth, "YYYYMM")
        : null,

      // TODO: 회사 주차 DatePicker 변환 방식 확인 후 YYYYWW -> dayjs 변환
      inboundDemandWeek: result.inboundDemandWeek || null,
    });
  }, []);

  /** 선택한 SOM 월 기준 코드 목록 조회 */
  const fetchSomCdOptions = useCallback(async (somMonth) => {
    if (!somMonth) {
      setSomCdOptions([]);
      return;
    }

    const result = await getSomCdOptions({
      somMonth: dayjs(somMonth).format("YYYYMM"),
    });

    setSomCdOptions(result || []);
  }, []);

  const handleFilterChange = useCallback((name, value) => {
    setSearchFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSomCdChange = useCallback((selectedSomCds) => {
    setSearchFilter((prev) => ({
      ...prev,
      somCds: selectedSomCds,
    }));
  }, []);

  const handleFilterReset = useCallback(async () => {
    await fetchInitialFilterValues();
  }, [fetchInitialFilterValues]);

  useEffect(() => {
    fetchInitialFilterValues();
  }, [fetchInitialFilterValues]);

  /** SOM 월 변경 시 기존 선택 초기화 후 해당 월 코드 목록 재조회 */
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
