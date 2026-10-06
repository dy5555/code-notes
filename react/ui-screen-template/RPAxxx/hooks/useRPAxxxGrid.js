import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  searchRpa048,
  getCorrectionAvailableCnt,
  batchCorrection,
} from "../../../api/r/pm/pla/RPAxxxApi";

/**
 * 메인 ag-Grid 전용 Hook
 */
const useRPAxxxGrid = (searchFilter) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [correctionAvailableCnt, setCorrectionAvailableCnt] = useState(0);

  const columnDefs = useMemo(
    () => [
      { headerName: "구분", field: "type" },
      { headerName: "SALES_PROD_ID", field: "salesProdId" },
      { headerName: "RP_SOM_CD", field: "rpSomCd" },
      { headerName: "일괄보정여부", field: "batchCorrectionYn" },
      { headerName: "보정 RP_SOM_CD", field: "correctedRpSomCd" },
    ],
    []
  );

  /** 화면 검색조건 -> API 파라미터 */
  const makeParams = useCallback(() => ({
    stockMonth: searchFilter.stockMonth
      ? dayjs(searchFilter.stockMonth).format("YYYYMM")
      : "",
    salesDemandWeek: searchFilter.salesDemandWeek,
    somCds: searchFilter.somCds,
    somMonth: searchFilter.somMonth
      ? dayjs(searchFilter.somMonth).format("YYYYMM")
      : "",
    salesResultMonth: searchFilter.salesResultMonth
      ? dayjs(searchFilter.salesResultMonth).format("YYYYMM")
      : "",
    inboundDemandWeek: searchFilter.inboundDemandWeek,
  }), [searchFilter]);

  /** 메인 조회 */
  const handleSearch = useCallback(async () => {
    const params = makeParams();

    try {
      setLoading(true);

      const [rows, cntResult] = await Promise.all([
        searchRpa048(params),
        getCorrectionAvailableCnt(params),
      ]);

      setRowData(rows || []);
      setCorrectionAvailableCnt(Number(cntResult?.cnt || 0));
    } catch (error) {
      console.error("메인 조회 중 오류가 발생했습니다.", error);
      setRowData([]);
      setCorrectionAvailableCnt(0);
    } finally {
      setLoading(false);
    }
  }, [makeParams]);

  /** 보정 RP_SOM_CD가 입력된 Row만 서버로 전달하여 일괄보정 */
  const handleBatchCorrection = useCallback(async () => {
    if (correctionAvailableCnt <= 0) return;

    const correctionRows = rowData
      .filter((row) => row.correctedRpSomCd)
      .map((row) => ({
        salesProdId: row.salesProdId,
        correctionRpSomCd: row.correctedRpSomCd,
      }));

    // 실제 입력된 보정값이 없으면 API를 호출하지 않는다.
    if (correctionRows.length === 0) return;

    try {
      setLoading(true);

      // 프론트에서는 API를 한 번만 호출한다.
      // 서버에서는 correctionRows를 for문으로 순회하며 프로시저를 호출한다.
      await batchCorrection(correctionRows);

      // 보정 완료 후 Grid와 보정 가능 건수를 최신 상태로 다시 조회한다.
      await handleSearch();
    } catch (error) {
      console.error("일괄보정 중 오류가 발생했습니다.", error);
    } finally {
      setLoading(false);
    }
  }, [correctionAvailableCnt, rowData, handleSearch]);

  return {
    rowData,
    columnDefs,
    loading,
    correctionAvailableCnt,
    handleSearch,
    handleBatchCorrection,
  };
};

export default useRPAxxxGrid;
