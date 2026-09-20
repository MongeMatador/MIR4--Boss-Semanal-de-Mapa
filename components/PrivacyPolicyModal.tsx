
import React, { useState } from 'react';

export const PrivacyPolicyModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="text-slate-500 hover:text-slate-300 text-xs underline transition-colors"
            >
                Política de Privacidade
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl relative">
                        <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-100">Política de Privacidade</h2>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 text-slate-300 text-sm space-y-4">
                            <p><strong>Última atualização: {new Date().toLocaleDateString()}</strong></p>
                            
                            <h3 className="text-lg font-bold text-slate-100">1. Introdução</h3>
                            <p>O MIR4 Boss Respawn Timer valoriza sua privacidade. Esta política descreve como coletamos e usamos informações.</p>

                            <h3 className="text-lg font-bold text-slate-100">2. Cookies e Web Beacons</h3>
                            <p>Utilizamos cookies para armazenar informações, como suas preferências pessoais ao visitar nosso site (ex: servidor selecionado, favoritos). Isso pode incluir um simples popup, ou uma ligação em vários serviços que providenciamos, tais como fóruns.</p>
                            
                            <h3 className="text-lg font-bold text-slate-100">3. Google AdSense e Cookie DoubleClick</h3>
                            <p>O Google, como fornecedor de terceiros, utiliza cookies para exibir anúncios no nosso site. Com o cookie DART, o Google pode exibir anúncios com base nas visitas que o leitor fez a este e a outros sites na Internet. Os usuários podem desativar o cookie DART visitando a Política de privacidade da rede de conteúdo e dos anúncios do Google.</p>

                            <h3 className="text-lg font-bold text-slate-100">4. Armazenamento Local (LocalStorage)</h3>
                            <p>Esta aplicação armazena dados estritamente no seu dispositivo (navegador) para funcionalidade, como: bosses favoritos, bosses marcados como mortos e seleção de servidor. Nenhum dado pessoal é enviado para nossos servidores.</p>

                            <h3 className="text-lg font-bold text-slate-100">5. Logs</h3>
                            <p>Tal como outros websites, coletamos e utilizamos informação contida nos registos. A informação contida nos registos inclui, o seu endereço IP (Internet Protocol), o seu ISP (Internet Service Provider), o browser que utilizou ao visitar o nosso website (como o Chrome ou Firefox), o tempo da sua visita e que páginas visitou dentro do nosso website.</p>
                        </div>
                        <div className="p-4 border-t border-slate-700 text-right bg-slate-900 sticky bottom-0">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
