import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { ICardData } from "./interfaces/IConnectionsAPIData";

interface ICellProps {
    cardData: ICardData
    selected?: boolean,
    onSelect?: (name: string) => void,
    wrongTrigger?: boolean,
    bounce?: number
}

export function Cell(props: ICellProps) {
    const [windowDimensions, setWindowDimensions] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const style = useMemo(() => {
        const style = {
            fontSize: "20px",
        } as CSSProperties;

        if (windowDimensions.width < 640) {
            style.font = "14px";
            if (props.cardData.content.length <= 12 && props.cardData.content.length > 6) {
                style.fontSize = "12px";
            } else if (props.cardData.content.length > 12) {
                style.fontSize = "10px";
            }
        } else {
            if (props.cardData.content.length <= 13 && props.cardData.content.length > 10) {
                style.fontSize = "17px";
            } else if (props.cardData.content.length > 13) {
                style.fontSize = "14px";
            }
        }

        return style;
    }, [props.cardData, windowDimensions.width]);

    const onClickFunction = useCallback(() => {
        if (props.onSelect) {
            props.onSelect(props.cardData.content);
        }
    }, [props.onSelect]);

    const classNames = useMemo(() => {
        let classNames = ["cell"];
        if (props.selected)
            classNames.push("selected");

        if (props.wrongTrigger)
            classNames.push("mistakeShake");

        if (props.bounce) {
            switch (props.bounce) {
                case 1:
                    classNames.push("bounce1");
                    break;
                case 2:
                    classNames.push("bounce2");
                    break;
                case 3:
                    classNames.push("bounce3");
                    break;
                case 4:
                    classNames.push("bounce4");
                    break;
            }
        }

        return classNames.join(" ");
    }, [props.selected, props.bounce, props.wrongTrigger]);

    return (
        <button
            style={style}
            className={classNames}
            onClick={onClickFunction}
        >
            {props.cardData.content}
        </button>
    );
}