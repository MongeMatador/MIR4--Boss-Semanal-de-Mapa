
import React, { useState } from 'react';
import { ChevronDownIcon } from './ChevronDownIcon';

const guides = [
    {
        title: "Maximizando a Caça aos Chefes",
        content: `
            <p>A caça aos chefes é uma das atividades mais lucrativas em MIR4, mas requer mais do que apenas poder. A organização é fundamental. Use este timer para antecipar os spawns e chegue ao local pelo menos 5 minutos antes. Isso garante que seu grupo possa limpar a área de outros jogadores e se posicionar estrategicamente.</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Comunicação:</strong> Use o botão "Copiar Info" para compartilhar os próximos spawns no Discord do seu clã.</li>
                <li><strong>Posicionamento:</strong> Classes de longo alcance devem ficar em terreno elevado, enquanto os tanques atraem o chefe para longe de rotas de fuga.</li>
                <li><strong>Poções e Buffs:</strong> Sempre use poções de ataque, defesa e buffs de clã antes do chefe nascer para maximizar seu dano.</li>
            </ul>
        `
    },
    {
        title: "Entendendo os Fusos Horários do Servidor",
        content: `
            <p>MIR4 opera em múltiplos servidores, cada um com seu próprio fuso horário (UTC). Isso pode ser confuso, especialmente se você joga com amigos de diferentes regiões. Nossa ferramenta resolve esse problema.</p>
            <p class="mt-2">Ao selecionar seu servidor no menu "Servidor / Fuso", todos os horários de respawn e o relógio principal são automaticamente convertidos para a hora local daquele servidor. Isso elimina qualquer necessidade de cálculo manual, garantindo que você esteja sempre sincronizado e nunca perca um spawn importante.</p>
        `
    },
    {
        title: "Guia das 8 Classes do MIR4",
        content: `
            <p>MIR4 tem hoje <strong>8 classes</strong> jogáveis — a mais recente, Spirit Summoner, chegou em 18/08/2026 nas comemorações de 5 anos do jogo. Cada uma tem um papel diferente em grupo:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Warrior:</strong> guerreiro corpo a corpo equilibrado, boa entrada em combate e resistência.</li>
                <li><strong>Sorcerer:</strong> conjurador de dano mágico à distância, forte em área.</li>
                <li><strong>Taoist:</strong> suporte/cura à distância, essencial pra manter o grupo vivo em conteúdo longo.</li>
                <li><strong>Lancer:</strong> combate corpo a corpo veloz, boa mobilidade e dano sustentado.</li>
                <li><strong>Arbalist:</strong> atirador à distância (besta), alterna entre perseguição e fuga com dano constante.</li>
                <li><strong>Darkist:</strong> conjuradora à distância especializada em veneno e maldições, forte em PvP.</li>
                <li><strong>Lionheart:</strong> lutador corpo a corpo com manoplas, dano de investida, pode curar aliados ou debuffar inimigos.</li>
                <li><strong>Spirit Summoner:</strong> a mais nova — invoca espíritos de todos os elementos, funciona como "buffer/dealer", fortalecendo aliados e enfraquecendo inimigos ao mesmo tempo.</li>
            </ul>
            <p class="mt-3 text-sm text-slate-400">Não publicamos uma "tier list" fixa aqui — o equilíbrio entre classes muda a cada atualização do jogo, e o que funciona bem depende do seu equipamento, build de treino e se o foco é PvE ou PvP. Use o <a href="/marketplace" class="text-cyan-400 underline">marketplace</a> pra comparar power score e stats reais de personagens de cada classe à venda.</p>
        `
    }
];

const AccordionItem: React.FC<{ title: string; content: string; isOpen: boolean; onClick: () => void; }> = ({ title, content, isOpen, onClick }) => {
    return (
        <div className="border-b border-slate-700">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-4 px-2 focus:outline-none"
            >
                <h3 className="text-lg font-semibold text-slate-200 group-hover:text-cyan-400">{title}</h3>
                <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            <div
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{ maxHeight: isOpen ? '1000px' : '0px' }}
            >
                <div className="prose prose-invert max-w-none text-slate-300 p-4" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </div>
    );
};

export const GuidesSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="mt-12 bg-slate-800/50 rounded-xl border border-slate-700 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                Guias e Dicas
            </h2>
            <div className="space-y-2">
                {guides.map((guide, index) => (
                    <AccordionItem
                        key={index}
                        title={guide.title}
                        content={guide.content}
                        isOpen={openIndex === index}
                        onClick={() => handleToggle(index)}
                    />
                ))}
            </div>
        </section>
    );
};
