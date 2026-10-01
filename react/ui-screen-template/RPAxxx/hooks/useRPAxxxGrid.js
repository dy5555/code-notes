import { useCallback, useMemo, useState } from "react";

/**
 * 메인 ag-Grid 전용 Hook
 *
 * 여기에서 담당하는 것
 * - 메인 조회 API 호출
 * - 검색조건을 API 파라미터로 변환
 * - rowData 관리
 * - columnDefs 관리
 */
const useRPAxxxGrid = (filterValues) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * 현재까지 확정된 정적 컬럼 5개
   * 추후 월/주차별 동적 컬럼이 생기면 여기에서 뒤에 붙이면 된다.
   */
  const columnDefs = useMemo(
    () => [
      {
        headerName: "구분",
        field: "type",
      },
      {
        headerName: "SALES_PROD_ID",
        field: "salesProdId",
      },
      {
        headerName: "RP_SOM_CD",
        field: "rpSomCd",
      },
      {
        headerName: "일괄보정여부",
        field: "batchCorrectionYn",
      },
      {
        headerName: "보정 RP_SOM_CD",
        field: "correctedRpSomCd",
      },
    ],
    []
  );

  /**
   * 조회 버튼 클릭 시 실행
   */
  const search = useCallback(async () => {
    // API로 넘길 조회조건을 한 곳에서 확인할 수 있게 구성
    const params = {
      stockMonth: filterValues.stockMonth,
      salesDemandWeek: filterValues.salesDemandWeek,
      somCodes: filterValues.somCodes,
      somMonth: filterValues.somMonth,
      salesMonth: filterValues.salesMonth,
      inDemandWeek: filterValues.inDemandWeek,
    };

    try {
      setLoading(true);

      // TODO: 실제 메인 조회 API로 교체
      // const result = await api.searchRPAxxx(params);
      // setRowData(result);

      console.log("메인 조회조건", params);

      // UI 확인용 임시 데이터
      setRowData([
        {
          type: "예시",
          salesProdId: "PROD001",
          rpSomCd: "SOM001",
          batchCorrectionYn: "N",
          correctedRpSomCd: "",
        },
      ]);
    } catch (error) {
      console.error("메인 조회 중 오류가 발생했습니다.", error);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [filterValues]);

  return {
    rowData,
    columnDefs,
    loading,
    search,
  };
};

export default useRPAxxxGrid;
