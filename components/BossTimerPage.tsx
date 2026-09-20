// Fix: Correctly import React hooks
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BossSpawn } from '../types';
import { BOSS_DATA_RAW, PERIODOS, ALL_MAPS, ALL_BOSSES, ALL_PERIODS, ALL_TIERS, SERVER_TIMEZONES } from '../constants';
import { FilterControls } from './FilterControls';
import { BossTable } from './BossTable';
import { NextSpawn } from './NextSpawn';
import { CurrentTime } from './CurrentTime';
import { DragonIcon } from './DragonIcon';
import { ExtraControls } from './ExtraControls';
import { usePrevious } from '../hooks/usePrevious';
import AdComponent from './AdComponent';
import { VisitorCounter } from './VisitorCounter';
import { SearchInput } from './SearchInput';
import SEOContent from './SEOContent';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { GuidesSection } from './GuidesSection';

const FAVORITES_STORAGE_KEY = 'mir4_boss_favorites';
const KILLED_BOSSES_STORAGE_KEY = 'mir4_boss_killed_by_name';
const HIDE_KILLED_STORAGE_KEY = 'mir4_boss_hide_killed';
const SERVER_STORAGE_KEY = 'mir4_boss_server';
const TIER_STORAGE_KEY = 'mir4_boss_tier_filter'; // Renamed from LAYER
const MAP_STORAGE_KEY = 'mir4_boss_map';
const BOSS_STORAGE_KEY = 'mir4_boss_boss';
const PERIOD_STORAGE_KEY = 'mir4_boss_period';
const SEARCH_STORAGE_KEY = 'mir4_boss_search';

const getWeekId = (d: Date): string => {
  const date = new Date(d.getTime());
  const day = date.getDay(); 
  const diff = date.getDate() - day;
  const lastSunday = new Date(date.setDate(diff));
  lastSunday.setHours(0, 0, 0, 0);
  return lastSunday.toISOString().split('T')[0];
};

const playNotificationSound = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    try {
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        oscillator.frequency.value = 880;
        oscillator.type = 'sine';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.2);
    } catch (e) {
        console.error("Audio play failed", e);
    }
};

const BossTimerPage: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedServer, setSelectedServer] = useState<string>(() => {
        const stored = localStorage.getItem(SERVER_STORAGE_KEY);
        return (stored && SERVER_TIMEZONES[stored]) ? stored : 'SA';
    });
    const [selectedTier, setSelectedTier] = useState<string>(() => localStorage.getItem(TIER_STORAGE_KEY) ?? ALL_TIERS);
    const [selectedMap, setSelectedMap] = useState<string>(() => localStorage.getItem(MAP_STORAGE_KEY) ?? ALL_MAPS);
    const [selectedBoss, setSelectedBoss] = useState<string>(() => localStorage.getItem(BOSS_STORAGE_KEY) ?? ALL_BOSSES);
    const [selectedPeriod, setSelectedPeriod] = useState<string>(() => localStorage.getItem(PERIOD_STORAGE_KEY) ?? ALL_PERIODS);
    const [searchQuery, setSearchQuery] = useState<string>(() => localStorage.getItem(SEARCH_STORAGE_KEY) ?? '');
    const [favoritedBosses, setFavoritedBosses] = useState<Set<string>>(new Set());
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);
    const [killedBosses, setKilledBosses] = useState<Set<string>>(new Set());
    const [hideKilled, setHideKilled] = useState(true);

    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
            if (storedFavorites) setFavoritedBosses(new Set(JSON.parse(storedFavorites) as string[]));
            
            const storedKilledData = localStorage.getItem(KILLED_BOSSES_STORAGE_KEY);
            const currentWeekId = getWeekId(new Date());
            if (storedKilledData) {
                const { weekId, killed } = JSON.parse(storedKilledData) as { weekId: string, killed: string[] };
                if (weekId === currentWeekId) setKilledBosses(new Set(killed));
            }
            
            const storedHideKilled = localStorage.getItem(HIDE_KILLED_STORAGE_KEY);
            if (storedHideKilled !== null) setHideKilled(JSON.parse(storedHideKilled));

        } catch (error) { 
            console.error("Failed to initialize from localStorage", error);
        }
    }, []);

    useEffect(() => { localStorage.setItem(SERVER_STORAGE_KEY, selectedServer); }, [selectedServer]);
    useEffect(() => { localStorage.setItem(TIER_STORAGE_KEY, selectedTier); }, [selectedTier]);
    useEffect(() => { localStorage.setItem(MAP_STORAGE_KEY, selectedMap); }, [selectedMap]);
    useEffect(() => { localStorage.setItem(BOSS_STORAGE_KEY, selectedBoss); }, [selectedBoss]);
    useEffect(() => { localStorage.setItem(PERIOD_STORAGE_KEY, selectedPeriod); }, [selectedPeriod]);
    useEffect(() => { localStorage.setItem(SEARCH_STORAGE_KEY, searchQuery); }, [searchQuery]);

    const calculateCountdown = useCallback((spawnTimeStr: string, now: Date): { countdown: string, delta: number, formattedTime: string } => {
        if (!spawnTimeStr) return { countdown: '--', delta: 999999999, formattedTime: '--:--' };
        const [h, m] = spawnTimeStr.split(':').map(Number);
        const timezoneInfo = SERVER_TIMEZONES[selectedServer];
        if (!timezoneInfo) return { countdown: 'Error', delta: 0, formattedTime: 'Error' };
        const nowServerMs = now.getTime() + (timezoneInfo.offset * 3600000);
        const spawnDate = new Date(nowServerMs);
        spawnDate.setUTCHours(h, m, 0, 0);
        if (spawnDate.getTime() <= nowServerMs) {
            spawnDate.setUTCDate(spawnDate.getUTCDate() + 1);
        }
        const delta = spawnDate.getTime() - nowServerMs;
        const totalSeconds = Math.floor(delta / 1000);
        const h_delta = Math.floor(totalSeconds / 3600);
        const m_delta = Math.floor((totalSeconds % 3600) / 60);
        return {
            countdown: `${String(h_delta).padStart(2, '0')}h ${String(m_delta).padStart(2, '0')}m`,
            delta,
            formattedTime: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        };
    }, [selectedServer]);

    const toggleFavorite = useCallback((bossName: string) => {
        setFavoritedBosses(prev => {
            const next = new Set(prev);
            next.has(bossName) ? next.delete(bossName) : next.add(bossName);
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(next)));
            return next;
        });
    }, []);

    const toggleKilled = useCallback((bossNames: string[]) => {
        setKilledBosses(prev => {
            const next = new Set(prev);
            const isAlreadyKilled = bossNames.length > 0 && next.has(bossNames[0]);
            bossNames.forEach(name => isAlreadyKilled ? next.delete(name) : next.add(name));
            localStorage.setItem(KILLED_BOSSES_STORAGE_KEY, JSON.stringify({ weekId: getWeekId(new Date()), killed: Array.from(next) }));
            return next;
        });
    }, []);

    const resetKilledBosses = useCallback(() => {
        setKilledBosses(new Set());
        localStorage.setItem(KILLED_BOSSES_STORAGE_KEY, JSON.stringify({ weekId: getWeekId(new Date()), killed: [] }));
    }, []);

    const handleHideKilledChange = useCallback((shouldHide: boolean) => {
        setHideKilled(shouldHide);
        localStorage.setItem(HIDE_KILLED_STORAGE_KEY, JSON.stringify(shouldHide));
    }, []);

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const activeSpawns = useMemo(() => {
        return Array.isArray(BOSS_DATA_RAW) ? BOSS_DATA_RAW : [];
    }, []);

    const availableMaps = useMemo<string[]>(() => {
        let filteredSpawns = activeSpawns;
        if (selectedTier === 'Camada 1') {
            filteredSpawns = filteredSpawns.filter(s => s.tier === 1);
        } else if (selectedTier === 'Camada 3') {
            filteredSpawns = filteredSpawns.filter(s => s.tier === 3);
        }
        return [...new Set(filteredSpawns.map(s => s.W.toString()))].sort((a: string, b: string) => parseInt(a, 10) - parseInt(b, 10));
    }, [activeSpawns, selectedTier]);
    
    const availableBosses = useMemo<string[]>(() => {
        let potentialSpawns = activeSpawns;
        if (selectedTier === 'Camada 1') {
            potentialSpawns = potentialSpawns.filter(s => s.tier === 1);
        } else if (selectedTier === 'Camada 3') {
            potentialSpawns = potentialSpawns.filter(s => s.tier === 3);
        }
        if (selectedMap !== ALL_MAPS) potentialSpawns = potentialSpawns.filter(spawn => spawn.W.toString() === selectedMap);
        return [...new Set(potentialSpawns.flatMap(b => b.bosses || []))].sort();
    }, [activeSpawns, selectedTier, selectedMap]);

    useEffect(() => {
        if (selectedMap !== ALL_MAPS && !availableMaps.includes(selectedMap)) setSelectedMap(ALL_MAPS);
    }, [selectedMap, availableMaps]);

    useEffect(() => {
        if (selectedBoss !== ALL_BOSSES && !availableBosses.includes(selectedBoss)) setSelectedBoss(ALL_BOSSES);
    }, [selectedBoss, availableBosses]);

    const filteredAndSortedSpawns = useMemo((): BossSpawn[] => {
        const spawnsWithCalculations: BossSpawn[] = activeSpawns.map(spawn => {
            const { countdown, delta, formattedTime } = calculateCountdown(spawn.time, currentTime);
            const id = `${spawn.W}-${spawn.time}-${spawn.location}-${(spawn.bosses || []).join(',')}-${spawn.layer}`;
            const safeBosses = (spawn.bosses || []).map(String);
            return {
                id,
                map: spawn.W,
                layer: spawn.layer,
                time: formattedTime,
                originalTime: spawn.time,
                location: spawn.location,
                bosses: safeBosses,
                bossesString: safeBosses.join(', '),
                countdown,
                delta,
                tier: spawn.tier,
            };
        });

        let filtered = spawnsWithCalculations;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(s => s.bossesString.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || `w${s.map}`.includes(q) || (s.layer && s.layer.toLowerCase().includes(q)));
        }
        if (showFavoritesOnly) filtered = filtered.filter(s => s.bosses.some(b => favoritedBosses.has(b)));
        if (hideKilled) filtered = filtered.filter(s => !s.bosses.some(b => killedBosses.has(b)));
        if (selectedTier === 'Camada 1') {
            filtered = filtered.filter(s => s.tier === 1);
        } else if (selectedTier === 'Camada 3') {
            filtered = filtered.filter(s => s.tier === 3);
        }
        if (selectedMap !== ALL_MAPS) filtered = filtered.filter(s => s.map.toString() === selectedMap);
        if (selectedBoss !== ALL_BOSSES) filtered = filtered.filter(s => s.bosses.includes(selectedBoss));
        if (selectedPeriod !== ALL_PERIODS) {
            const period = PERIODOS[selectedPeriod];
            if (period) {
                const [min, max] = period;
                filtered = filtered.filter(s => {
                    const h = parseInt(s.originalTime.substring(0, 2), 10);
                    return min > max ? (h >= min || h < max) : (h >= min && h < max);
                });
            }
        }
        return filtered.sort((a, b) => a.delta - b.delta);
    }, [currentTime, activeSpawns, selectedTier, selectedMap, selectedBoss, selectedPeriod, showFavoritesOnly, favoritedBosses, hideKilled, killedBosses, calculateCountdown, searchQuery]);

    const nextSpawnsGroup = useMemo(() => {
        if (filteredAndSortedSpawns.length === 0) return [];
        const firstDelta = filteredAndSortedSpawns[0].delta;
        return filteredAndSortedSpawns.filter(s => Math.abs(s.delta - firstDelta) < 60000);
    }, [filteredAndSortedSpawns]);

    const isNextSpawnImminent = useMemo(() => nextSpawnsGroup.length > 0 && nextSpawnsGroup[0].delta < 15 * 60 * 1000, [nextSpawnsGroup]);
    const wasImminent = usePrevious(isNextSpawnImminent);

    useEffect(() => {
        if (isSoundEnabled && isNextSpawnImminent && !wasImminent) playNotificationSound();
    }, [isNextSpawnImminent, wasImminent, isSoundEnabled]);

    return (
        <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8 text-slate-200">
            <div className="max-w-7xl mx-auto">
                <header className="relative text-center mb-8">
                    <div className="flex justify-center items-center gap-4">
                       <DragonIcon className="h-12 w-12 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                       <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-tight">MIR4 Boss Timer</h1>
                       <DragonIcon className="h-12 w-12 text-cyan-400 transform -scale-x-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    </div>
                    <p className="mt-2 text-lg text-slate-400">Rastreamento preciso de respawns em tempo real.</p>
                </header>

                <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-lg shadow-xl border border-slate-700/50 rounded-xl p-4 mb-6">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Pesquisar boss, mapa (W), local ou continente..." />
                    <ExtraControls 
                        showFavoritesOnly={showFavoritesOnly} onShowFavoritesOnlyChange={setShowFavoritesOnly}
                        isSoundEnabled={isSoundEnabled} onIsSoundEnabledChange={setIsSoundEnabled}
                        favoritesCount={favoritedBosses.size} hideKilled={hideKilled}
                        onHideKilledChange={handleHideKilledChange} onResetKilled={resetKilledBosses}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mt-4">
                        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                             <FilterControls
                                servers={SERVER_TIMEZONES} selectedServer={selectedServer} onServerChange={setSelectedServer}
                                tiers={['Camada 1', 'Camada 3']} selectedTier={selectedTier} onTierChange={setSelectedTier}
                                maps={availableMaps} bosses={availableBosses} periods={Object.keys(PERIODOS)}
                                selectedMap={selectedMap} selectedBoss={selectedBoss} selectedPeriod={selectedPeriod}
                                onMapChange={setSelectedMap} onBossChange={setSelectedBoss} onPeriodChange={setSelectedPeriod}
                            />
                        </div>
                        <div className="md:col-span-4 lg:col-span-3">
                             <CurrentTime time={currentTime} server={SERVER_TIMEZONES[selectedServer] || SERVER_TIMEZONES['SA']} />
                        </div>
                    </div>
                </div>
                
                <main className="space-y-6">
                    <NextSpawn bosses={nextSpawnsGroup} isImminent={isNextSpawnImminent} />
                    <AdComponent />
                    
                    {filteredAndSortedSpawns.length > 0 ? (
                         <BossTable 
                            bosses={filteredAndSortedSpawns} 
                            favoritedBosses={favoritedBosses} 
                            onToggleFavorite={toggleFavorite}
                            killedBosses={killedBosses} 
                            onToggleKilled={toggleKilled}
                        />
                    ) : (
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center mt-6">
                            <div className="inline-block p-4 rounded-full bg-slate-800 mb-4">
                                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-300">Nenhum spawn encontrado</h3>
                            <p className="text-slate-400 mt-2 max-w-md mx-auto">Tente ajustar seus filtros de mapa, horário ou busque por outro nome.</p>
                        </div>
                    )}
                    
                    <GuidesSection />
                    <SEOContent />
                </main>

                 <footer className="text-center mt-12 pb-8 text-slate-500 text-sm">
                    <VisitorCounter />
                    <p className="max-w-2xl mx-auto mb-2">Status "Morto" reseta semanalmente ou manualmente pelo botão de reset. Horários sincronizados com fuso MIR4.</p>
                    <div className="flex justify-center items-center gap-4">
                        <span>&copy; {new Date().getFullYear()} MIR4 Timer</span>
                        <span className="text-slate-600">|</span>
                        <PrivacyPolicyModal />
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default BossTimerPage;