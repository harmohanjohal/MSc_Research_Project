'use client'
// Error components must be Client Components

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Unhandled application error:', error)
    }, [error])

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 font-sans text-gray-900">
            <div className="max-w-md rounded-xl bg-white p-8 px-10 text-center shadow-lg border border-red-100">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-red-100 p-3">
                        <svg
                            className="h-8 w-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            ></path>
                        </svg>
                    </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Something went wrong!</h2>
                <p className="mb-6 text-sm text-gray-500">
                    We encountered an unexpected error while processing your request. Our team has been notified.
                </p>
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}
