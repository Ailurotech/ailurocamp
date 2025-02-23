"use client";

import React from "react";

// Error handler
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
      <p>{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        Retry
      </button>
    </div>
  );
}
