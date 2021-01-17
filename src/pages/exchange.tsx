import React, { MouseEventHandler, useCallback, useEffect, useReducer, useRef, useState } from "react";

import { Symbol, SymbolSort, SymbolTicker, SymbolTickerResponse } from "../models";
import { Table } from "src/features/exchange/components/table";
import { sortReducer } from "src/features/exchange/store";
import { TableHeader } from "src/features/exchange/components/table-header";
import { EXCHANGE } from "src/features/exchange";
import { ThemeSwitch } from "src/features/exchange/components/theme-switch";

const API = "wss://api.exchange.bitcoin.com/api/2/ws";
const DISPLAY_COUNT = 50;

export const Exchange = () => {
    const tempData = useRef<Map<string, SymbolTicker>>(new Map());
    const [symbols, setSymbols] = useState<Map<string, Symbol>>();
    const [socket, setSocket] = useState<WebSocket>();
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

    const updateListner = useCallback(
        (e) => {
            const res: SymbolTickerResponse = JSON.parse(e.data);
            if (res.method === "ticker") {
                const { params: symbolTicker } = res;
                setData((prev) => {
                    const data = [...prev];
                    const foundIndex = prev.findIndex(({ symbol }) => symbol === symbolTicker.symbol);
                    data[foundIndex] = { ...prev[foundIndex], ...symbolTicker };
                    return data;
                });
            }
        },
        [setData]
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
                        setSocket((socket) => {
                            socket!.onmessage = updateListner;
                            return socket;
                        });
                    }
                    break;
            }
        },
        [symbols, setSymbols, setSocket, initData]
    );

    useEffect(() => {
        const socket = new WebSocket(API);
        setSocket(socket);
        return () => socket.close();
    }, []);

    useEffect(() => {
        if (socket && !socket.onmessage) {
            socket.onopen = function (e) {
                console.log("WebSocket:connnected");
                socket.onmessage = initListner;
                socket.send(
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
        if (!socket || !symbols) return;

        socket.onmessage = initListner;
        symbols?.forEach((_, symbol) => {
            socket.send(
                JSON.stringify({
                    method: "subscribeTicker",
                    params: {
                        symbol,
                    },
                })
            );
        });
    }, [symbols]);

    const onClickDisplayCount: MouseEventHandler = useCallback(
        (e) => {
            e.preventDefault();
            setDisplayCount((prev) => (!prev ? DISPLAY_COUNT : 0));
        },
        [displayCount, setDisplayCount]
    );

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
