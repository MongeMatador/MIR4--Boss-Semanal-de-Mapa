
import React, { useState } from 'react';

const SEOContent: React.FC = () => {
    const [expanded, setExpanded] = useState(false);

    return (
        <section className="mt-16 bg-slate-800/50 rounded-xl border border-slate-700 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-slate-700 pb-2">
                Guia Completo de Bosses e Respawns no MIR4
            </h2>

            <article className="prose prose-invert max-w-none text-slate-300 space-y-4">
                <p>
                    Bem-vindo ao <strong>MIR4 Boss Respawn Timer</strong>, a ferramenta definitiva para jogadores sérios de MIR4.
                    Nossa ferramenta oferece monitoramento em tempo real dos horários de nascimento (respawn) dos principais chefes de campo
                    do jogo, ajudando seu clã a dominar os servidores.
                </p>

                <h3 className="text-xl font-semibold text-emerald-400 mt-6">Por que monitorar os Bosses no MIR4?</h3>
                <p>
                    No MMORPG MIR4, os chefes de campo (Field Bosses) são a principal fonte de recursos valiosos, incluindo
                    <strong>Baús de Aço Negro (Darksteel Boxes)</strong>, Pedras de Aprimoramento, Skill Tomes raros e materiais de criação.
                    Derrotar esses chefes não é apenas uma questão de força, mas de <strong>pontualidade</strong>.
                </p>

                <div className={`transition-all duration-500 overflow-hidden ${expanded ? 'max-h-[2000px]' : 'max-h-0'}`}>
                    <h3 className="text-xl font-semibold text-emerald-400 mt-6">Como usar o Timer</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Selecione seu Servidor:</strong> No topo da página, escolha entre SA (South America), NA (North America), etc. Isso ajusta o fuso horário automaticamente.</li>
                        <li><strong>Filtragem Inteligente:</strong> Use a barra de pesquisa para encontrar chefes específicos como "Bicheon" ou filtre por mapa (ex: W3, W6).</li>
                        <li><strong>Gerenciamento de Abates:</strong> Marque bosses como "Mortos" clicando no ícone de caveira para removê-los da lista visual e focar nos próximos objetivos.</li>
                        <li><strong>Contagem Regressiva:</strong> A coluna "Respawn" mostra exatamente quanto tempo falta para o próximo nascimento do chefe.</li>
                    </ul>
                    
                    <h3 className="text-xl font-semibold text-emerald-400 mt-6">Dicas de Estratégia para Clãs</h3>
                    <p>
                        A caça aos chefes é uma atividade de clã. Use a funcionalidade de "Copiar Info" desta ferramenta para colar a lista de próximos spawns diretamente no Discord do seu clã.
                        Coordenem-se para chegar ao local do boss pelo menos <strong>5 minutos antes</strong> do horário marcado, garantindo o posicionamento e a vitória.
                    </p>
                    <p>
                        Lembre-se: O tempo de respawn é fixo, mas a janela de oportunidade é curta. Mantenha esta página aberta em um segundo monitor
                        para nunca perder um baú.
                    </p>
                </div>
                
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="mt-4 text-cyan-400 hover:text-cyan-300 font-bold underline decoration-dotted underline-offset-4 focus:outline-none"
                >
                    {expanded ? 'Ler menos' : 'Ler mais sobre mecânicas de jogo...'}
                </button>
            </article>
        </section>
    );
};

export default SEOContent;
