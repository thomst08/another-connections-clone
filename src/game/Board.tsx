"use strict"

import { useCallback, useEffect, useMemo, useReducer, useState, type CSSProperties } from "react";
import { Button } from "./Button";
import type { IConnectionsAPIData } from "./interfaces/IConnectionsAPIData";
import { Cell } from "./Cell";
import CompleteRow from "./CompleteRow";
import { GameMenu } from "./GameMenu";
import { Loading } from "./Loading";
import { CompleteType, IGroupCompleted, IGroupData, ISessionData, IWordData } from "./interfaces/ISessionData";
import { Toast } from "./Toast";
import { Toolbar } from "./Toolbar";


interface IDateData {
    year: number,
    month: number,
    day: number
}

const localStorageDataKey = "ACCloneData";

interface IGameStateData {
    words: IWordData[],
    groupMap: Map<string, IGroupData>,

    errorLoading: boolean,
    loading: boolean,
    // loadedData: boolean,
    gameStarted: boolean,
    gameOver: boolean,

    completedWordInfo: IGroupCompleted[],
    // wrongItems: string[],
    // toastsData: string[],
    pastGuesses: string[][],

    // checking: string[],
    currentSelected: string[],

    // shuffling: boolean,
    incorrectCount: number
}


interface IGameStateAction {
    type: GameStateActionType,
    data?: any
}

enum GameStateActionType {
    SetGameData,
    SetDataLoadFail,
    SuffleWords,
    RestoreGameState,
    Error,
    // Loading,
    SetSelected,
    AddToSelection,
    IncrementGuessCount,
    // WrongGuess,
    // Checking,
    CompleteGroup,
    ShuffleWords,
    // Shuffling,
    GameOver,
    AddToGuessed,
    StartGame
}

const defaultGameState = {
    words: [],
    groupMap: new Map(),

    errorLoading: false,
    loading: true,
    loadedData: false,
    gameStarted: false,
    gameOver: false,

    completedWordInfo: [],
    wrongItems: [],
    toastsData: [],
    pastGuesses: [],

    checking: [],
    currentSelected: [],

    shuffling: false,
    incorrectCount: 0
} as IGameStateData;

function gameStateReducer(state: IGameStateData, action: IGameStateAction): IGameStateData {
    switch (action.type) {
        case GameStateActionType.SetGameData:
            const apiData = action.data as IConnectionsAPIData;
            const words = apiData.categories.flatMap(x => x.cards.map(z => ({
                ...z,
                id: z.content,
                group: x.title
            } as IWordData)));
            if (words.length === 0)
                return state;

            const groups = new Map<string, IGroupData>(
                apiData.categories.map((x, i) => ([
                    x.title, {
                        type: i as CompleteType,
                        words: x.cards.map(z => z.content)
                    } as IGroupData
                ]))
            );
            state.groupMap = groups;
            state.loading = false;
            return {
                ...state,
                words: words,
                groupMap: groups,
                loading: false
            };
        case GameStateActionType.SetDataLoadFail:
            return {
                ...state,
                words: [],
                loading: true
            };
        case GameStateActionType.SuffleWords:
            const start = (state.completedWordInfo.length * 4);
            let currentIndex = state.words.length;

            const shuffleWords = structuredClone(state.words);
            while (currentIndex != start) {
                let randomIndex = Math.floor(Math.random() * (currentIndex - start)) + start;
                currentIndex--;
                const position = shuffleWords[currentIndex].position;
                shuffleWords[currentIndex].position = shuffleWords[randomIndex].position;
                shuffleWords[randomIndex].position = position;
            }
            return {
                ...state,
                words: shuffleWords
            };
        case GameStateActionType.RestoreGameState:
            const pastSessionData = action.data as ISessionData;
            return {
                ...state,
                words: pastSessionData.positionData,
                completedWordInfo: pastSessionData.completedData,
                incorrectCount: pastSessionData.incorrectCount,
                pastGuesses: pastSessionData.pastGuesses,
                loading: false
            };
        case GameStateActionType.Error:
            return {
                ...state,
                errorLoading: true
            }
        case GameStateActionType.GameOver:
            return {
                ...state,
                gameOver: true
            };
        case GameStateActionType.SetSelected:
            const selectedData = action.data as string[];
            return {
                ...state,
                currentSelected: selectedData
            };
        case GameStateActionType.AddToSelection:
            const selectedWord = action.data as string;
            const index = state.currentSelected.findIndex(y => y === selectedWord);
            if (index === -1) {
                if (state.currentSelected.length >= 4)
                    return state;
                return {
                    ...state,
                    currentSelected: [
                        ...state.currentSelected,
                        selectedWord
                    ]
                }
            } else {
                const newSelected = [...state.currentSelected];
                newSelected.splice(index, 1);
                return {
                    ...state,
                    currentSelected: newSelected
                };
            }
        case GameStateActionType.IncrementGuessCount:
            return {
                ...state,
                incorrectCount: state.incorrectCount + 1
            };
        case GameStateActionType.CompleteGroup:
            const completeWords = structuredClone(state.words);
            const startPoistion = (state.completedWordInfo.length * 4);
            const atStart = (x: IWordData) => x.position >= startPoistion && x.position < startPoistion + 4;

            const selectWords = completeWords
                .filter(x => state.currentSelected.includes(x.content) && !atStart(x))
                .sort((a, b) => a.position - b.position);

            const firstFourWords = completeWords
                .filter(x => atStart(x) && !state.currentSelected.includes(x.content))
                .sort((a, b) => a.position - b.position);

            selectWords.forEach((x, i) => {
                const position = x.position;
                x.position = firstFourWords[i].position;
                firstFourWords[i].position = position;
            });

            const group = state.groupMap.get(action.data as string);
            let completedGroupInfo = structuredClone(state.completedWordInfo);
            if (group !== undefined) {
                completedGroupInfo.push({
                    groupName: action.data as string,
                    data: group
                } as IGroupCompleted);
            }

            return {
                ...state,
                words: completeWords,
                currentSelected: [],
                completedWordInfo: completedGroupInfo
            };
        case GameStateActionType.ShuffleWords:
            const shuffledWords = structuredClone(state.words);
            const shuffleStart = (state.completedWordInfo.length * 4);
            let currentShuffleIndex = shuffledWords.length;

            while (currentShuffleIndex != shuffleStart) {
                let randomIndex = Math.floor(Math.random() * (currentShuffleIndex - shuffleStart)) + shuffleStart;
                currentShuffleIndex--;
                const position = shuffledWords[currentShuffleIndex].position;
                shuffledWords[currentShuffleIndex].position = shuffledWords[randomIndex].position;
                shuffledWords[randomIndex].position = position;
            }

            return {
                ...state,
                words: shuffledWords
            };
        case GameStateActionType.AddToGuessed:
            const pastGuesses = structuredClone(state.pastGuesses);
            pastGuesses.push((action.data as string[]).sort());
            return {
                ...state,
                pastGuesses: pastGuesses
            };
        case GameStateActionType.StartGame:
            return {
                ...state,
                gameStarted: true
            };
        default:
            throw new Error("Unknown action");
    }
}


export function Board({ dateData }: { dateData: IDateData }) {
    //Data from API
    const [data, setData] = useState<IConnectionsAPIData | null>(null);
    const [gameState, gameDispatch] = useReducer(gameStateReducer, defaultGameState);

    const [windowDimensions, setWindowDimensions] = useState({
        width: 0,
        height: 0,
    });

    const [loadedData, setLoadedData] = useState<boolean>(false);
    const [wrongItems, setWrongItems] = useState<string[]>([]);
    const [toastsData, setToastsData] = useState<string[]>([]);
    const [checking, setChecking] = useState<string[]>([]);
    const [shuffling, setShuffling] = useState<boolean>(false);

    const showExtraHints = useMemo(() => gameState.incorrectCount >= 5, [gameState.incorrectCount]);

    function setErrorLoading() {
        gameDispatch({ type: GameStateActionType.Error });
    }

    function setCurrentSelected(selected: string[]) {
        gameDispatch({ type: GameStateActionType.SetSelected, data: selected });
    }

    function appendCurrentSelected(selectedWord: string) {
        gameDispatch({ type: GameStateActionType.AddToSelection, data: selectedWord });
    }

    function triggerWrongSelection() {
        gameDispatch({ type: GameStateActionType.IncrementGuessCount });
        setWrongItems(gameState.currentSelected);
        setTimeout(() => setWrongItems([]), 2000);
    }


    function triggerBounce() {
        setChecking(gameState.currentSelected);
        setTimeout(() => setChecking([]), 1000);
    }

    function triggerGroup(groupName: string) {
        gameDispatch({ type: GameStateActionType.CompleteGroup, data: groupName });
    }


    function triggerShuffle() {
        setShuffling(true);
        gameDispatch({ type: GameStateActionType.ShuffleWords });
        setTimeout(() => setShuffling(false), 500);
    }

    function addGuessedWords(words: string[]) {
        gameDispatch({ type: GameStateActionType.AddToGuessed, data: words });
    }

    function startGame() {
        gameDispatch({ type: GameStateActionType.StartGame });
    }


    useEffect(() => {
        if (!gameState.gameStarted)
            return;

        const data = {
            day: dateData.day,
            month: dateData.month,
            year: dateData.year,
            positionData: gameState.words,
            completedData: gameState.completedWordInfo,
            incorrectCount: gameState.incorrectCount,
            pastGuesses: gameState.pastGuesses
        } as ISessionData;

        localStorage.setItem(localStorageDataKey, JSON.stringify(data));
    }, [gameState.loading, dateData, gameState.words, gameState.completedWordInfo, gameState.incorrectCount, gameState.pastGuesses]);


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


    const loadInPastData = useCallback(() => {
        const dataString = localStorage.getItem(localStorageDataKey);
        if (dataString !== null) {
            const data = JSON.parse(dataString) as ISessionData;
            if (data.day === dateData.day && data.month === dateData.month && data.year === dateData.year) {
                gameDispatch({ type: GameStateActionType.RestoreGameState, data: data });
                return true;
            }
        }
        return false;
    }, []);


    useEffect(() => {
        const abort = new AbortController();
        let url = "/api/connections";

        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const day = new Date().getDate();
        url += `/${year}-${month}-${day}`;

        fetch(url, {
            method: "GET",
            signal: abort.signal,
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then<IConnectionsAPIData>(res => {
                return res.json();
            })
            .then(jsonData => {
                if (jsonData.status !== "OK") {
                    setErrorLoading();
                } else {
                    setData(jsonData);
                }
            });

        return () => abort.abort();
    }, []);

    useEffect(() => {
        if (gameState.gameOver)
            setCurrentSelected([]);
    }, [gameState.gameOver]);


    useEffect(() => {
        if (data?.status === "OK") {
            gameDispatch({
                type: GameStateActionType.SetGameData,
                data: data
            });
            setLoadedData(loadInPastData());
        } else {
            gameDispatch({ type: GameStateActionType.SetDataLoadFail });
        }
    }, [data]);


    const completedWordGroups = useMemo(() => {
        return gameState.completedWordInfo.map(z => {
            return <CompleteRow key={z.groupName} groupName={z.groupName} groupType={z.data.type} words={z.data.words} />
        });
    }, [gameState.completedWordInfo]);

    const cells = useMemo(() => {
        let check = 1;
        return gameState.words
            .sort((a, b) => a.position - b.position)
            .map((x, i) => i < (completedWordGroups.length * 4) ? null : <Cell
                key={x.id}
                cardData={x}
                bounce={(checking.findIndex(y => y === x.content) !== -1) ? check++ : undefined}
                wrongTrigger={wrongItems.findIndex(y => y === x.content) !== -1}
                onSelect={appendCurrentSelected}
                selected={gameState.currentSelected.findIndex(y => y === x.content) !== -1}
            />)
    }, [completedWordGroups, gameState.currentSelected, wrongItems, checking, gameState.words, appendCurrentSelected]);


    const triggerDeselect = useCallback(() => setCurrentSelected([]), []);

    const gridStyle = useMemo(() => {
        if (gameState.completedWordInfo.length === 4) {
            gameDispatch({ type: GameStateActionType.GameOver });
        }

        let height = "80px";
        if (windowDimensions.width < 640)
            height = "22.5vw";

        return {
            gridTemplateRows: `repeat(${4 - completedWordGroups.length}, 1fr)`,
            height: `calc(${3 - completedWordGroups.length} * 8px + ${4 - completedWordGroups.length} * ${height})`
        }
    }, [gameState.completedWordInfo, windowDimensions]);


    const toasts = useMemo(() => {
        return toastsData.map(text => <Toast text={text} />)
    }, [toastsData]);


    const checkGuessedWords = useCallback((words: string[]) => {
        let result = false;

        //This can be optimised through other methods, for the moment
        //this will do....
        for (let i = 0; i < gameState.pastGuesses.length; i++) {
            let found = true;
            for (let j = 0; j < words.length; j++) {
                if (gameState.pastGuesses[i].findIndex(y => y === words[j]) === -1) {
                    found = false;
                    break;
                }

            }
            if (found) {
                result = true;
                break;
            }
        }

        return result;
    }, [gameState.pastGuesses]);

    const removeToast = useCallback((text: string) => {
        setToastsData(e => {
            const index = e.findIndex(z => z === text);
            if (index !== -1) {
                e.splice(index, 1);
                return [...e];
            }

            return e;
        })
    }, []);

    const addToast = useCallback((text: string) => {
        setToastsData(e => {
            if (e.findIndex(x => x === text) === -1) {
                setTimeout(() => removeToast(text), 2300);
                return [...e, text];
            }
            return e;
        })
    }, [removeToast]);


    const triggerCheckGroup = useCallback(() => {
        if (gameState.currentSelected.length < 4)
            return;

        triggerBounce();
        let wrong = false;
        let guessCount = new Map<string, number>();
        const groupName = gameState.words.find(x => x.content === gameState.currentSelected[0])?.group ?? "";
        gameState.currentSelected.forEach(x => {
            const index = gameState.words.findIndex(z => z.content === x);
            guessCount.set(gameState.words[index].group, (guessCount.get(gameState.words[index].group) ?? 0) + 1);
            if (gameState.words[index].group !== groupName)
                wrong = true;
        });
        let oneGuessAway = false;
        guessCount.forEach(x => {
            if (x === 3)
                oneGuessAway = true;
        });

        setTimeout(() => {
            if (wrong) {
                if (checkGuessedWords(gameState.currentSelected)) {
                    addToast("Already guessed!");
                } else {
                    addGuessedWords(gameState.currentSelected);
                    if (oneGuessAway)
                        addToast("One away...");
                    triggerWrongSelection();
                }
            } else {
                triggerGroup(groupName)
            }
        }, 1000);
    }, [gameState.currentSelected, checkGuessedWords, triggerDeselect, addGuessedWords, triggerBounce, triggerGroup, triggerWrongSelection]);

    const nothingSelected = useMemo(() => gameState.currentSelected.length === 0 || gameState.gameOver, [gameState.currentSelected]);
    const groupSelection = useMemo(() => gameState.currentSelected.length !== 4 || gameState.gameOver, [gameState.currentSelected]);

    const incorrectGuessCount = useMemo(() => <div>Incorrect Guesses: {gameState.incorrectCount}</div>, [gameState.incorrectCount]);

    const boardClasses = useMemo(() => `board-grid${shuffling ? " shuffle" : ""}`, [shuffling]);
    const showLoading = useMemo(() => ({ display: gameState.loading ? undefined : "none" } as CSSProperties), [gameState.loading]);
    const showGame = useMemo(() => ({ display: gameState.loading || !gameState.gameStarted ? "none" : undefined, width: "100vw" } as CSSProperties), [gameState.loading, gameState.gameStarted]);
    const showMenuGame = useMemo(() => ({ display: !gameState.loading && !gameState.gameStarted ? undefined : "none", width: windowDimensions.width < 640 ? "100vw" : undefined, height: windowDimensions.width < 640 ? "100vh" : undefined } as CSSProperties), [gameState.loading, gameState.gameStarted]);

    const gameOverMessage = useMemo(() => {
        if (gameState.gameOver) {
            return <div>Good work!</div>
        } else {
            return null;
        }
    }, [gameState.gameOver]);


    return (
        <main>
            <div style={showLoading}>
                <Loading showError={gameState.errorLoading} />
            </div>
            <div style={showMenuGame}>
                <GameMenu
                    startGame={startGame}
                    newGame={!loadedData}
                    foundCount={gameState.completedWordInfo.length}
                    gameData={data}
                />
            </div>
            <div style={showGame}>
                <Toolbar apiData={data} showExtraHints={showExtraHints} />
                <div className="game-board">
                    <div className="toast-system">
                        {toasts}
                    </div>
                    <div className="completedSection">
                        {completedWordGroups}
                    </div>
                    <div style={gridStyle} className={boardClasses}>
                        {cells}
                    </div>
                </div>
                <div className="game-center-text">
                    {incorrectGuessCount}
                </div>
                <div className="gameover-message">
                    {gameOverMessage}
                </div>
                <div className="game-button-group">
                    <Button
                        text="Shuffle"
                        onClick={triggerShuffle}
                        disabled={gameState.gameOver}
                        hide={gameState.gameOver}
                    />

                    <Button
                        text="Deselect All"
                        onClick={triggerDeselect}
                        disabled={nothingSelected}
                        hide={gameState.gameOver}
                    />

                    <Button
                        text="Submit"
                        onClick={triggerCheckGroup}
                        disabled={groupSelection}
                        hide={gameState.gameOver}
                    />
                </div>
            </div>
        </main>
    )
}