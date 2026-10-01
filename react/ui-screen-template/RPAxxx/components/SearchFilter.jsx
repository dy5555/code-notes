import React from "react";

/**
 * 검색조건 영역
 *
 * 실제 사내 프로젝트에서는 아래 input/select를
 * 공통 DatePicker, SelectInput, MultiCombo 등의 컴포넌트로 교체해서 사용하면 된다.
 *
 * 필터 구성
 * - 재고조회 월          : 현재 기준 최신 월
 * - 판매 Demand 주차     : 현재 기준 최신 주차
 * - 수요 SOM 코드        : 멀티콤보 / 코드 API 조회
 * - 수요 SOM 월          : DB 조회 결과의 최신 월
 * - 판매실적 월          : DB 조회 결과의 최신 월
 * - 입고 Demand 주차     : 현재 기준 최신 주차
 */
const SearchFilter = ({
  values,
  somCodeOptions,
  onChange,
  onSomCodeChange,
  onReset,
  onSearch,
}) => {
  return (
    <div className="search-filter">
      <div>
        <label>재고조회 월</label>
        <input
          type="month"
          value={values.stockMonth}
          onChange={(e) => onChange("stockMonth", e.target.value)}
        />
      </div>

      <div>
        <label>판매 Demand 주차</label>
        <input
          type="week"
          value={values.salesDemandWeek}
          onChange={(e) => onChange("salesDemandWeek", e.target.value)}
        />
      </div>

      <div>
        <label>수요 SOM 코드</label>
        <select
          multiple
          value={values.somCodes}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(
              (option) => option.value
            );
            onSomCodeChange(selected);
          }}
        >
          {somCodeOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>수요 SOM 월</label>
        <input
          type="month"
          value={values.somMonth}
          onChange={(e) => onChange("somMonth", e.target.value)}
        />
      </div>

      <div>
        <label>판매실적 월</label>
        <input
          type="month"
          value={values.salesMonth}
          onChange={(e) => onChange("salesMonth", e.target.value)}
        />
      </div>

      <div>
        <label>입고 Demand 주차</label>
        <input
          type="week"
          value={values.inDemandWeek}
          onChange={(e) => onChange("inDemandWeek", e.target.value)}
        />
      </div>

      <div>
        <button type="button" onClick={onReset}>
          초기화
        </button>
        <button type="button" onClick={onSearch}>
          조회
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
