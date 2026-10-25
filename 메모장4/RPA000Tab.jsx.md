# RPA000Tab.jsx — 조회/초기화/일괄보정 연결 (풀코드)

메모장3 대비 수정
- 요약/자리표시자 JSX → 퍼블리셔 `tabs/RPA000Tab.jsx` 레이아웃 기준 풀코드
- 퍼블리셔 배치대로 조회·초기화·일괄보정 버튼을 이 파일에 둠 (보정 건수도 여기서 계산)
- 일괄보정 중복 요청 방지 (`adjustingRef`)
- 일괄보정 실패 시 오류 알림 (try/catch)
- 조회 중(`isLoading`)에는 일괄보정 버튼 비활성화

```jsx
import React, { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { Card, Button, Space, Typography, Modal } from 'antd';
import SearchFilterComp from '../components/SearchFilterComp';
import TableComp from '../components/TableComp';
import { useRPA000Fetch } from '../hooks/useRPA000Fetch';

export default function RPA000Tab({
    tabId,
    filters,
    formMethods,
    somCodeList,
    availableSomMonths,
    applyAvailableSomMonths,
    disabledSearchBox,
    initialStockMonth,
    initialSalesResultMonth,
    applyInitialData,
    applySomCodes,
    handleSomMonthChange,
    resetFilters,
    getSearchParams
}) {
    const {
        initialData,
        isInitialSuccess,
        somAvailableMonthData,
        isSomAvailableMonthSuccess,
        isSomAvailableMonthLoading,
        somCodeData,
        isSomSuccess,
        somMonth,
        rowData,
        isLoading,
        isSearched,
        setSomMonth,
        search,
        clearGrid,
        batchAdjust,
        isAdjusting
    } = useRPA000Fetch(tabId);

    // aaa01 최초 월·주차: 한 번만 적용
    const initialAppliedRef = useRef(false);

    useEffect(() => {
        if (!isInitialSuccess || initialAppliedRef.current) return;
        initialAppliedRef.current = true;

        const initialSomMonth = applyInitialData(initialData);
        if (initialSomMonth) setSomMonth(initialSomMonth);
    }, [isInitialSuccess, initialData, applyInitialData, setSomMonth]);

    // aaa05 최초 조회 결과: SOM CD가 존재하는 년월 목록 저장
    useEffect(() => {
        if (!isSomAvailableMonthSuccess) return;
        applyAvailableSomMonths(somAvailableMonthData);
    }, [isSomAvailableMonthSuccess, somAvailableMonthData, applyAvailableSomMonths]);

    // aaa02 SOM 코드 결과: 현재 월에만, 같은 결과는 한 번만 적용
    const appliedSomRef = useRef({ month: null, data: null });

    useEffect(() => {
        if (!somMonth) {
            appliedSomRef.current = { month: null, data: null };
            return;
        }
        if (!isSomSuccess) return;

        if (appliedSomRef.current.month === somMonth &&
            appliedSomRef.current.data === somCodeData) return;

        appliedSomRef.current = { month: somMonth, data: somCodeData };
        applySomCodes(somCodeData, somMonth);
    }, [isSomSuccess, somCodeData, somMonth, applySomCodes]);

    // SOM 월 변경: 폼 값은 RHF field.onChange가 반영, 여기서는 코드 초기화 + 재조회
    const onSomMonthChange = (newMonth) => {
        handleSomMonthChange(newMonth);
        setSomMonth(newMonth ? dayjs(newMonth).format('YYYYMM') : null);
    };

    // 조회 버튼
    const handleSearch = async () => {
        if (disabledSearchBox) return;
        search(getSearchParams());
    };

    // 초기화 버튼 (API 재조회 없음)
    const handleReset = async () => {
        resetFilters();
        setSomMonth(null);
        appliedSomRef.current = { month: null, data: null };
        clearGrid();
    };

    // 일괄보정 대상
    const adjustTargets = (rowData ?? [])
        .filter((item) => item.gnlCrrYn === 'Y')
        .map((item) => ({
            salesProdId: item.salesProdId,
            tobeRpSomcd: item.tobeRpSomcd
        }));
    const adjustCount = adjustTargets.length;

    // 확인창이 떠 있는 동안 중복 클릭 방지
    const adjustingRef = useRef(false);

    const handleBatchAdjust = () => {
        if (isAdjusting || adjustingRef.current) return;
        if (adjustCount === 0) return;

        adjustingRef.current = true;

        Modal.confirm({
            title: '일괄보정 확인',
            content: 'SOM CD 일괄보정을 진행하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onCancel: () => {
                adjustingRef.current = false;
            },
            onOk: async () => {
                try {
                    await batchAdjust({ adjustList: adjustTargets });
                    Modal.success({
                        title: '알림',
                        content: (
                            <>
                                SOM CD 일괄 보정을 완료하였습니다.<br />
                                데이터를 다시 조회합니다.
                            </>
                        ),
                        okText: '확인',
                        onOk: () => {
                            search(getSearchParams());
                        }
                    });
                } catch (error) {
                    Modal.error({
                        title: '오류',
                        content: 'SOM CD 일괄보정 중 오류가 발생했습니다.',
                        okText: '확인'
                    });
                } finally {
                    adjustingRef.current = false;
                }
            }
        });
    };

    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={4}>SOM 코드 보정</Typography.Title>
            <Card size="small" style={{ marginBottom: 12 }}>
                <SearchFilterComp
                    filters={filters}
                    formMethods={formMethods}
                    somCodeList={somCodeList}
                    availableSomMonths={availableSomMonths}
                    isSomAvailableMonthLoading={isSomAvailableMonthLoading}
                    initialStockMonth={initialStockMonth}
                    initialSalesResultMonth={initialSalesResultMonth}
                    onSomMonthChange={onSomMonthChange}
                />
                <Space style={{ marginTop: 12, width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={handleReset}>초기화</Button>
                    <Button
                        type="primary"
                        onClick={handleSearch}
                        disabled={disabledSearchBox}
                    >
                        조회
                    </Button>
                </Space>
            </Card>
            <Card size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Typography.Text strong>조회 결과</Typography.Text>
                    <Button
                        type="primary"
                        onClick={handleBatchAdjust}
                        loading={isAdjusting}
                        disabled={isAdjusting || isLoading || adjustCount === 0}
                    >
                        {isAdjusting
                            ? '일괄보정 처리 중...'
                            : `보정 가능 데이터 : ${adjustCount}건 일괄보정`}
                    </Button>
                </div>
                <TableComp
                    rowData={rowData}
                    isLoading={isLoading}
                    isSearched={isSearched}
                />
            </Card>
        </div>
    );
}

RPA000Tab.propTypes = {
    tabId: PropTypes.string,
    filters: PropTypes.object,
    formMethods: PropTypes.object.isRequired,
    somCodeList: PropTypes.array,
    availableSomMonths: PropTypes.arrayOf(PropTypes.string),
    applyAvailableSomMonths: PropTypes.func.isRequired,
    disabledSearchBox: PropTypes.bool,
    initialStockMonth: PropTypes.object,
    initialSalesResultMonth: PropTypes.object,
    applyInitialData: PropTypes.func.isRequired,
    applySomCodes: PropTypes.func.isRequired,
    handleSomMonthChange: PropTypes.func.isRequired,
    resetFilters: PropTypes.func.isRequired,
    getSearchParams: PropTypes.func.isRequired
};
```

- Java는 `adjustList`를 받아 행별 프로시저를 호출하며, `gnlCrrYn = 'Y'`·권한을 서버에서 다시 확인해야 합니다.
