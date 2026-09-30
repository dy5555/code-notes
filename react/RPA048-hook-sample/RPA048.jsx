import React from 'react';
import useSearchFilter from './hooks/useSearchFilter';
import useRPA048Data from './hooks/useRPA048Data';

const RPA048 = () => {
  // 필터 로직과 메인 조회 로직을 각각 호출
  const filter = useSearchFilter();
  const data = useRPA048Data();

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

      <input
        type="month"
        value={filter.searchForm.month1}
        onChange={(e) => filter.handleChange('month1', e.target.value)}
      />

      <button onClick={handleSearch}>조회</button>

      {data.loading && <div>조회중...</div>}

      <pre>{JSON.stringify(data.rowData, null, 2)}</pre>
    </div>
  );
};

export default RPA048;
