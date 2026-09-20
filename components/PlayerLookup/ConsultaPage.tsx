import React, { useCallback, useState } from 'react';
import { PlayerProfile } from '../../types/history';
import { PlayerHistoryPanel } from './PlayerHistoryPanel';
import { PlayerProgressionPanel } from './PlayerProgressionPanel';
import { ServerTransfersPanel } from './ServerTransfersPanel';
import { TabErrorBoundary } from './ErrorBoundary';
import { useNameAutocomplete } from '../../hooks/useNameAutocomplete';

// Página de consulta avulsa: busca QUALQUER personagem por nome, sem
// precisar que ele esteja listado no Marketplace. Cobre o pedido original
// do usuário — "consultar histórico de qualquer personagem, só com o nome".
//
// Progressão (Códex/Antiguidade/Constituição/Dragão/Recursos) depende de um
// transportID, que o endpoint /api/player/{nome} não devolve diretamente.
// Quando o personagem já foi listado como NFT ao menos uma vez, o `seq` do
// evento mais recente em nftHistoryDtos permite resolver o transportID via
// o proxy oficial da XDRACO (webapi.mir4global.com/nft/character/summary).
// Se o personagem nunca foi um NFT, não há transportID conhecido — nesse
// caso mostramos só o Histórico, com uma explicação clara do motivo.
export const ConsultaPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchedName, setSearchedName] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState<PlayerProfile | null>(null);
  const [transportID, setTransportID] = useState<number | null>(null);
  const [resolvingTransportID, setResolvingTransportID] = useState(false);
  const [transportIDUnavailable, setTransportIDUnavailable] = useState(false);

  const { suggestions } = useNameAutocomplete(showSuggestions ? inputValue : '');

  const runSearch = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSearchedName(trimmed);
    setInputValue(trimmed);
    setShowSuggestions(false);
    setTransportID(null);
    setTransportIDUnavailable(false);
    setLoadedProfile(null);
  }, []);

  const handleProfileLoaded = useCallback((profile: PlayerProfile | null) => {
    setLoadedProfile(profile);
    setTransportID(null);
    setTransportIDUnavailable(false);

    if (!profile || !profile.nftHistory || profile.nftHistory.length === 0) {
      setTransportIDUnavailable(true);
      return;
    }

    const mostRecent = [...profile.nftHistory].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!mostRecent?.seq) {
      setTransportIDUnavailable(true);
      return;
    }

    setResolvingTransportID(true);
    fetch(`/.netlify/functions/xdraco-character?type=summary&seq=${mostRecent.seq}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const resolved = json?.data?.character?.transportID;
        if (typeof resolved === 'number') {
          setTransportID(resolved);
        } else {
          setTransportIDUnavailable(true);
        }
      })
      .catch(() => setTransportIDUnavailable(true))
      .finally(() => setResolvingTransportID(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(inputValue);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Consulta de personagem</h1>
      <p className="text-slate-400 text-sm mb-1">
        Busque o histórico público (Power Score, nível, nomes, clã/servidor, preço de NFT) de qualquer
        personagem MIR4 pelo nome — sem precisar que ele esteja no Marketplace.
      </p>
      <form onSubmit={handleSubmit} className="relative flex gap-2 mb-8">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Nome do personagem (ex.: SouUmMonge)"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    // onMouseDown em vez de onClick — dispara antes do onBlur do input fechar a lista
                    onMouseDown={() => runSearch(s)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          Buscar
        </button>
      </form>

      {searchedName && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-700">
              <h2 className="text-lg font-bold text-slate-100">{searchedName}</h2>
            </div>

            <div className="p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Histórico</h3>
              <TabErrorBoundary label="Histórico" key={`hist-${searchedName}`}>
                <PlayerHistoryPanel characterName={searchedName} onProfileLoaded={handleProfileLoaded} hideSourceNote />
              </TabErrorBoundary>
            </div>

            <div className="p-5 border-t border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Progressão</h3>
              {resolvingTransportID && (
                <p className="text-slate-400 text-sm">Localizando dados de progressão...</p>
              )}
              {!resolvingTransportID && transportID !== null && (
                <TabErrorBoundary label="Progressão" key={`prog-${transportID}`}>
                  <PlayerProgressionPanel transportID={transportID} />
                </TabErrorBoundary>
              )}
              {!resolvingTransportID && transportID === null && transportIDUnavailable && (
                <p className="text-slate-500 text-sm italic">
                  Este personagem nunca foi listado como NFT no XDRACO (ou o histórico de NFT não retornou um
                  identificador válido), então não há um transportID público conhecido para buscar Códex/Antiguidade/
                  Constituição/Artefato de Dragão. Isso só é possível para personagens que já passaram pelo mercado NFT
                  pelo menos uma vez.
                </p>
              )}
            </div>
          </div>

          {loadedProfile?.worldgroupName && loadedProfile?.worldName && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Transferências diárias — {loadedProfile.worldgroupName}/{loadedProfile.worldName}
                </h3>
                <p className="text-slate-500 text-xs mt-1">Veja as transferências de jogadores de entrada e saída no servidor deste personagem.</p>
              </div>
              <div className="p-5">
                <TabErrorBoundary label="Transferências" key={`transf-${loadedProfile.worldgroupName}-${loadedProfile.worldName}`}>
                  <ServerTransfersPanel worldgroup={loadedProfile.worldgroupName} world={loadedProfile.worldName} />
                </TabErrorBoundary>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultaPage;
