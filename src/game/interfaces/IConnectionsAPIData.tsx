

export interface IConnectionsAPIData {
    status: string,
    id: number,
    print_date: string,
    editor: string,
    categories: ICategorieData[]
}


export interface ICategorieData {
    title: string,
    cards: ICardData[]
}


export interface ICardData {
    content: string,
    position: number
}