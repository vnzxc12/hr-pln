import React from 'react';

export const PesoIcon = ({ className = "w-3.5 h-3.5", size, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {/* P vertical spine and upper bowl */}
      <path d="M7 3v18" />
      <path d="M7 4h6.5a5 5 0 0 1 0 10H7" />
      {/* Philippine Peso double horizontal strike bars */}
      <path d="M4 8h11" />
      <path d="M4 11.5h11" />
    </svg>
  );
};

export default PesoIcon;
