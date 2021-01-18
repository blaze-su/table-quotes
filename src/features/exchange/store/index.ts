import { SymbolSort, SymbolTickerKey } from "src/models";

export type SortReducerAction = {
    type: "setSort";
    payload: SymbolTickerKey;
};

export const sortReducer = (state: SymbolSort, action: SortReducerAction): SymbolSort => {
    switch (action.type) {
        case "setSort":
            if (state.key === action.payload) {
                return { key: action.payload, direction: state.direction === "ASC" ? "DESC" : "ASC" };
            } else {
                return { key: action.payload, direction: "ASC" };
            }
        default:
            throw new Error();
    }
};
