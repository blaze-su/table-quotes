import { MouseEventHandler, useCallback, useEffect, useState } from "react";

export const ThemeSwitch = () => {
    const [state, setState] = useState<"light" | "dark">("light");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", state);
    }, [state]);

    const onToggle: MouseEventHandler = useCallback(() => {
        setState((prev) => {
            return prev === "dark" ? "light" : "dark";
        });
    }, [setState]);

    const baseClass = "theme-switch";
    let style = `${baseClass}__pointer`;
    if (state === "dark") style += ` ${style}--dark`;

    return (
        <div className={baseClass} onClick={onToggle}>
            <div className={`${baseClass}__dark`}>🌜</div>
            <div className={`${baseClass}__light`}>🌞</div>
            <div className={style} />
        </div>
    );
};
