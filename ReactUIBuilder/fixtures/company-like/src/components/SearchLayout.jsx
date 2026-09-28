export function FormSearchFilter({ children, onSearch }) { return <section><div>{children}</div><button onClick={onSearch}>조회</button></section>; }
export function SearchRow({ children }) { return <div className="search-row">{children}</div>; }
export function SearchItem({ children }) { return <div className="search-item">{children}</div>; }
