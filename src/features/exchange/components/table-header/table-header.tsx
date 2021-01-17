import { MouseEventHandler } from "react";
import { SymbolModels, SymbolSort } from "src/models";
import { EXCHANGE } from "../..";
import { SortReducerAction } from "../../store";
import { ReactComponent as ArrowIcon } from "./arrow.svg";

type TableHeaderProps = {
    sort: SymbolSort;
    setSort: React.Dispatch<SortReducerAction>;
};

export const TableHeader = ({ sort, setSort }: TableHeaderProps) => {
    const baseClass = EXCHANGE;

    return (
        <div className={`${baseClass}__header`}>
            {SymbolModels.map(({ key, title, sortable }) => {
                let style = `${baseClass}__header-arrow`;
                if (sort.direction === "DESC") style += ` ${style}--desc`;
                const onClick = (key: SortReducerAction["payload"], sortable?: boolean): MouseEventHandler => (e) => {
                    e.preventDefault();
                    sortable && setSort({ type: "setSort", payload: key });
                };
                return (
                    <button className={`${baseClass}__header-sort`} key={key} onClick={onClick(key, sortable)}>
                        {key === sort.key && <ArrowIcon className={style} />}
                        <div className={`${baseClass}__header-title`}>{title}</div>
                    </button>
                );
            })}
        </div>
    );
};
