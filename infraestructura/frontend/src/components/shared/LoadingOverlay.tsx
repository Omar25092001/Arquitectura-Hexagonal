
 
const LoadingOverlay = () => (
    <div className="fixed inset-0 z-[9999] bg-[rgba(0,0,0,0.5)]  flex flex-col items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-orange-400 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    </div>
);

export default LoadingOverlay;