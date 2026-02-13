import type React from "react";

export type FlagType = "success" | "error" | "warning" | "info";

interface FlagProps {
    message: string,
    flag: FlagType,
    setShowFlag: React.Dispatch<React.SetStateAction<boolean>>
}

const Flag: React.FC<FlagProps> = ({message, flag, setShowFlag}) => {
    const flagColor = flag === "success" ? "text-green-500" : flag === "error" ? "text-red-500" : flag === "warning" ? "text-yellow-500" : "text-blue-500";

    // flat should fall from top in smooth animation
    
    return (
        <div className={`fixed p-4 bg-gray-100  left-1/2 transform -translate-x-1/4 translate-y-2/3 z-50 flex items-center justify-between rounded-lg duration-500`}>
            <p className={`${flagColor}`}>{message}</p>

            <button className="ml-4 cursor-pointer" onClick={() => setShowFlag(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}

export default Flag;