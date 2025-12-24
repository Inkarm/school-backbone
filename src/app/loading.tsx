export default function Loading() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
            <div className="relative flex items-center justify-center">
                {/* Outer ring */}
                <div className="absolute h-12 w-12 rounded-full border-4 border-blue-100"></div>
                {/* Spinning ring */}
                <div className="h-12 w-12 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
                Ładowanie...
            </p>
        </div>
    );
}
