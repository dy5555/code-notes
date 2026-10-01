import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";

/**
 * Hook 파일 네이밍 규칙
 * - 커스텀 Hook 파일/함수는 반드시 use로 시작한다.
 * - 예: useRPAxxxFilter.js / useRPAxxxGrid.js
 *
 * 날짜 처리 규칙
 * - DatePicker에 들어가는 월 값은 dayjs 객체로 관리한다.
 * - API/쿼리 호출 직전에 YYYYMM 문자열로 변환한다.
 */

/** 현재 월: DatePicker에서 사용할 dayjs 객체 */
const getCurrentMonth = () => dayjs().startOf("month");

/**
 * 현재 주차 값
 * 프로젝트의 주차 컴포넌트/공통함수가 있다면 해당 규칙으로 교체한다.
 */
const getCurrentWeek = () => {
  const startOfYear = dayjs().startOf("year");
  const diffDays = dayjs().startOf("day").diff(startOfYear, "day");
  const week = Math.ceil((diffDays + startOfYear.day() + 1) / 7);
  return `${dayjs().format("YYYY")}-W${String(week).padStart(2, "0")}`;
};

const useRPAxxxFilter = () => {
  const [values, setValues] = useState({
    // 월 DatePicker 값은 dayjs 객체로 관리
    stockMonth: null,
    salesDemandWeek: "",
    somCodes: [],
    somMonth: null,
    salesMonth: null,
    inDemandWeek: "",
  });

  const [somCodeOptions, setSomCodeOptions] = useState([]);

  /**
   * SOM 코드 목록 조회
   * SOM 월이 변경될 때마다 해당 월을 YYYYMM으로 변환하여 조회한다.
   */
  const loadSomCodes = useCallback(async (somMonth) => {
    if (!somMonth) {
      setSomCodeOptions([]);
      return;
    }

    const params = {
      somMonth: dayjs(somMonth).format("YYYYMM"),
    };

    // TODO: 실제 프로젝트 API로 교체
    // const result = await api.getSomCodes(params);
    // setSomCodeOptions(result);

    console.log("SOM 코드 조회조건", params);

    setSomCodeOptions([
      { value: "SOM001", label: `${params.somMonth} / SOM001` },
      { value: "SOM002", label: `${params.somMonth} / SOM002` },
    ]);
  }, []);

  /**
   * SOM 테이블 최신 월 조회
   * 실제 API에서 202609 같은 문자열이 오면 dayjs 객체로 변환해서 DatePicker에 넣는다.
   */
  const loadLatestSomMonth = useCallback(async () => {
    // const result = await api.getLatestSomMonth();
    // return dayjs(result.latestMonth, "YYYYMM");

    return getCurrentMonth(); // 예제용
  }, []);

  /** 판매실적 테이블 최신 월 조회 */
  const loadLatestSalesMonth = useCallback(async () => {
    // const result = await api.getLatestSalesMonth();
    // return dayjs(result.latestMonth, "YYYYMM");

    return getCurrentMonth(); // 예제용
  }, []);

  /**
   * 최초 진입 / 초기화
   * - 재고조회 월: 현재 최신 월
   * - 판매 Demand 주차: 현재 최신 주차
   * - SOM 월: DB 최신 월
   * - 판매실적 월: DB 최신 월
   * - 입고 Demand 주차: 현재 최신 주차
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

  /** 각 필터는 자기 값만 변경한다. */
  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSomCodeChange = useCallback((codes) => {
    setValues((prev) => ({
      ...prev,
      somCodes: codes,
    }));
  }, []);

  const resetFilter = useCallback(async () => {
    await setInitialFilter();
  }, [setInitialFilter]);

  useEffect(() => {
    setInitialFilter();
  }, [setInitialFilter]);

  /**
   * 유일한 종속관계
   * SOM 월 변경 -> 기존 SOM 코드 선택 초기화 -> 변경 월 기준 코드 재조회
   */
  useEffect(() => {
    if (!values.somMonth) {
      setSomCodeOptions([]);
      return;
    }

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
