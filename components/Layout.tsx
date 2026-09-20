import React from 'react';
import { NavLink } from 'react-router-dom';
import { FloatingDonationButton } from './FloatingDonationButton';
import { DragonIcon } from './DragonIcon';

interface LayoutProps {
  children: React.ReactNode;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
    isActive
      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
  }`;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <NavLink to="/" className="flex items-center gap-2 text-slate-200 font-bold flex-shrink-0">
            <DragonIcon className="h-6 w-6 text-cyan-400" />
            <span className="hidden md:inline">MIR4 Boss Timer</span>
          </NavLink>
          <div className="flex gap-1 sm:gap-2 overflow-x-auto">
            <NavLink to="/" end className={navLinkClass}>
              🐉 Boss Timer
            </NavLink>
            <NavLink to="/marketplace" className={navLinkClass}>
              💎 Marketplace
            </NavLink>
            <NavLink to="/consulta" className={navLinkClass}>
              🔍 Consulta
            </NavLink>
            <NavLink to="/transferencias" className={navLinkClass}>
              🔁 Transferências
            </NavLink>
            <NavLink to="/guerra" className={navLinkClass}>
              🏰 Guerra
            </NavLink>
            <NavLink to="/expedicao" className={navLinkClass}>
              🐲 Expedição
            </NavLink>
            <NavLink to="/rankings" className={navLinkClass}>
              🏆 Rankings
            </NavLink>
            <NavLink to="/clan-rankings" className={navLinkClass}>
              ⚔️ Clãs
            </NavLink>
            <NavLink to="/item-market" className={navLinkClass}>
              🗡️ Itens
            </NavLink>
          </div>
        </div>
      </nav>

      {children}

      <FloatingDonationButton />
    </div>
  );
};
