import { useCallback, useEffect, useState } from "react";

/**
 * 현재 월을 YYYY-MM 형태로 반환
 * 예) 2026-10
 */
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/**
 * 현재 날짜가 포함된 ISO 주차를 YYYY-Www 형태로 반환한다.
 * 실제 회사 공통 주차 계산 함수가 있다면 이 함수 대신 공통 함수를 사용한다.
 */
const getCurrentWeek = () => {
  const now = new Date();
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);

  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

/**
 * 화면 검색조건 전용 Hook
 *
 * 여기에서 담당하는 것
 * - 검색조건 state
 * - 화면 최초 진입 시 기본값 세팅
 * - SOM 코드 목록 조회
 * - SOM 최신 월 조회
 * - 판매실적 최신 월 조회
 * - 검색조건 변경/초기화
 */
const useRPAxxxFilter = () => {
  const [values, setValues] = useState({
    stockMonth: "",
    salesDemandWeek: "",
    somCodes: [],
    somMonth: "",
    salesMonth: "",
    inDemandWeek: "",
  });

  // SOM 멀티콤보에서 사용할 코드 목록
  const [somCodeOptions, setSomCodeOptions] = useState([]);

  /**
   * SOM 코드 목록 조회
   * TODO: 실제 프로젝트 API 함수로 교체
   */
  const loadSomCodes = useCallback(async () => {
    // const result = await api.getSomCodes();
    // setSomCodeOptions(result);

    // 화면 구조 확인용 임시 데이터
    setSomCodeOptions([
      { value: "SOM001", label: "SOM001" },
      { value: "SOM002", label: "SOM002" },
    ]);
  }, []);

  /**
   * SOM 테이블에서 사용 가능한 최신 월 조회
   * TODO: 실제 API 호출로 교체
   */
  const loadLatestSomMonth = useCallback(async () => {
    // const result = await api.getLatestSomMonth();
    // return result.latestMonth;

    return getCurrentMonth(); // 예제용
  }, []);

  /**
   * 판매실적 테이블에서 사용 가능한 최신 월 조회
   * TODO: 실제 API 호출로 교체
   */
  const loadLatestSalesMonth = useCallback(async () => {
    // const result = await api.getLatestSalesMonth();
    // return result.latestMonth;

    return getCurrentMonth(); // 예제용
  }, []);

  /**
   * 최초 진입 및 초기화 시 사용할 검색조건 세팅
   *
   * 중요:
   * SOM 월 / 판매실적 월은 현재 월을 무조건 넣는 것이 아니라
   * DB 테이블을 조회하여 실제 데이터가 존재하는 최신 월을 사용한다.
   */
  const setInitialFilter = useCallback(async () => {
    const currentMonth = getCurrentMonth();
    const currentWeek = getCurrentWeek();

    const [latestSomMonth, latestSalesMonth] = await Promise.all([
      loadLatestSomMonth(),
      loadLatestSalesMonth(),
    ]);

    setValues({
      // 현재 기준 최신 월
      stockMonth: currentMonth,

      // 현재 기준 최신 주차
      salesDemandWeek: currentWeek,

      // SOM 코드는 사용자가 멀티콤보에서 선택
      somCodes: [],

      // DB의 SOM 데이터 기준 최신 월
      somMonth: latestSomMonth,

      // DB의 판매실적 데이터 기준 최신 월
      salesMonth: latestSalesMonth,

      // 현재 기준 최신 주차
      inDemandWeek: currentWeek,
    });
  }, [loadLatestSalesMonth, loadLatestSomMonth]);

  /** 일반 검색조건 변경 */
  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /** SOM 멀티콤보 변경 */
  const handleSomCodeChange = useCallback((codes) => {
    setValues((prev) => ({
      ...prev,
      somCodes: codes,
    }));
  }, []);

  /** 초기화 버튼 */
  const resetFilter = useCallback(async () => {
    await setInitialFilter();
  }, [setInitialFilter]);

  /** 화면 최초 진입 시 필요한 초기 데이터 조회 */
  useEffect(() => {
    loadSomCodes();
    setInitialFilter();
  }, [loadSomCodes, setInitialFilter]);

  return {
    values,
    somCodeOptions,
    handleChange,
    handleSomCodeChange,
    resetFilter,
  };
};

export default useRPAxxxFilter;
