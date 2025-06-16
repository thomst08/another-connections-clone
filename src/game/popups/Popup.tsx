import { CSSProperties, ReactNode, useMemo } from "react";


interface IHintPopupProps {
    closePopup: () => void,
    openPopup: boolean,
    title: string,
    children?: ReactNode
}


export function PopupComponent(props: IHintPopupProps) {
    const popupStyle = useMemo(() => props.openPopup ? undefined : { display: "none" } as CSSProperties, [props.openPopup]);

    return (
        <>
            <div id="hint-modal" style={popupStyle} className="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-[#c1c1c147]">
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                    <div className="relative bg-white rounded-lg shadow-2xl inset-shadow-2xs">
                        <div className="flex items-center justify-between p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-200">
                            <h3 className="text-xl font-semibold">
                                {props.title}
                            </h3>
                            <button type="button" className="bg-transparent cursor-pointer hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" onClick={props.closePopup}>
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <div className="p-4 md:p-5 space-y-4">
                            {props.children}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}