import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
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

export function Board({ dateData }: { dateData: IDateData }) {
    //Data from API
    const [data, setData] = useState<IConnectionsAPIData | null>(null);

    //Words for on grid and positions
    const [words, setWords] = useState<IWordData[]>([]);
    //Grouped info and data
    const [groupMap, setGroupMap] = useState<Map<string, IGroupData>>(new Map());
    const [windowDimensions, setWindowDimensions] = useState({
        width: 0,
        height: 0,
    });

    const [errorLoading, setErrorLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadedData, setLoadedData] = useState<boolean>(false);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const [completedWordInfo, setCompletedWordInfo] = useState<IGroupCompleted[]>([]);
    const [wrongItems, setWrongItems] = useState<string[]>([]);
    const [toastsData, setToastsData] = useState<string[]>([]);
    const [pastGuesses, setPastGuesses] = useState<string[][]>([]);

    const [checking, setChecking] = useState<string[]>([]);
    const [currentSelected, setCurrentSelected] = useState<string[]>([]);

    const [shuffling, setShuffling] = useState<boolean>(false);
    const [incorrectCount, setIncorrectCount] = useState<number>(0);

    const showExtraHints = useMemo(() => incorrectCount >= 5, [incorrectCount]);

    useEffect(() => {
        if (!gameStarted)
            return;

        const data = {
            day: dateData.day,
            month: dateData.month,
            year: dateData.year,
            positionData: words,
            completedData: completedWordInfo,
            incorrectCount: incorrectCount,
            pastGuesses: pastGuesses
        } as ISessionData;

        localStorage.setItem(localStorageDataKey, JSON.stringify(data));
    }, [loading, dateData, words, completedWordInfo, incorrectCount, pastGuesses]);


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
                setWords(data.positionData);
                setCompletedWordInfo(data.completedData);
                setIncorrectCount(data.incorrectCount);
                setPastGuesses(data.pastGuesses);
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
                    setErrorLoading(true);
                } else {
                    setData(jsonData);
                }
            });

        return () => abort.abort();
    }, []);

    useEffect(() => {
        if (gameOver) {
            setCurrentSelected([]);
        }
    }, [gameOver]);


    useEffect(() => {
        if (data?.status === "OK") {
            const words = data.categories.flatMap(x => x.cards.map(z => ({
                ...z,
                id: z.content,
                group: x.title
            } as IWordData)));
            setWords(words);
            if (words.length === 0)
                return;

            const groups = new Map<string, IGroupData>(
                data.categories.map((x, i) => ([
                    x.title, {
                        type: i as CompleteType,
                        words: x.cards.map(z => z.content)
                    } as IGroupData
                ]))
            );
            setGroupMap(groups);
            setLoadedData(loadInPastData());
            setLoading(false);
        } else {
            setWords([]);
            setLoading(true);
        }
    }, [data]);


    const cellSelect = useCallback((cellName: string) => {
        setCurrentSelected(x => {
            let data = structuredClone(x);
            const index = x.findIndex(y => y === cellName);
            if (index === -1) {
                if (x.length >= 4)
                    return x;
                data.push(cellName);
            } else {
                data.splice(index, 1);
            }
            return data;
        })
    }, []);


    const completedWordGroups = useMemo(() => {
        return completedWordInfo.map(z => {
            return <CompleteRow key={z.groupName} groupName={z.groupName} groupType={z.data.type} words={z.data.words} />
        });
    }, [completedWordInfo]);

    const cells = useMemo(() => {
        let check = 1;
        return words
            .sort((a, b) => a.position - b.position)
            .map((x, i) => i < (completedWordGroups.length * 4) ? null : <Cell
                key={x.id}
                cardData={x}
                bounce={(checking.findIndex(y => y === x.content) !== -1) ? check++ : undefined}
                wrongTrigger={wrongItems.findIndex(y => y === x.content) !== -1}
                onSelect={cellSelect}
                selected={currentSelected.findIndex(y => y === x.content) !== -1}
            />)
    }, [completedWordGroups, currentSelected, wrongItems, checking, words, cellSelect]);


    const triggerWrongSelection = useCallback(() => {
        setIncorrectCount(x => ++x);
        setWrongItems(currentSelected);
        setTimeout(() => setWrongItems([]), 2000);
    }, [currentSelected]);

    const triggerBounce = useCallback(() => {
        setChecking(currentSelected);
        setTimeout(() => setChecking([]), 1000);
    }, [currentSelected]);

    const triggerGroup = useCallback((groupName: string) => {
        const startPoistion = (completedWordGroups.length * 4);
        const atStart = (x: IWordData) => x.position >= startPoistion && x.position < startPoistion + 4;

        setWords(z => {
            const selectWords = z
                .filter(x => currentSelected.includes(x.content) && !atStart(x))
                .sort((a, b) => a.position - b.position);

            const firstFourWords = z
                .filter(x => atStart(x) && !currentSelected.includes(x.content))
                .sort((a, b) => a.position - b.position);

            selectWords.forEach((x, i) => {
                const position = x.position;
                x.position = firstFourWords[i].position;
                firstFourWords[i].position = position;
            })

            return structuredClone(z);
        });

        setCompletedWordInfo(z => {
            const group = groupMap.get(groupName);
            if (group === undefined)
                return z;

            return [
                ...z,
                {
                    groupName: groupName,
                    data: group
                } as IGroupCompleted
            ]
        });

        setCurrentSelected([]);
    }, [currentSelected, completedWordInfo, groupMap]);


    const triggerShuffle = useCallback(() => {
        const start = (completedWordInfo.length * 4);
        const shuffle = (data: IWordData[]) => {
            let currentIndex = data.length;

            while (currentIndex != start) {
                let randomIndex = Math.floor(Math.random() * (currentIndex - start)) + start;
                currentIndex--;
                const position = data[currentIndex].position;
                data[currentIndex].position = data[randomIndex].position;
                data[randomIndex].position = position;
            }
        }
        setShuffling(true);
        setTimeout(() => setShuffling(false), 500);

        setWords(z => {
            shuffle(z);
            return structuredClone(z);
        })
    }, [completedWordGroups]);

    const triggerDeselect = useCallback(() => setCurrentSelected([]), []);

    const gridStyle = useMemo(() => {
        if (completedWordGroups.length === 4) {
            setGameOver(true);
        }

        let height = "80px";
        if (windowDimensions.width < 640)
            height = "22.5vw";

        return {
            gridTemplateRows: `repeat(${4 - completedWordGroups.length}, 1fr)`,
            height: `calc(${3 - completedWordGroups.length} * 8px + ${4 - completedWordGroups.length} * ${height})`
        }
    }, [completedWordGroups, windowDimensions]);


    const toasts = useMemo(() => {
        return toastsData.map(text => <Toast text={text} />)
    }, [toastsData]);


    const addGuessedWords = useCallback((words: string[]) => {
        setPastGuesses(e => [...e, words.sort()]);
    }, []);

    const checkGuessedWords = useCallback((words: string[]) => {
        let result = false;

        //This can be optimised through other methods, for the moment
        //this will do....
        for (let i = 0; i < pastGuesses.length; i++) {
            let found = true;
            for (let j = 0; j < words.length; j++) {
                if (pastGuesses[i].findIndex(y => y === words[j]) === -1) {
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
    }, [pastGuesses]);

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
        if (currentSelected.length < 4)
            return;

        triggerBounce();
        let wrong = false;
        let guessCount = new Map<string, number>();
        const groupName = words.find(x => x.content === currentSelected[0])?.group ?? "";
        currentSelected.forEach(x => {
            const index = words.findIndex(z => z.content === x);
            guessCount.set(words[index].group, (guessCount.get(words[index].group) ?? 0) + 1);
            if (words[index].group !== groupName)
                wrong = true;
        });
        let oneGuessAway = false;
        guessCount.forEach(x => {
            if (x === 3)
                oneGuessAway = true;
        });

        setTimeout(() => {
            if (wrong) {
                if (checkGuessedWords(currentSelected)) {
                    addToast("Already guessed!");
                } else {
                    addGuessedWords(currentSelected);
                    if (oneGuessAway)
                        addToast("One away...");
                    triggerWrongSelection();
                }
            } else {
                triggerGroup(groupName)
            }
        }, 1000);
    }, [currentSelected, checkGuessedWords, triggerDeselect, addGuessedWords, triggerBounce, triggerGroup, triggerWrongSelection]);

    const nothingSelected = useMemo(() => currentSelected.length === 0 || gameOver, [currentSelected]);
    const groupSelection = useMemo(() => currentSelected.length !== 4 || gameOver, [currentSelected]);

    const incorrectGuessCount = useMemo(() => <div>Incorrect Guesses: {incorrectCount}</div>, [incorrectCount]);

    const boardClasses = useMemo(() => `board-grid${shuffling ? " shuffle" : ""}`, [shuffling]);
    const showLoading = useMemo(() => ({ display: loading ? undefined : "none" } as CSSProperties), [loading]);
    const showGame = useMemo(() => ({ display: loading || !gameStarted ? "none" : undefined, width: "100vw" } as CSSProperties), [loading, gameStarted]);
    const showMenuGame = useMemo(() => ({ display: !loading && !gameStarted ? undefined : "none", width: windowDimensions.width < 640 ? "100vw" : undefined, height: windowDimensions.width < 640 ? "100vh" : undefined } as CSSProperties), [loading, gameStarted]);

    const gameOverMessage = useMemo(() => {
        if (gameOver) {
            return <div>Good work!</div>
        } else {
            return null;
        }
    }, [gameOver]);
    const gameStart = useCallback(() => setGameStarted(true), []);


    return (
        <main>
            <div style={showLoading}>
                <Loading showError={errorLoading} />
            </div>
            <div style={showMenuGame}>
                <GameMenu
                    startGame={gameStart}
                    newGame={!loadedData}
                    foundCount={completedWordInfo.length}
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
                        disabled={gameOver}
                        hide={gameOver}
                    />

                    <Button
                        text="Deselect All"
                        onClick={triggerDeselect}
                        disabled={nothingSelected}
                        hide={gameOver}
                    />

                    <Button
                        text="Submit"
                        onClick={triggerCheckGroup}
                        disabled={groupSelection}
                        hide={gameOver}
                    />
                </div>
            </div>
        </main>
    )
}