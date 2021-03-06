import React, { memo } from "react";
import { SymbolSort, SymbolTicker } from "src/models";
import { EXCHANGE } from "../..";
import { SortReducerAction } from "../../store";
import { TableRow } from "../table-row";
import "./table.scss";

type TableProps = {
    data: SymbolTicker[];
    sort: SymbolSort;
    disolayCount: number;
    setSort: React.Dispatch<SortReducerAction>;
};

const useTable = (props: TableProps) => {
    const { data, sort, disolayCount } = props;
    const { key, direction } = sort;

    const preparedData = disolayCount ? data.slice(0, disolayCount) : data;
    const sortDirection = direction === "ASC" ? 1 : -1;
    preparedData.sort((a, b) => {
        return (Number(a[key]) - Number(b[key])) * sortDirection;
    });

    return {
        data: preparedData,
    };
};

export const Table = memo((props: TableProps) => {
    const { data } = useTable(props);

    const baseClass = EXCHANGE;
    return (
        <div className={`${baseClass}__table`}>
            {data.map((symbolTicker) => {
                return <TableRow key={symbolTicker.symbol} data={symbolTicker} />;
            })}
        </div>
    );
});
