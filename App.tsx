import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import BossTimerPage from './components/BossTimerPage';
import MarketplacePage from './components/Marketplace/MarketplacePage';
import ConsultaPage from './components/PlayerLookup/ConsultaPage';
import TransfersPage from './components/Transfers/TransfersPage';
import WarPage from './components/War/WarPage';
import ClanExpeditionPage from './components/ClanExpedition/ClanExpeditionPage';
import GlobalRankingsPage from './components/GlobalRankings/GlobalRankingsPage';
import ClanRankingsPage from './components/ClanRankings/ClanRankingsPage';
import ItemMarketPage from './components/ItemMarket/ItemMarketPage';
import { RouteMeta } from './components/RouteMeta';
import { PrivacyPage, AboutPage } from './components/StaticPages';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Layout>
                <RouteMeta />
                <Routes>
                    <Route path="/" element={<BossTimerPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/consulta" element={<ConsultaPage />} />
                    <Route path="/transferencias" element={<TransfersPage />} />
                    <Route path="/guerra" element={<WarPage />} />
                    <Route path="/expedicao" element={<ClanExpeditionPage />} />
                    <Route path="/rankings" element={<GlobalRankingsPage />} />
                    <Route path="/clan-rankings" element={<ClanRankingsPage />} />
                    <Route path="/item-market" element={<ItemMarketPage />} />
                    <Route path="/privacidade" element={<PrivacyPage />} />
                    <Route path="/sobre" element={<AboutPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
};

export default App;
