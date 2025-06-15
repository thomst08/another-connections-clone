import { useEffect, useMemo, useState } from "react"


interface IToast {
    text: string
}


export function Toast(props: IToast) {
    const [fadeOut, setFadeOut] = useState<boolean>(false);

    useEffect(() => {
        setTimeout(() => setFadeOut(true), 2000);
    }, []);

    const className = useMemo(() => `toast ${fadeOut ? "fadeOut" : "fadeIn"}`, [fadeOut]);

    return (
        <div className={className}>
            {props.text}
        </div>
    )
}