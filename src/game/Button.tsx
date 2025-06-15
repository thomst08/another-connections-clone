

interface IButton {
    text: string,
    onClick: () => void,
    disabled?: boolean,
    hide?: boolean
}

export function Button(props: IButton) {
    return (
        <button
            className="game-button"
            onClick={props.onClick}
            disabled={props.disabled ?? false}
            hidden={props.hide ?? false}
        >
            {props.text}
        </button>
    )
}