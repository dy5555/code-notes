import { useState } from 'react';
import CommonSelect from '@/components/CommonSelect';
import { FormSearchFilter, SearchRow, SearchItem } from '@/components/SearchLayout';
export default function Plan() {
  const [factory, setFactory] = useState('FAB1');
  const options = [{ label: 'FAB1', value: 'FAB1' }];
  return <FormSearchFilter onSearch={() => {}}><SearchRow><SearchItem><CommonSelect label="공장" value={factory} options={options} onChange={setFactory} placeholder="공장을 선택하세요" /></SearchItem></SearchRow></FormSearchFilter>;
}
