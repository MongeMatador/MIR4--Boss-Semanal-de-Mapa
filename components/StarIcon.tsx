import React from 'react';

interface StarIconProps extends React.SVGProps<SVGSVGElement> {
    isFavorite: boolean;
}

export const StarIcon: React.FC<StarIconProps> = ({ isFavorite, ...props }) => {
    const starClasses = isFavorite
        ? 'text-yellow-400 fill-yellow-400'
        : 'text-slate-500 hover:text-yellow-400';

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-5 h-5 cursor-pointer transition-colors ${starClasses}`}
            {...props}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    );
};
