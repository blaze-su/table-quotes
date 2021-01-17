import { memo, useEffect, useRef } from "react";
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

const useTableCell = (props: TableCellProps) => {
    const tableCellRef = useRef<HTMLDivElement>(null);
    const prevAnimationName = useRef<string>();
    const { data, isNumber } = props;
    const prev = usePrevious(data);

    useEffect(() => {
        if (!tableCellRef.current) return;
        tableCellRef.current.getAnimations().find((animation, i) => {
            //@ts-ignore
            const { animationName } = animation;
            if (prevAnimationName.current == animationName) {
                animation.cancel();
                animation.play();
            }
            prevAnimationName.current = animationName;
            return true;
        });
    }, [data]);

    return {
        data,
        isNumber,
        prev,
        tableCellRef,
    };
};

export const TableCell = memo((props: TableCellProps) => {
    const { data, isNumber, prev, tableCellRef } = useTableCell(props);

    let style = `${EXCHANGE}__cell`;
    if (isNumber) {
        if (Number(data) > Number(prev)) style += ` ${style}--up`;
        if (Number(data) < Number(prev)) style += ` ${style}--down`;
    }

    return (
        <div ref={tableCellRef} className={style}>
            {data}
        </div>
    );
});
