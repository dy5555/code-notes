import React from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { Typography } from 'antd';
import { AAA014_COLUMN_DEFS, AAA014_DEFAULT_COL_DEF } from './grids/AAA014GridColumns';

// TODO: 테이블 설계 확정 후 작성 (현재는 빈 그리드 틀)
const GRID_HEIGHT = 500;

export default function TableComp({ rowData, isLoading }) {
    return (
        <>
            <div style={{ marginBottom: 12 }}>
                <Typography.Text strong>조회 결과</Typography.Text>
            </div>
            <div className="ag-theme-alpine" style={{ height: GRID_HEIGHT, width: '100%' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={AAA014_COLUMN_DEFS}
                    defaultColDef={AAA014_DEFAULT_COL_DEF}
                    loading={isLoading}
                    overlayNoRowsTemplate="<span>조회조건을 선택한 후 조회하세요.</span>"
                />
            </div>
        </>
    );
}

TableComp.propTypes = {
    rowData: PropTypes.array,
    isLoading: PropTypes.bool
};

TableComp.defaultProps = {
    rowData: [],
    isLoading: false
};
