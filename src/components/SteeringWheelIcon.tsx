import React from 'react';

interface SteeringWheelIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export default function SteeringWheelIcon({
  className = 'w-4 h-4',
  size,
  ...props
}: SteeringWheelIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      {/* Outer steering wheel rim */}
      <circle cx="12" cy="12" r="9.5" />
      
      {/* Center horn/airbag hub */}
      <circle cx="12" cy="12" r="3.2" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />

      {/* Left spoke */}
      <line x1="2.6" y1="12" x2="8.8" y2="12" />

      {/* Right spoke */}
      <line x1="15.2" y1="12" x2="21.4" y2="12" />

      {/* Bottom vertical spoke */}
      <line x1="12" y1="15.2" x2="12" y2="21.4" />
    </svg>
  );
}
