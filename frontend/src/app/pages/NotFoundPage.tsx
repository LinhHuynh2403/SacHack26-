import { Link } from "react-router";
import { Home, AlertCircle } from "lucide-react";

export function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
            <p className="text-xl text-gray-600 mb-8 text-max-w-md">
                Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95"
            >
                <Home className="w-5 h-5" />
                Back to Dashboard
            </Link>
        </div>
    );
}
