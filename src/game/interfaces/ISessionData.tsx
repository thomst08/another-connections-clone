import { ICardData } from "./IConnectionsAPIData"

export interface ISessionData {
    day: number,
    month: number,
    year: number,
    positionData: IWordData[],
    completedData: IGroupCompleted[],
    incorrectCount: number,
    pastGuesses: string[][]
}


export interface IGroupCompleted {
    groupName: string,
    data: IGroupData
}


export interface IWordData extends ICardData {
    id: string,
    group: string
}


export interface IGroupData {
    type: CompleteType,
    words: string[]
}


export enum CompleteType {
    easy = 0, mid = 1, hard = 2, vhard = 3
}