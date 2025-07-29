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
          className="opacity-20"
        />
        
        {/* Inner Badge Circle */}
        <circle
          cx="24"
          cy="24"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-80"
        />
        
        {/* Text Background Circle for Better Contrast */}
        <circle
          cx="24"
          cy="24"
          r="15"
          fill="currentColor"
          className="opacity-90"
        />
        
        {/* TRUE TRUCKER PRO Text - Bold and Centered with High Contrast */}
        <text
          x="24"
          y="18"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-black"
          style={{ fontSize: '6px', letterSpacing: '0.3px' }}
        >
          TRUE
        </text>
        <text
          x="24"
          y="25"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-black"
          style={{ fontSize: '5px', letterSpacing: '0.3px' }}
        >
          TRUCKER
        </text>
        <text
          x="24"
          y="31"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-bold"
          style={{ fontSize: '5px', letterSpacing: '0.5px' }}
        >
          PRO
        </text>
        
        {/* Highway/Road Symbol - Moved to corners */}
        <path
          d="M6 10 L16 10 L15 8 L7 8 Z"
          fill="currentColor"
          className="opacity-60"
        />
        <path
          d="M32 10 L42 10 L41 8 L33 8 Z"
          fill="currentColor"
          className="opacity-60"
        />
        <path
          d="M6 38 L16 38 L15 40 L7 40 Z"
          fill="currentColor"
          className="opacity-60"
        />
        <path
          d="M32 38 L42 38 L41 40 L33 40 Z"
          fill="currentColor"
          className="opacity-60"
        />
        
        {/* Fuel Drops */}
        <circle cx="10" cy="6" r="2" fill="currentColor" className="opacity-50" />
        <circle cx="38" cy="6" r="2" fill="currentColor" className="opacity-50" />
        <circle cx="10" cy="42" r="2" fill="currentColor" className="opacity-50" />
        <circle cx="38" cy="42" r="2" fill="currentColor" className="opacity-50" />
        
        {/* Tax/Dollar Symbol */}
        <circle cx="42" cy="6" r="3" fill="currentColor" className="opacity-40" />
        <text
          x="42"
          y="6"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white font-bold"
          style={{ fontSize: '4px' }}
        >
          $
        </text>
      </svg>
    </div>
  );
};

export default IFTALogo;