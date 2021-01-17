export type Symbol = {
    id: string;
    baseCurrency: string;
    quoteCurrency: string;
    quantityIncrement: string;
    tickSize: number;
    takeLiquidityRate: number;
    provideLiquidityRate: number;
    feeCurrency: number;
};

export type SymbolTicker = {
    name?: string;
    ask: number;
    bid: number;
    last: number;
    open?: number;
    low: number;
    high: number;
    volume?: number;
    volumeQuote?: number;
    timestamp?: string;
    symbol: string;
};

export type SymbolTickerResponse = {
    method: string;
    params: SymbolTicker;
};

export type SymbolTickerKey = keyof SymbolTicker;

export type SymbolSort = {
    direction: "ASC" | "DESC";
    key: SymbolTickerKey;
};

type SymbolModel = {
    key: SymbolTickerKey;
    title: string;
    sortable?: boolean;
};

export const SymbolModels: SymbolModel[] = [
    {
        key: "name",
        title: "Ticker",
    },
    {
        key: "bid",
        title: "Bid",
        sortable: true,
    },
    {
        key: "ask",
        title: "Ask",
        sortable: true,
    },
    {
        key: "high",
        title: "High",
        sortable: true,
    },
    {
        key: "low",
        title: "Low",
        sortable: true,
    },
    {
        key: "last",
        title: "Last",
        sortable: true,
    },
];
