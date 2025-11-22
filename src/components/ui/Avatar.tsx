import React from 'react';

interface AvatarProps {
  className?: string;
  children: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ className, children }) => {
  return (
    <div className={`relative inline-flex items-center justify-center rounded-full bg-gray-200 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface AvatarImageProps {
  src: string;
  alt: string;
  onError?: () => void;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, onError }) => {
  return <img src={src} alt={alt} className="object-cover w-full h-full" onError={onError} />;
};

interface AvatarFallbackProps {
  children: React.ReactNode;
  className?: string;
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children, className }) => {
  return (
    <span className={`flex items-center justify-center w-full h-full font-medium ${className}`}>
      {children}
    </span>
  );
};
