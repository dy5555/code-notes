# SearchFilterComp.jsx — 검색조건 6개 (풀코드)

메모장3 대비 수정
- 요약/주석 예시 → 퍼블리셔 `components/SearchFilterComp.jsx` 기준 풀코드
- 각 필드를 React Hook Form `Controller`로 `formMethods`에 바인딩
- 조회/초기화 버튼은 퍼블리셔 배치대로 `RPA000Tab`에 있음
- 주차 2개(판매수요·입고수요)는 규칙 확정 전이라 퍼블리셔 Select 형태만 유지 (스킵)

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { DatePicker, Form, Select, Row, Col } from 'antd';

// 주차 값(dayjs) → Select 표시용. 주차 규칙 확정 후 교체 예정.
const toWeekOption = (value) => {
    const text = value?.format?.('YYYYww');
    return text ? [{ label: text, value: text }] : [];
};

export default function SearchFilterComp({
    formMethods,
    somCodeList,
    availableSomMonths,
    isSomAvailableMonthLoading,
    initialStockMonth,
    initialSalesResultMonth,
    onSomMonthChange
}) {
    const { control } = formMethods;

    return (
        <Form layout="vertical">
            <Row gutter={16}>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="재고조회 월">
                        <Controller
                            name="stockMonth"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    picker="month"
                                    style={{ width: '100%' }}
                                    placeholder="년월 선택"
                                    disabledDate={(current) =>
                                        Boolean(current && initialStockMonth &&
                                            current.isAfter(initialStockMonth, 'month'))
                                    }
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="판매수요 주차">
                        <Controller
                            name="salesDemandWeek"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="주차 선택"
                                    value={field.value?.format?.('YYYYww')}
                                    options={toWeekOption(field.value)}
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="SOM 월">
                        <Controller
                            name="somMonth"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    picker="month"
                                    style={{ width: '100%' }}
                                    placeholder="년월 선택"
                                    disabled={isSomAvailableMonthLoading}
                                    disabledDate={(current) =>
                                        !current || !availableSomMonths.includes(current.format('YYYYMM'))
                                    }
                                    onChange={(newMonth) => {
                                        field.onChange(newMonth);
                                        onSomMonthChange(newMonth);
                                    }}
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="SOM CD">
                        <Controller
                            name="somCd"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    placeholder="SOM CD 선택"
                                    options={somCodeList}
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="판매실적 월">
                        <Controller
                            name="salesResultMonth"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    picker="month"
                                    style={{ width: '100%' }}
                                    placeholder="년월 선택"
                                    disabledDate={(current) =>
                                        Boolean(current && initialSalesResultMonth &&
                                            current.isAfter(initialSalesResultMonth, 'month'))
                                    }
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={8} lg={4}>
                    <Form.Item label="입고수요 주차">
                        <Controller
                            name="inboundDemandWeek"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    placeholder="주차 선택"
                                    value={field.value?.format?.('YYYYww')}
                                    options={toWeekOption(field.value)}
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}

SearchFilterComp.propTypes = {
    formMethods: PropTypes.object.isRequired,
    somCodeList: PropTypes.array,
    availableSomMonths: PropTypes.arrayOf(PropTypes.string),
    isSomAvailableMonthLoading: PropTypes.bool,
    initialStockMonth: PropTypes.object,
    initialSalesResultMonth: PropTypes.object,
    onSomMonthChange: PropTypes.func.isRequired
};

SearchFilterComp.defaultProps = {
    somCodeList: [],
    availableSomMonths: [],
    isSomAvailableMonthLoading: false,
    initialStockMonth: null,
    initialSalesResultMonth: null
};
```
