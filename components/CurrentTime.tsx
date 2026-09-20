
import React, { useMemo } from 'react';

interface CurrentTimeProps {
    time: Date;
    server: { label: string, offset: number, iana: string };
}

export const CurrentTime: React.FC<CurrentTimeProps> = ({ time, server }) => {
    // Cálculo robusto: Date.now() sempre retorna o timestamp UTC.
    // Simplesmente adicionamos o deslocamento do servidor em milissegundos.
    const serverTimeString = useMemo(() => {
        const nowUTC = Date.now();
        const serverTimeMs = nowUTC + (server.offset * 3600000);
        const serverDate = new Date(serverTimeMs);
        
        // Usamos getUTC para extrair os componentes da data que já foi deslocada
        const h = String(serverDate.getUTCHours()).padStart(2, '0');
        const m = String(serverDate.getUTCMinutes()).padStart(2, '0');
        const s = String(serverDate.getUTCSeconds()).padStart(2, '0');
        
        return `${h}:${m}:${s}`;
    }, [time, server.offset]);

    return (
        <div className="relative overflow-hidden bg-slate-800/80 border-2 border-cyan-500/50 rounded-xl p-4 text-center h-full flex flex-col justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)] group transition-all hover:border-cyan-400">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-400 mb-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                Hora do Servidor
            </div>
            
            <div className="text-3xl font-mono font-black text-white tracking-widest drop-shadow-sm group-hover:text-cyan-50 transition-colors">
                {serverTimeString}
            </div>
            
            <div className="mt-1 flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {server.label}
                </div>
            </div>
        </div>
    );
};
