import React from 'react';
import { SearchIcon } from './SearchIcon';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder }) => {
    return (
        <div className="relative w-full mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || 'Pesquisar...'}
                aria-label="Pesquisar boss pelo nome"
                className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 py-2 pl-10 pr-4"
            />
        </div>
    );
};
