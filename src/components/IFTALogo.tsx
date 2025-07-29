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
        {/* Main Circle Background */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="currentColor"
          className="opacity-15"
        />
        
        {/* Inner Badge Circle */}
        <circle
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-60"
        />
        
        {/* Highway/Road Symbol */}
        <path
          d="M10 20 L38 20 L36 16 L12 16 Z"
          fill="currentColor"
          className="opacity-70"
        />
        <path
          d="M10 28 L38 28 L36 32 L12 32 Z"
          fill="currentColor"
          className="opacity-70"
        />
        
        {/* True Trucker PRO Text - Bold and Centered */}
        <text
          x="24"
          y="20"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-current font-black"
          style={{ fontSize: '5px', letterSpacing: '0.5px' }}
        >
          TRUE TRUCKER
        </text>
        <text
          x="24"
          y="28"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-current font-bold"
          style={{ fontSize: '4px', letterSpacing: '0.5px' }}
        >
          PRO
        </text>
        
        {/* Fuel Drops */}
        <circle cx="14" cy="12" r="2" fill="currentColor" className="opacity-50" />
        <circle cx="34" cy="12" r="2" fill="currentColor" className="opacity-50" />
        <circle cx="14" cy="36" r="2" fill="currentColor" className="opacity-50" />
        <circle cx="34" cy="36" r="2" fill="currentColor" className="opacity-50" />
        
        {/* Tax/Dollar Symbol */}
        <circle cx="40" cy="8" r="4" fill="currentColor" className="opacity-30" />
        <text
          x="40"
          y="8"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-current font-bold"
          style={{ fontSize: '5px' }}
        >
          $
        </text>
      </svg>
    </div>
  );
};

export default IFTALogo;