
import React from 'react';
import { UsersIcon } from './UsersIcon';

export const VisitorCounter: React.FC = () => {
    return (
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-500 text-sm">
            <UsersIcon className="w-4 h-4" />
            <span className="mr-1">Acessos:</span>
            {/* Using a badge image instead of fetch API to avoid CORS/Network errors and ensure reliability */}
            <img 
                src="https://hits.sh/mir4bossrespawntimer.netlify.app.svg?view=today-total&style=flat-square&label=&color=1e293b&labelColor=1e293b" 
                alt="Visitor Count" 
                className="h-5 rounded"
            />
        </div>
    );
};
