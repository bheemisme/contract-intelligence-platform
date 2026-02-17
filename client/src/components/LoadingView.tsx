import { twMerge } from "tailwind-merge";

interface LoadingViewProps {
    message: string;
    className?: string;
}
const LoadingView = ({ message, className }: LoadingViewProps) => (
    <div className={twMerge(className, "flex flex-col items-center justify-center h-screen bg-green-50")}>
        <svg className="w-20 h-20 animate-spin text-green-700" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-6 text-lg font-semibold text-green-800">{message}</p>
    </div>
);

export default LoadingView;