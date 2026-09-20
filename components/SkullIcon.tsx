import React from 'react';

interface SkullIconProps extends React.SVGProps<SVGSVGElement> {
    isKilled: boolean;
}

export const SkullIcon: React.FC<SkullIconProps> = ({ isKilled, ...props }) => {
    const iconClasses = isKilled
        ? 'text-slate-600 fill-slate-700'
        : 'text-slate-500 hover:text-red-400';

    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={`w-6 h-6 transition-colors duration-200 ${iconClasses}`}
            {...props}
        >
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9c-.83 0-1.5-.67-1.5-1.5S9.17 8 10 8s1.5.67 1.5 1.5S10.83 11 10 11zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 8 14 8s1.5.67 1.5 1.5S14.83 11 14 11zm-4 2h4v2h-4v-2z" />
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-2-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-4 2h4v2h-4z" opacity=".3" />
        </svg>
    );
};