import React from 'react';

interface TimeRemainingProps {
  timeRemaining: number | null;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function TimeRemaining({ timeRemaining }: TimeRemainingProps) {
  if (timeRemaining === null || timeRemaining <= 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="text-yellow-800 font-medium">Time Remaining</div>
      <div className="text-2xl font-bold text-yellow-900">
        {formatTime(timeRemaining)}
      </div>
    </div>
  );
}
