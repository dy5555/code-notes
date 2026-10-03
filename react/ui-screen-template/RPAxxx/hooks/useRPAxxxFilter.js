import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";

/**
 * 검색 필터 전용 Custom Hook
 *
 * 운영/유지보수 원칙
 * 1. 관련 검색조건은 searchFilter 객체 하나로 묶어서 관리한다.
 * 2. 변수/함수명만 보고도 업무 의미를 알 수 있도록 작성한다.
 * 3. 화면 최초 진입 시 최신 월/주차는 서버 API 한 번으로 조회한다.
 * 4. 프론트에서는 최신 월/주차를 별도로 계산하지 않는다.
 * 5. 월 DatePicker 값은 dayjs 객체로 관리한다.
 * 6. SOM 코드 목록만 SOM 월에 종속된다.
 */
const useRPAxxxFilter = () => {
  /**
   * 화면 검색조건
   * 각 월/주차 값은 서로 독립적으로 변경된다.
   */
  const [searchFilter, setSearchFilter] = useState({
    stockMonth: null,            // 재고조회 월
    salesDemandWeek: "",         // 판매 Demand 주차
    somMonth: null,              // 수요 SOM 월
    somCodes: [],                // 수요 SOM 코드 멀티콤보 선택값
    salesResultMonth: null,      // 판매실적 월
    inboundDemandWeek: "",       // 입고 Demand 주차
  });

  // SOM 월을 기준으로 조회한 코드 멀티콤보 목록
  const [somCodeOptions, setSomCodeOptions] = useState([]);

  /**
   * 화면 최초 진입 시 필요한 최신 월/주차를 서버에서 한 번에 조회한다.
   *
   * DB에서는 필요한 테이블의 최신 기준값을 UNION ALL 등으로 한 번에 조회하고,
   * 서버에서는 아래처럼 의미 있는 필드명으로 가공해서 내려주는 것을 권장한다.
   *
   * {
   *   stockMonth: "202610",
   *   salesDemandWeek: "202640",
   *   somMonth: "202609",
   *   salesResultMonth: "202609",
   *   inboundDemandWeek: "202640"
   * }
   */
  const fetchInitialFilterValues = useCallback(async () => {
    // TODO: 실제 프로젝트 초기 필터 조회 API로 교체
    // const result = await api.fetchInitialFilterValues();

    // 예제용 서버 응답
    const result = {
      stockMonth: "202610",
      salesDemandWeek: "202640",
      somMonth: "202609",
      salesResultMonth: "202609",
      inboundDemandWeek: "202640",
    };

    // 서버 문자열을 화면 컴포넌트가 사용하는 형식으로 한 번만 변환한다.
    setSearchFilter({
      stockMonth: result.stockMonth ? dayjs(result.stockMonth, "YYYYMM") : null,
      salesDemandWeek: result.salesDemandWeek || "",
      somMonth: result.somMonth ? dayjs(result.somMonth, "YYYYMM") : null,
      somCodes: [],
      salesResultMonth: result.salesResultMonth
        ? dayjs(result.salesResultMonth, "YYYYMM")
        : null,
      inboundDemandWeek: result.inboundDemandWeek || "",
    });
  }, []);

  /**
   * 선택한 SOM 월 기준 코드 목록 조회
   * SOM 월 변경 시에만 호출한다.
   */
  const fetchSomCodeOptions = useCallback(async (somMonth) => {
    if (!somMonth) {
      setSomCodeOptions([]);
      return;
    }

    const requestParams = {
      somMonth: dayjs(somMonth).format("YYYYMM"),
    };

    // TODO: 실제 SOM 코드 목록 API로 교체
    // const result = await api.fetchSomCodeOptions(requestParams);
    // setSomCodeOptions(result);

    console.log("SOM 코드 목록 조회조건", requestParams);

    // UI 확인용 임시 데이터
    setSomCodeOptions([
      { value: "SOM001", label: `${requestParams.somMonth} / SOM001` },
      { value: "SOM002", label: `${requestParams.somMonth} / SOM002` },
    ]);
  }, []);

  /**
   * 일반 검색조건 변경
   * 하나의 공통 함수로 관리하여 필터별 set 함수 생성을 줄인다.
   */
  const handleFilterChange = useCallback((filterName, filterValue) => {
    setSearchFilter((previousFilter) => ({
      ...previousFilter,
      [filterName]: filterValue,
    }));
  }, []);

  /** SOM 코드 멀티콤보 선택값 변경 */
  const handleSomCodeChange = useCallback((selectedSomCodes) => {
    setSearchFilter((previousFilter) => ({
      ...previousFilter,
      somCodes: selectedSomCodes,
    }));
  }, []);

  /** 검색조건 초기화: 서버의 최신 기준값을 다시 조회한다. */
  const handleFilterReset = useCallback(async () => {
    await fetchInitialFilterValues();
  }, [fetchInitialFilterValues]);

  /** 화면 최초 진입 시 초기 필터 API는 한 번만 호출한다. */
  useEffect(() => {
    fetchInitialFilterValues();
  }, [fetchInitialFilterValues]);

  /**
   * 유일한 필터 종속관계
   * SOM 월 변경
   *   -> 이전 월에서 선택한 SOM 코드 초기화
   *   -> 변경된 SOM 월 기준 코드 목록 재조회
   */
  useEffect(() => {
    if (!searchFilter.somMonth) {
      setSomCodeOptions([]);
      return;
    }

    setSearchFilter((previousFilter) => ({
      ...previousFilter,
      somCodes: [],
    }));

    fetchSomCodeOptions(searchFilter.somMonth);
  }, [searchFilter.somMonth, fetchSomCodeOptions]);

  return {
    searchFilter,
    somCodeOptions,
    handleFilterChange,
    handleSomCodeChange,
    handleFilterReset,
  };
};

export default useRPAxxxFilter;
