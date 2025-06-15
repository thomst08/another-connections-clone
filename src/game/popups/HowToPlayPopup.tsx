import { PopupComponent } from "./Popup";


interface IHowToPlayPopupProps {
    closePopup: () => void,
    openPopup: boolean
}


export function HowToPlayPopup(props: IHowToPlayPopupProps) {

    return (
        <PopupComponent
            openPopup={props.openPopup}
            closePopup={props.closePopup}
            title={"How to Play"}
        >
            <p className="text-base leading-relaxed">
                Find groups of four items that share something in common.
            </p>

            <ul className="list-disc ml-10">
                <li>Select four items and tap 'Submit' to check if your guess is correct.</li>
                <li>Find the groups without making 4 mistakes!</li>
            </ul>

            <p className="font-bold">Category Examples</p>

            <ul className="list-disc ml-10">
                <li>FISH: Bass, Flounder, Salmon, Trout</li>
                <li>FIRE ___: Ant, Drill, Island, Opal</li>
            </ul>
        </PopupComponent>
    );
}