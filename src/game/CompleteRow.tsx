import { useMemo, useState } from "react";
import { CompleteType } from "./interfaces/ISessionData";


interface ICompleteRow {
    groupName: string,
    groupType: CompleteType,
    words: string[]
}

export default function CompleteRow(props: ICompleteRow) {
    const [firstRun, setFirstRun] = useState<boolean>(false);
    const heading = useMemo(() => props.groupName.toUpperCase(), [props.groupName]);
    const words = useMemo(() => {
        return props.words.map((x, i) => <li key={x} className="completeWord">{x.toUpperCase()}{i !== 3 ? ", " : null}</li>)
    }, []);

    const classNames = useMemo(() => {
        const defaultClasses = `completedCell ${!firstRun ? " --pulse" : ""}`;
        if (!firstRun) {
            setTimeout(() => setFirstRun(true), 2000);
        }

        switch (props.groupType) {
            case CompleteType.vhard:
                return defaultClasses + " --vhard";
            case CompleteType.hard:
                return defaultClasses + " --hard";
            case CompleteType.mid:
                return defaultClasses + " --mid";
            default:
                return defaultClasses + " --easy";
        }
    }, [firstRun]);

    return (
        <section className={classNames}>
            <h3 className="completeHeading">{heading}</h3>
            <ol>
                {words}
            </ol>
        </section>
    );
}