import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-4">
      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${Math.max(5, progress)}%` }} // Minimum width for visibility
        />
      </div>
    </div>
  );
};
