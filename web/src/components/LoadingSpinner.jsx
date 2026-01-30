/**
 * LoadingSpinner.jsx - Loading spinner component
 */

export default function LoadingSpinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    return (
        <div className={`flex items-center justify-center p-8 ${className}`}>
            <div className={`${sizes[size]} relative`}>
                <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin"></div>
            </div>
        </div>
    );
}
