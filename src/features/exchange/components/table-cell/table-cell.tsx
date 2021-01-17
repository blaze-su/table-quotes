import React, { memo, useEffect, useRef } from "react";
import { EXCHANGE } from "../..";

const usePrevious = (value: TableCellValue) => {
    const ref = useRef<TableCellValue>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
};

type TableCellValue = string | number | undefined;

type TableCellProps = {
    data?: TableCellValue;
    isNumber?: boolean;
};

export const TableCell = memo((props: TableCellProps) => {
    const { data, isNumber } = props;
    const prev = usePrevious(data);
    const baseClass = EXCHANGE;

    let style = `${baseClass}__cell`;
    if (isNumber) {
        if (Number(data) > Number(prev)) style += ` ${style}--up`;
        if (Number(data) < Number(prev)) style += ` ${style}--down`;
    }

    return <div className={style}>{data}</div>;
});
