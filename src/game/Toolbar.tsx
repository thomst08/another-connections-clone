import { useCallback, useEffect, useMemo, useState } from "react"
import { HintPopup } from "./popups/HintPopup";
import { IConnectionsAPIData } from "./interfaces/IConnectionsAPIData";
import { HowToPlayPopup } from "./popups/HowToPlayPopup";


interface IToolbarProps {
    apiData: IConnectionsAPIData | null,
    showExtraHints: boolean
}


export function Toolbar(props: IToolbarProps) {
    const [hintOpen, setHintOpen] = useState<boolean>(false);
    const [howToPlayOpen, setHowToPlayOpen] = useState<boolean>(false);
    const [helpOpen, setHelpOpen] = useState<boolean>(false);

    useEffect(() => {
        const clickEvent = () => setHelpOpen(false);
        document.body.addEventListener('click', clickEvent);

        document.getElementById('toolbar-menu-options3')?.addEventListener('click', function (e) {
            e.stopPropagation();
        }, true);

        return () => document.body.removeEventListener('click', clickEvent);
    }, []);

    const onHintClick = useCallback(() => {
        setHintOpen(true);
    }, []);

    const onHowToPlayClick = useCallback(() => {
        setHowToPlayOpen(true);
    }, []);

    const closeHintPopup = useCallback(() => setHintOpen(false), []);
    const closeHowToPlayPopup = useCallback(() => setHowToPlayOpen(false), []);

    const onHelpClick = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        setHelpOpen(e => !e);
    }, []);


    const helpMenu = useMemo(() => {
        if (!helpOpen)
            return null;

        return (
            <ul role="menu" className="toolbar-menu-dropdown">
                <li role="none" className="toolbar-menu">
                    <button type="button" className="toolbar-button" role="menuitem" aria-haspopup="dialog" onClick={onHowToPlayClick}>How to Play</button>
                </li>
                <li role="none" className="toolbar-menu">
                    <a id="toolbar-menu-options" role="menuitem" className="toolbar-button" href="https://www.nytimes.com/games/connections" target="_blank" rel="noreferrer">
                        Support the Original
                        <div id="toolbar-menu-options2" className="icon">
                            <svg id="toolbar-menu-options3" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 16 16" width="16" className="game-icon" data-testid="icon-arrow">
                                <path id="toolbar-menu-options4" fill="var(--text)" d="M11.3301 4.06982H4.73006V5.26982H9.88006L3.81006 11.3398L4.66006 12.1898L10.7301 6.11982V11.2698H11.9301V4.66982C11.9301 4.33982 11.6601 4.06982 11.3301 4.06982Z">
                                </path>
                            </svg>
                        </div>
                    </a>
                </li>
            </ul>
        );
    }, [helpOpen]);


    const popupWindow = useMemo(() => {
        if (!hintOpen)
            return null;

        return (
            <div></div>
        );
    }, [hintOpen]);


    return (
        <>
            <HintPopup data={props.apiData} closePopup={closeHintPopup} openPopup={hintOpen} showSecondHints={props.showExtraHints} />
            <HowToPlayPopup closePopup={closeHowToPlayPopup} openPopup={howToPlayOpen} />
            <div className="toolbar">
                <div className="row">
                    <div className="module">
                        <header className="header">
                            <section className="section">
                                <span className="toolbar-button-section" data-state="closed" aria-expanded="false" aria-haspopup="dialog">
                                    <button className="toolbar-button" onClick={onHintClick}>
                                        <div className="icon">
                                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="36" viewBox="-4 -4 32 32" width="36" className="game-icon" data-testid="icon-forum">
                                                <path fill="var(--text)" d="M15.4538 15.0078C17.2881 13.8544 18.5 11.818 18.5 9.5C18.5 5.91015 15.5899 3 12 3C8.41015 3 5.5 5.91015 5.5 9.5C5.5 11.818 6.71194 13.8544 8.54624 15.0078C9.37338 15.5279 10 16.4687 10 17.6014V20H14V17.6014C14 16.4687 14.6266 15.5279 15.4538 15.0078ZM16.5184 16.7009C16.206 16.8974 16 17.2323 16 17.6014V20C16 21.1046 15.1046 22 14 22H10C8.89543 22 8 21.1046 8 20V17.6014C8 17.2323 7.79404 16.8974 7.48163 16.7009C5.08971 15.1969 3.5 12.5341 3.5 9.5C3.5 4.80558 7.30558 1 12 1C16.6944 1 20.5 4.80558 20.5 9.5C20.5 12.5341 18.9103 15.1969 16.5184 16.7009ZM8 17H16V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V17Z">
                                                </path>
                                            </svg>
                                        </div>
                                    </button>
                                </span>
                                <div className="toolbar-button-section">
                                    <button type="button" onClick={onHelpClick} className="toolbar-button" id="help-button" data-testid="help-button" aria-label="Help" aria-haspopup="menu" aria-controls="help-dialog" aria-expanded="false">
                                        <div className="icon">
                                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 32 32" width="32" className="game-icon" data-testid="icon-help">
                                                <path fill="var(--text)" d="M15 24H17.6667V21.3333H15V24ZM16.3333 2.66666C8.97333 2.66666 3 8.63999 3 16C3 23.36 8.97333 29.3333 16.3333 29.3333C23.6933 29.3333 29.6667 23.36 29.6667 16C29.6667 8.63999 23.6933 2.66666 16.3333 2.66666ZM16.3333 26.6667C10.4533 26.6667 5.66667 21.88 5.66667 16C5.66667 10.12 10.4533 5.33332 16.3333 5.33332C22.2133 5.33332 27 10.12 27 16C27 21.88 22.2133 26.6667 16.3333 26.6667ZM16.3333 7.99999C13.3867 7.99999 11 10.3867 11 13.3333H13.6667C13.6667 11.8667 14.8667 10.6667 16.3333 10.6667C17.8 10.6667 19 11.8667 19 13.3333C19 16 15 15.6667 15 20H17.6667C17.6667 17 21.6667 16.6667 21.6667 13.3333C21.6667 10.3867 19.28 7.99999 16.3333 7.99999Z">
                                                </path>
                                            </svg>
                                        </div>
                                    </button>
                                    {
                                        helpMenu
                                    }
                                </div>
                            </section>
                        </header>
                    </div>
                </div>
            </div>
            {popupWindow}
        </>
    );
}