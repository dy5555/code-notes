export default function CommonSelect({ label, value, options, onChange, placeholder }) {
  return <label>{label}<select value={value} onChange={onChange} data-placeholder={placeholder}>{options.map((item) => <option key={item.value}>{item.label}</option>)}</select></label>;
}
