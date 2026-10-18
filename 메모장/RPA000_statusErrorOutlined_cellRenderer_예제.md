```jsx
cellRenderer: (params) =>
    params.value === 'Y' ? '보정가능' :
    params.value === 'N' ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <IconReact name="statusErrorOutlined" />
            보정불가
        </span>
    ) : ''
```

> 참고: `IconReact`가 `name` 속성으로 `statusErrorOutlined`를 지원하는지는 기존 프로젝트의 사용 코드를 확인해야 합니다.
