import React from 'react';

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 01-12 0m12 0A9.094 9.094 0 0012 21a9.094 9.094 0 00-6 2.28m12-2.28a9.094 9.094 0 01-12 0m12 0A9.094 9.094 0 0012 9a9.094 9.094 0 00-6 2.28m6-2.28a9.094 9.094 0 016-2.28m-6 2.28a9.094 9.094 0 00-6 2.28m-6-4.5A9.094 9.094 0 0112 4.5a9.094 9.094 0 016 2.28m-12 0a9.094 9.094 0 00-6 2.28" 
        />
    </svg>
);
