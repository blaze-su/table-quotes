import React, { MouseEventHandler, useCallback, useEffect, useReducer, useRef, useState } from "react";

import { Symbol, SymbolTicker, SymbolTickerResponse } from "../models";
import { Table } from "src/features/exchange/components/table";
import { sortReducer } from "src/features/exchange/store";
import { TableHeader } from "src/features/exchange/components/table-header";
import { EXCHANGE } from "src/features/exchange";
import { ThemeSwitch } from "src/features/exchange/components/theme-switch";

const API = "wss://api.exchange.bitcoin.com/api/2/ws";
const FRAME_TIME = 1000 / 6;
const DISPLAY_COUNT = 50;

const useExchange = () => {
    const syncTimerId = useRef<number>(0);
    const syncList = useRef<Map<string, SymbolTicker>>(new Map());
    const tempData = useRef<Map<string, SymbolTicker>>(new Map());
    const socket = useRef<WebSocket>();
    const [symbols, setSymbols] = useState<Map<string, Symbol>>();
    const [displayCount, setDisplayCount] = useState(0);
    const [data, setData] = useState<SymbolTicker[]>([]);
    const [sort, setSort] = useReducer(sortReducer, {
        direction: "DESC",
        key: "last",
    });

    const initData = useCallback(
        (tempData: Map<string, SymbolTicker>) => {
            const data: SymbolTicker[] = [];
            tempData.forEach((symbolTicker, key) => {
                const symbol = symbols?.get(key);
                if (symbol) {
                    const { baseCurrency, quoteCurrency } = symbol;
                    data.push({ ...symbolTicker, name: `${baseCurrency} / ${quoteCurrency}` });
                }
            });
            tempData.clear();
            data.sort((a, b) => b.last - a.last);
            setData([...data]);
        },
        [symbols, setData]
    );

    const updateFrame = useCallback(() => {
        setData((prev) => {
            const data = [...prev];

            syncList.current.forEach((symbolTicker) => {
                const foundIndex = prev.findIndex(({ symbol }) => symbol === symbolTicker.symbol);
                data[foundIndex] = { ...prev[foundIndex], ...symbolTicker };
            });

            return data;
        });
        syncList.current.clear();
    }, [syncList, setData]);

    const updateListner = useCallback(
        (e) => {
            const res: SymbolTickerResponse = JSON.parse(e.data);
            if (res.method !== "ticker") return;

            const { params: symbolTicker } = res;
            syncList.current.set(symbolTicker.symbol, symbolTicker);
        },
        [syncList, setData]
    );

    const initListner = useCallback(
        (e) => {
            const data = JSON.parse(e.data);
            const eventType = data.id || data.method;
            switch (eventType) {
                case "symbols":
                    const { result } = data;
                    const symbolsList = result.map((symbol: Symbol) => [symbol.id, symbol]);
                    setSymbols(new Map(symbolsList));
                    break;
                case "ticker":
                    if (!symbols) return;

                    const { params: symbolTicker } = data;
                    tempData.current.set(symbolTicker.symbol, symbolTicker);
                    if (symbols?.size === tempData.current.size) {
                        initData(tempData.current);
                        socket.current!.onmessage = updateListner;
                    }
                    break;
            }
        },
        [symbols, setSymbols, initData]
    );

    const onClickDisplayCount: MouseEventHandler = useCallback(
        (e) => {
            e.preventDefault();
            setDisplayCount((prev) => (!prev ? DISPLAY_COUNT : 0));
        },
        [displayCount, setDisplayCount]
    );

    useEffect(() => {
        socket.current = new WebSocket(API);
        syncTimerId.current = Number(setInterval(updateFrame, FRAME_TIME));

        return () => {
            if (socket.current) socket.current.close();
            clearInterval(syncTimerId.current);
        };
    }, []);

    useEffect(() => {
        if (socket.current && !socket.current.onmessage) {
            socket.current.onopen = (e) => {
                socket.current!.onmessage = initListner;
                socket.current!.send(
                    JSON.stringify({
                        method: "getSymbols",
                        params: {},
                        id: "symbols",
                    })
                );
            };
        }
    }, [socket]);

    useEffect(() => {
        if (!socket.current || !symbols) return;

        socket.current.onmessage = initListner;
        symbols?.forEach((_, symbol) => {
            socket.current?.send(
                JSON.stringify({
                    method: "subscribeTicker",
                    params: {
                        symbol,
                    },
                })
            );
        });
    }, [symbols]);

    return {
        sort,
        setSort,
        displayCount,
        onClickDisplayCount,
        data,
    };
};

export const Exchange = () => {
    const { sort, setSort, displayCount, onClickDisplayCount, data } = useExchange();

    const baseClass = EXCHANGE;
    return (
        <div className="page">
            <ThemeSwitch />
            <h1 className="page__title">Exchange Quotes</h1>
            <button onClick={onClickDisplayCount} className={`${baseClass}__display-count`}>
                {displayCount ? `Show all` : `Show top 50`}
            </button>
            <TableHeader sort={sort} setSort={setSort} />
            <div>
                {data.length > 0 && <Table data={data} sort={sort} disolayCount={displayCount} setSort={setSort} />}
            </div>
        </div>
    );
};
