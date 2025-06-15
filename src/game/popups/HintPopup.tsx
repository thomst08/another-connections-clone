import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { IConnectionsAPIData } from "../interfaces/IConnectionsAPIData";
import { PopupComponent } from "./Popup";



function HintComponent(props: { data: IHintInfo }) {
    const [reveal, setReveal] = useState<boolean>(false);

    const onClick = useCallback(() => setReveal(e => !e), []);
    const hintWord = useMemo(() => !reveal ? <br /> : props.data.hint, [reveal, props.data.hint]);
    const className = useMemo(() => `inline-block h-[17px] w-[17px] mr-[10px]`, [props.data.colour]); //bg-[${props.data.colour}]
    const styles = useMemo(() => ({ backgroundColor: props.data.colour } as CSSProperties), [props.data.colour]); //bg-[${props.data.colour}]

    return (
        <div>
            <div role="button" onClick={onClick}>
                <p className="flex underline items-center content-center">
                    <div className={className} style={styles} />
                    {props.data.groupName}
                </p>
            </div>
            <div>
                <p className="font-bold">{hintWord}</p>
            </div>
        </div>
    );
}


interface IHintInfo {
    hint: string,
    groupName: string,
    colour: string
}


interface IHintPopupProps {
    data: IConnectionsAPIData | null,
    showSecondHints?: boolean,
    closePopup: () => void,
    openPopup: boolean
}


export function HintPopup(props: IHintPopupProps) {
    const [hintData, setHintData] = useState<IHintInfo[]>([]);
    const [hint2Data, setHint2Data] = useState<IHintInfo[]>([]);

    const colourSelector = useCallback((index: number) => {
        switch (index) {
            case 0:
                return "var(--bg-connections-straightforward)";
            case 1:
                return "var(--bg-connections-easy)";
            case 2:
                return "var(--bg-connections-medium)";
            case 3:
                return "var(--bg-connections-tricky)";
        }
        return "#000";
    }, []);

    const hintGroupNameSelector = useCallback((index: number) => {
        switch (index) {
            case 0:
                return "Straightforward";
            case 1:
                return "Easy";
            case 2:
                return "Medium";
            case 3:
                return "Tricky";
        }

        return "";
    }, []);


    useEffect(() => {
        if (props.data === null)
            return;

        setHintData(
            props.data.categories.map((x, i) => {
                return {
                    groupName: hintGroupNameSelector(i),
                    colour: colourSelector(i),
                    hint: x.cards.sort((a, b) => a.position - b.position)[i].content
                } as IHintInfo
            })
        );
    }, [props.data, colourSelector]);


    useEffect(() => {
        if (props.data === null)
            return;

        if (props.showSecondHints ?? false) {
            setHint2Data(
                props.data.categories.map((x, i) => {
                    return {
                        groupName: hintGroupNameSelector(i),
                        colour: colourSelector(i),
                        hint: x.title
                    } as IHintInfo
                })
            );
        } else {
            setHint2Data([]);
        }
    }, [props.showSecondHints]);


    const secondHints = useMemo(() => {
        if (hint2Data.length === 0)
            return null;

        return (
            <>
                <br />
                <p className="text-lg font-bold">Group Name hints...</p>
                {hint2Data.map(x => <HintComponent key={x.hint} data={x} />)}
            </>
        );
    }, [hint2Data]);

    return (
        <PopupComponent
            openPopup={props.openPopup}
            closePopup={props.closePopup}
            title={"Need a Hint?"}
        >
            <p className="text-base leading-relaxed">
                In Connections, each category has a different difficulty level. Yellow is the simplest, and purple is the most difficult. Click or tap each level to reveal one of the words in that category.
            </p>
            <br />
            {
                hintData.map(x => <HintComponent key={x.hint} data={x} />)
            }
            {
                secondHints
            }
        </PopupComponent>
    );
}