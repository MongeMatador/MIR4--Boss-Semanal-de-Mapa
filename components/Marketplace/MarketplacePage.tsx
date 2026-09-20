import React, { useState, useEffect } from 'react';
import { CharacterCard } from './CharacterCard';
import { FilterBar } from './FilterBar';
import { CharacterDetailModal } from './CharacterDetailModal';
import { useMarketplaceListings, DEFAULT_FILTERS } from '../../hooks/useMarketplaceListings';
import { MarketplaceCharacter } from '../../types/marketplace';
import AdComponent from '../AdComponent';

const MarketplacePage: React.FC = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { characters, isLoading, error, hasMore, totalCount, loadMore } = useMarketplaceListings(filters);
  const [selectedCharacter, setSelectedCharacter] = useState<MarketplaceCharacter | null>(null);

  useEffect(() => {
    document.title = 'Marketplace de NFTs MIR4 — Preços e Personagens à Venda | MIR4 Boss Timer';
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <header className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Marketplace de NFTs MIR4
        </h1>
        <p className="mt-2 text-slate-400 max-w-2xl mx-auto">
          Preços em tempo real dos personagens à venda no marketplace XDRACO, com
          equipamento e inventário completos — incluindo as imagens de cada item.
        </p>
        {/* totalCount (rodada 8): confirmado ao vivo que a API oficial devolve
            totalCount=0 pras abas "Vendidos recentemente"/"Maiores vendas",
            mesmo trazendo personagens reais — não é bug nosso, é assim que a
            API responde pra esses dois listTypes. Mostrar "0 personagens
            listados" nesse caso seria enganoso, então usamos uma frase
            diferente baseada na aba ativa em vez do totalCount da API. */}
        {filters.listType === 'sale' && totalCount !== null && (
          <p className="mt-1 text-sm text-slate-500">{totalCount.toLocaleString('pt-BR')} personagens à venda agora</p>
        )}
        {filters.listType !== 'sale' && !isLoading && (
          <p className="mt-1 text-sm text-slate-500">
            {characters.length > 0
              ? `Mostrando ${characters.length} vendas ${filters.listType === 'recent' ? 'mais recentes' : 'de maior valor'}`
              : 'Nenhuma venda encontrada com esses filtros'}
          </p>
        )}
      </header>

      <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-lg shadow-xl border border-slate-700/50 rounded-xl p-4 mb-6">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <AdComponent />

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-xl p-4 text-center mb-6">
          {error}
        </div>
      )}

      {/* Indicador de carregamento (rodada 8): antes só aparecia dentro do
          botão "Carregar mais" — ao trocar de aba (À venda/Vendidos
          recentemente/Maiores vendas) ou de filtro, a busca também dispara
          `isLoading`, mas sem nenhum indicador visível na primeira carga da
          aba, o grid antigo ficava exposto até a resposta chegar e podia dar
          a impressão de que nada mudou. */}
      {isLoading && characters.length === 0 && (
        <div className="text-center py-12 text-slate-400">Carregando...</div>
      )}

      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 transition-opacity ${isLoading ? 'opacity-50' : ''}`}>
        {characters.map((character) => (
          <CharacterCard
            key={character.nftID}
            character={character}
            onClick={() => setSelectedCharacter(character)}
          />
        ))}
      </div>

      {characters.length === 0 && !isLoading && !error && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
          <h3 className="text-xl font-bold text-slate-300">Nenhum personagem encontrado</h3>
          <p className="text-slate-400 mt-2">Tente ajustar os filtros de classe, level ou preço.</p>
        </div>
      )}

      <div className="flex justify-center pb-12">
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="bg-slate-800 border border-slate-600 hover:border-cyan-500 text-slate-200 font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Carregando...' : 'Carregar mais'}
          </button>
        )}
      </div>

      {selectedCharacter && (
        // key força remontagem completa ao trocar de personagem — evita que
        // estado interno (ex.: um Error Boundary já "estourado") vaze de um
        // personagem pro outro.
        <CharacterDetailModal
          key={selectedCharacter.nftID}
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
        />
      )}
    </div>
  );
};

export default MarketplacePage;
