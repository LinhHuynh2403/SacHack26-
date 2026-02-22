import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    showHome?: boolean;
}

export function ErrorState({
    title = "Connection Error",
    message = "We're having trouble connecting to the server. Please check your internet or try again later.",
    onRetry,
    showHome = true
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm my-4 mx-2">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 max-w-sm">{message}</p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>
                )}

                {showHome && (
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                )}
            </div>
        </div>
    );
}
