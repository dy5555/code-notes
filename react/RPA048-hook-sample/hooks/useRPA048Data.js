import { useState } from 'react';

const useRPA048Data = () => {
  // 조회 결과와 조회 상태는 메인 데이터 hook에서 관리
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (searchForm) => {
    try {
      setLoading(true);

      // 실제 프로젝트에서는 여기서 API 호출
      // const result = await api.getRPA048(searchForm);
      // setRowData(result.data);

      console.log('조회조건:', searchForm);

      // 구조 확인용 샘플 데이터
      setRowData([
        {
          factory: searchForm.factory,
          month: searchForm.month1,
          result: 'sample'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    rowData,
    loading,
    search
  };
};

export default useRPA048Data;
