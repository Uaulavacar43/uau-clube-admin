import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-50 px-3 py-2 text-sm text-white transform -translate-x-1/2 translate-y-2 bg-gray-900 rounded-lg shadow-lg left-1/2 min-w-max">
          {content}
          <div className="absolute w-2 h-2 transform -translate-x-1/2 rotate-45 bg-gray-900 -top-1 left-1/2" />
        </div>
      )}
    </div>
  );
}; 