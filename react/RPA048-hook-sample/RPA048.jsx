import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import useSearchFilter from './hooks/useSearchFilter';
import useRPA048Data from './hooks/useRPA048Data';

const RPA048 = () => {
  // 필터 로직과 메인 조회 로직을 각각 호출
  const filter = useSearchFilter();
  const data = useRPA048Data();

  // 테스트용: 화면이 뜬 뒤 500ms 후 월 값을 다시 세팅
  // 이때 월이 표시된다면 초기 렌더링/초기화 순서 문제를 의심할 수 있음
  // 최종 운영 코드에서는 setTimeout을 제거하고 덮어쓰는 초기화 로직을 찾는 것이 좋음
  useEffect(() => {
    const timer = setTimeout(() => {
      filter.setSearchForm((prev) => ({
        ...prev,
        month1: dayjs('2026-09-01')
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 조회 버튼 클릭 시 현재 검색조건을 메인 조회 hook에 전달
  const handleSearch = () => {
    data.search(filter.searchForm);
  };

  return (
    <div>
      <h2>RPA048 Sample</h2>

      {/* 실제 프로젝트의 SelectInput / MonthPicker 등으로 교체 */}
      <select
        value={filter.searchForm.factory}
        onChange={(e) => filter.handleChange('factory', e.target.value)}
      >
        <option value="">공장 선택</option>
        {filter.factoryOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      {/* 회사 공통 월 달력이라면 value에 Day.js 객체를 넘기는 형태 참고 */}
      <div>
        month1: {dayjs.isDayjs(filter.searchForm.month1)
          ? filter.searchForm.month1.format('YYYYMM')
          : String(filter.searchForm.month1 ?? '')}
      </div>

      <button onClick={handleSearch}>조회</button>

      {data.loading && <div>조회중...</div>}

      <pre>{JSON.stringify(data.rowData, null, 2)}</pre>
    </div>
  );
};

export default RPA048;
