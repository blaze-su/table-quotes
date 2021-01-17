import React, { memo } from "react";

import { SymbolModels, SymbolTicker } from "src/models";
import { EXCHANGE } from "../..";
import { TableCell } from "../table-cell";

type TableRowProps = {
    data: SymbolTicker;
    prev?: SymbolTicker;
};

export const TableRow = memo(({ data }: TableRowProps) => {
    const baseClass = EXCHANGE;

    return (
        <div className={`${baseClass}__row`}>
            {SymbolModels.map(({ key, sortable }) => {
                return <TableCell key={key} data={data[key]} isNumber={sortable} />;
            })}
        </div>
    );
});
