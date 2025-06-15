import { useCallback, useMemo } from "react"
import { IConnectionsAPIData } from "./interfaces/IConnectionsAPIData";


interface IGameMenuProps {
    startGame: () => void,
    newGame: boolean,
    foundCount: number,
    gameData: IConnectionsAPIData | null
}


export function GameMenu(props: IGameMenuProps) {

    const heading = useMemo(() => props.newGame ? "Another Connections Clone..." : "Welcome Back", [props.newGame]);
    const description = useMemo(() => props.newGame ? "Group words that share a common thread." : `You have ${props.foundCount}/4 categories. Keep going!`, [props.newGame]);
    const buttonText = useMemo(() => props.newGame ? "Play" : "Continue", [props.newGame]);

    const creator = useMemo(() => props.gameData !== null ? props.gameData.editor : "", [props.gameData]);
    const number = useMemo(() => props.gameData !== null ? props.gameData.id : "", [props.gameData]);
    const date = useMemo(() => {
        if (props.gameData === null)
            return "";

        const date = new Date(props.gameData?.print_date);
        const month = date.toLocaleString('default', { month: 'long' });
        return `${month} ${date.getDate()}, ${date.getFullYear()}`;
    }, [props.gameData]);

    const redirectToOriginal = useCallback(() => window.location.href = "https://www.nytimes.com/games/connections", []);

    return (
        <div className="game-menu">
            <div>
                <div className="game-icon" />
                <h2 className="menu-title">{heading}</h2>
                <h3 className="menu-description">{description}</h3>
                <br />
                <button type="button" className="menu-button" onClick={props.startGame}>{buttonText}</button>
                <button type="button" className="menu-button" onClick={redirectToOriginal}>Support the Original</button>

                <br />
                <p className="game-menu-info-section">
                    <span className="game-menu-info --date">{date}</span>
                    <span className="game-menu-info --text">
                        <span className="game-menu-info --extras">No. {number}</span>
                        <span className="game-menu-info --extras">By {creator}</span>
                    </span>
                </p>
            </div>
        </div>
    )
}