import type React from "react";
import { twMerge } from "tailwind-merge";
export type FlagType = "success" | "error" | "warning" | "info";

interface FlagProps {

    message: string,
    flag: FlagType,
    setShowFlag: React.Dispatch<React.SetStateAction<boolean>>
    showFlag: boolean;
    hideFlag: boolean;
    setHideFlag: React.Dispatch<React.SetStateAction<boolean>>;
}

const Flag: React.FC<FlagProps> = ({ message, flag, setShowFlag, showFlag, hideFlag, setHideFlag }) => {

    const flagColor = flag === "success" ? "text-green-500" : flag === "error" ? "text-red-500" : flag === "warning" ? "text-yellow-500" : "text-blue-500";

    // flat should fall from top in smooth animation
   
    return (
        <div className={twMerge(`fixed`, `p-4 bg-gray-100 rounded-lg`,`z-50 top-0 left-1/2 transform -translate-x-1/4 transition-transform`, `${showFlag ? "translate-y-2/3" : "-translate-y-full"}`, `${hideFlag ?  "hidden" : "flex items-center justify-between"}`)}>
            <p className={`${flagColor}`}>{message}</p>

            <button className="ml-4 cursor-pointer" onClick={() => {
                setShowFlag(false)
                setTimeout(() => {
                    setHideFlag(true)
                }, 2000);
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}

export default Flag;