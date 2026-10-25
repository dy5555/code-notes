import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getInitialMonthWeek } from "../../../../../api/r/pm/pla/AAA013Api";

/**
 * 서버의 YYYYMM 문자열(예: 202610)을 DatePicker가 이해하는 dayjs로 변환합니다.
 * 값이 없거나 형식이 잘못되면 null을 반환합니다.
 */
const toMonthDate = (ym) => {
  const value = String(ym ?? "");
  if (!/^\\d{6}$/.test(value)) return null;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  if (month < 1 || month > 12) return null;
  return dayjs(new Date(year, month - 1, 1));
};

/**
 * 주차는 사내 DatePicker의 value 규격에 따라 변환 방식이 달라집니다.
 * 서버의 YYYYWW가 ISO 주차인지 확인되지 않았으므로 원본 문자열을 보관합니다.
 * 실제 WeekPicker에 연결할 때 프로젝트 주차 기준에 맞춰 변환하세요.
 */
const toWeekValue = (week) => (week == null ? null : String(week));

/**
 * [커스텀 Hook]
 * - useState: 화면에 표시할 월/주차 값을 기억합니다.
 * - useEffect: 화면이 처음 나타났을 때 API를 한 번 호출합니다.
 * - return: Tab에서 사용할 값들을 꺼내 줍니다.
 */
const useAAA013Search = () => {
  const [searchFilter, setSearchFilter] = useState({
    stockMonth: null,
    salesDemandWeek: null,
    somMonth: null,
    somCds: [],
    salesResultMonth: null,
    inboundDemandWeek: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 컴포넌트가 사라진 뒤에는 비동기 응답으로 상태를 변경하지 않습니다.
    let active = true;

    const fetchInitialValues = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getInitialMonthWeek();

        // TODO: 서버 응답이 response.data인지 response.data.data인지 확인하세요.
        const data = response?.data ?? response;
        if (!data || typeof data !== "object") {
          throw new Error("초기 월·주차 응답 형식이 올바르지 않습니다.");
        }
        if (!active) return;

        setSearchFilter((prev) => ({
          ...prev,
          stockMonth: toMonthDate(data.stockMonth),
          salesDemandWeek: toWeekValue(data.salesDemandWeek),
          somMonth: toMonthDate(data.somMonth),
          salesResultMonth: toMonthDate(data.salesResultMonth),
          inboundDemandWeek: toWeekValue(data.inboundDemandWeek),
        }));
      } catch (err) {
        if (active) setError(err?.message ?? "월·주차 조회에 실패했습니다.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInitialValues();
    return () => { active = false; };
  }, []);

  return { searchFilter, setSearchFilter, loading, error };
};

export default useAAA013Search;
