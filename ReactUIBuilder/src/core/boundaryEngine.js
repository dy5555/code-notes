const STOP_PATTERNS = [
  /^App$/i, /Router/i, /^Route/i, /Provider$/i, /Page$/i, /Screen$/i,
  /^Layout$/i, /MainLayout/i, /Tabs?$/i, /TabPanel/i, /ModalRoot/i,
];

const INCLUDE_PATTERNS = [
  /Form/i, /Filter/i, /Search/i, /Row/i, /Item/i, /Field/i, /Section/i,
  /Grid/i, /Flex/i, /Stack/i, /Toolbar/i, /Panel/i, /Group/i,
];

export function inferBoundary(component, usage, screenId = '') {
  const ancestors = usage?.jsxAncestors || [];
  const candidates = [];
  for (const name of ancestors) {
    if (!name || /^[a-z]/.test(name)) continue;
    if (name === screenId || STOP_PATTERNS.some((pattern) => pattern.test(name))) break;
    candidates.push({
      name,
      included: INCLUDE_PATTERNS.some((pattern) => pattern.test(name)),
      reason: INCLUDE_PATTERNS.some((pattern) => pattern.test(name)) ? 'UI 배치 부모' : '사용 구조 부모',
    });
  }
  // 가장 가까운 커스텀 부모는 이름 규칙과 무관하게 기본 포함한다.
  if (candidates[0]) candidates[0].included = true;
  return {
    componentName: component?.name || '',
    candidates,
    includedParents: candidates.filter((item) => item.included).map((item) => item.name),
  };
}

export function toggleBoundary(boundary, name) {
  return {
    ...boundary,
    candidates: boundary.candidates.map((item) => item.name === name ? { ...item, included: !item.included } : item),
    includedParents: boundary.candidates
      .map((item) => item.name === name ? { ...item, included: !item.included } : item)
      .filter((item) => item.included)
      .map((item) => item.name),
  };
}
