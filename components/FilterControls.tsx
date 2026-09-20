import React from 'react';
import { ALL_MAPS, ALL_BOSSES, ALL_TIERS } from '../constants';

interface FilterControlsProps {
    servers: { [key: string]: { label: string, offset: number, iana: string } };
    selectedServer: string;
    onServerChange: (value: string) => void;
    tiers: string[];
    selectedTier: string;
    onTierChange: (value: string) => void;
    maps: string[];
    bosses: string[];
    periods: string[];
    selectedMap: string;
    selectedBoss: string;
    selectedPeriod: string;
    onMapChange: (value: string) => void;
    onBossChange: (value: string) => void;
    onPeriodChange: (value: string) => void;
}

const SelectInput: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = ({ label, value, onChange, children }) => (
    <div>
        <label htmlFor={label} className="block text-sm font-medium text-slate-400 mb-1">
            {label}
        </label>
        <select
            id={label}
            value={value}
            onChange={onChange}
            className="w-full bg-slate-800 border border-slate-600 text-slate-200 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 py-2 px-3"
        >
            {children}
        </select>
    </div>
);

export const FilterControls: React.FC<FilterControlsProps> = ({
    servers,
    selectedServer,
    onServerChange,
    tiers,
    selectedTier,
    onTierChange,
    maps,
    bosses,
    periods,
    selectedMap,
    selectedBoss,
    selectedPeriod,
    onMapChange,
    onBossChange,
    onPeriodChange,
}) => {
    return (
        <>
            <SelectInput label="Servidor / Fuso" value={selectedServer} onChange={(e) => onServerChange(e.target.value)}>
                {Object.keys(servers).map(serverKey => (
                    <option key={serverKey} value={serverKey}>{servers[serverKey].label}</option>
                ))}
            </SelectInput>
             <SelectInput label="Camada" value={selectedTier} onChange={(e) => onTierChange(e.target.value)}>
                <option value={ALL_TIERS}>{ALL_TIERS}</option>
                {tiers.map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                ))}
            </SelectInput>
            <SelectInput label="Mapa (W)" value={selectedMap} onChange={(e) => onMapChange(e.target.value)}>
                <option value={ALL_MAPS}>{ALL_MAPS}</option>
                {maps.map(map => (
                    <option key={map} value={map}>W{map}</option>
                ))}
            </SelectInput>
             <SelectInput label="Boss" value={selectedBoss} onChange={(e) => onBossChange(e.target.value)}>
                <option value={ALL_BOSSES}>{ALL_BOSSES}</option>
                {bosses.map(boss => (
                    <option key={boss} value={boss}>{boss}</option>
                ))}
            </SelectInput>
            <SelectInput label="Período" value={selectedPeriod} onChange={(e) => onPeriodChange(e.target.value)}>
                {periods.map(period => (
                    <option key={period} value={period}>{period}</option>
                ))}
            </SelectInput>
        </>
    );
};