import React from 'react';

interface IFTALogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const IFTALogo: React.FC<IFTALogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background Circle */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="currentColor"
          className="opacity-10"
        />
        
        {/* Truck Silhouette */}
        <path
          d="M8 28h2v4h28v-4h2v-8h-6v-4a2 2 0 0-2-2H14a2 2 0 0-2 2v12z"
          fill="currentColor"
          className="opacity-80"
        />
        <rect x="10" y="18" width="4" height="2" fill="currentColor" />
        <rect x="16" y="18" width="4" height="2" fill="currentColor" />
        
        {/* IFTA Text Overlay */}
        <text
          x="24"
          y="26"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-current font-bold"
          style={{ fontSize: '8px', letterSpacing: '0.5px' }}
        >
          IFTA
        </text>
        
        {/* Tax Symbol */}
        <circle cx="36" cy="12" r="6" fill="currentColor" className="opacity-20" />
        <text
          x="36"
          y="12"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-current font-bold"
          style={{ fontSize: '6px' }}
        >
          $
        </text>
      </svg>
    </div>
  );
};

export default IFTALogo;