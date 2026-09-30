import { useState } from 'react';
import dayjs from 'dayjs';

const useSearchFilter = () => {
  // 화면에서 사용하는 검색조건을 하나의 객체로 관리
  const [searchForm, setSearchForm] = useState({
    factory: '',
    month1: dayjs().format('YYYY-MM'),
    month2: dayjs().format('YYYY-MM'),
    month3: dayjs().format('YYYY-MM'),
    month4: dayjs().format('YYYY-MM')
  });

  // 검색조건에 표시할 옵션 데이터는 검색값과 별도로 관리
  const [factoryOptions] = useState([
    { value: 'FAB1', label: 'FAB1' },
    { value: 'FAB2', label: 'FAB2' }
  ]);

  // 공통 변경 함수
  // name에 해당하는 searchForm 값만 변경
  const handleChange = (name, value) => {
    setSearchForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 검색조건 초기화 예시
  const reset = () => {
    setSearchForm({
      factory: '',
      month1: dayjs().format('YYYY-MM'),
      month2: dayjs().format('YYYY-MM'),
      month3: dayjs().format('YYYY-MM'),
      month4: dayjs().format('YYYY-MM')
    });
  };

  return {
    searchForm,
    setSearchForm,
    factoryOptions,
    handleChange,
    reset
  };
};

export default useSearchFilter;
