import { useCallback, useEffect, useState } from "react";

/**
 * Hook 파일 네이밍 규칙
 * - 커스텀 Hook 파일/함수는 반드시 use로 시작한다.
 * - 예: useRPAxxxFilter.js / useRPAxxxGrid.js
 */

const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

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
 * 검색조건 전용 Custom Hook
 *
 * 각 월/주차는 서로 독립적으로 관리한다.
 * 단, SOM 코드 목록만 SOM 월에 종속된다.
 *
 * 재고조회 월      -> 독립
 * 판매 Demand 주차 -> 독립
 * SOM 월           -> 독립 (변경 시 SOM 코드 목록만 재조회)
 * 판매실적 월      -> 독립
 * 입고 Demand 주차 -> 독립
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

  const [somCodeOptions, setSomCodeOptions] = useState([]);

  /**
   * 선택한 SOM 월 기준 코드 목록 조회
   * SOM 월이 변경될 때마다 다시 호출된다.
   *
   * TODO: 실제 프로젝트 API로 교체
   */
  const loadSomCodes = useCallback(async (somMonth) => {
    if (!somMonth) {
      setSomCodeOptions([]);
      return;
    }

    const params = {
      somMonth,
    };

    // 예시
    // const result = await api.getSomCodes(params);
    // setSomCodeOptions(result);

    console.log("SOM 코드 조회조건", params);

    // UI 구조 확인용 임시 데이터
    setSomCodeOptions([
      { value: "SOM001", label: `${somMonth} / SOM001` },
      { value: "SOM002", label: `${somMonth} / SOM002` },
    ]);
  }, []);

  /** SOM 테이블에서 실제 데이터가 존재하는 최신 월 조회 */
  const loadLatestSomMonth = useCallback(async () => {
    // const result = await api.getLatestSomMonth();
    // return result.latestMonth;
    return getCurrentMonth(); // 예제용
  }, []);

  /** 판매실적 테이블에서 실제 데이터가 존재하는 최신 월 조회 */
  const loadLatestSalesMonth = useCallback(async () => {
    // const result = await api.getLatestSalesMonth();
    // return result.latestMonth;
    return getCurrentMonth(); // 예제용
  }, []);

  /**
   * 최초 진입 / 초기화 기본값
   * SOM 월, 판매실적 월은 DB 최신 월을 사용한다.
   * 나머지 월/주차는 현재 기준 최신값을 사용한다.
   */
  const setInitialFilter = useCallback(async () => {
    const currentMonth = getCurrentMonth();
    const currentWeek = getCurrentWeek();

    const [latestSomMonth, latestSalesMonth] = await Promise.all([
      loadLatestSomMonth(),
      loadLatestSalesMonth(),
    ]);

    setValues({
      stockMonth: currentMonth,
      salesDemandWeek: currentWeek,
      somCodes: [],
      somMonth: latestSomMonth,
      salesMonth: latestSalesMonth,
      inDemandWeek: currentWeek,
    });
  }, [loadLatestSalesMonth, loadLatestSomMonth]);

  /**
   * 일반 필터 변경
   * 각 필터는 자기 값만 변경하므로 서로 영향을 주지 않는다.
   */
  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /** SOM 코드 멀티콤보 선택값 변경 */
  const handleSomCodeChange = useCallback((codes) => {
    setValues((prev) => ({
      ...prev,
      somCodes: codes,
    }));
  }, []);

  const resetFilter = useCallback(async () => {
    await setInitialFilter();
  }, [setInitialFilter]);

  /** 최초 화면 진입 시 기본 필터 세팅 */
  useEffect(() => {
    setInitialFilter();
  }, [setInitialFilter]);

  /**
   * 핵심 종속관계
   * SOM 월 변경 -> 기존 SOM 코드 선택 초기화 -> 해당 월 기준 코드 재조회
   */
  useEffect(() => {
    if (!values.somMonth) {
      setSomCodeOptions([]);
      return;
    }

    // 이전 월에서 선택한 SOM 코드가 남지 않도록 초기화
    setValues((prev) => ({
      ...prev,
      somCodes: [],
    }));

    loadSomCodes(values.somMonth);
  }, [values.somMonth, loadSomCodes]);

  return {
    values,
    somCodeOptions,
    handleChange,
    handleSomCodeChange,
    resetFilter,
  };
};

export default useRPAxxxFilter;
