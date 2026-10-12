import React from 'react';
import { Link } from 'react-router-dom';

// Preencha com o e-mail público de contato. Enquanto estiver vazio, a página
// "Sobre" não mostra a linha de e-mail.
const CONTACT_EMAIL = '';

const Shell: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <main className="max-w-3xl mx-auto px-4 py-8 text-slate-300 text-sm space-y-4">
    <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
    {children}
    <p className="pt-4">
      <Link to="/" className="text-cyan-400 hover:text-cyan-300 underline">
        ← Voltar ao Boss Timer
      </Link>
    </p>
  </main>
);

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-bold text-slate-100 pt-2">{children}</h2>
);

export const PrivacyPage: React.FC = () => (
  <Shell title="Política de Privacidade">
    <p>
      <strong>Última atualização: 12 de outubro de 2026</strong>
    </p>

    <H>1. Introdução</H>
    <p>
      O MIR4 Boss Respawn Timer valoriza sua privacidade. Esta política descreve como coletamos e usamos
      informações.
    </p>

    <H>2. Cookies e Web Beacons</H>
    <p>
      Utilizamos cookies para armazenar informações, como suas preferências pessoais ao visitar nosso site
      (ex: servidor selecionado, favoritos).
    </p>

    <H>3. Google AdSense e Cookie DoubleClick</H>
    <p>
      O Google, como fornecedor de terceiros, utiliza cookies para exibir anúncios no nosso site. Com o cookie
      DART, o Google pode exibir anúncios com base nas visitas que o leitor fez a este e a outros sites na
      Internet. Os usuários podem desativar o cookie DART visitando a Política de privacidade da rede de
      conteúdo e dos anúncios do Google.
    </p>

    <H>4. Google Analytics</H>
    <p>
      Usamos o Google Analytics para medir o número de visitantes e as páginas mais acessadas, de forma
      agregada, para melhorar o site.
    </p>

    <H>5. Armazenamento Local (LocalStorage)</H>
    <p>
      Esta aplicação armazena dados no seu dispositivo (navegador) para funcionalidade, como: bosses
      favoritos, bosses marcados como mortos e seleção de servidor. Esses dados ficam no seu navegador.
    </p>

    <H>6. Logs</H>
    <p>
      Como outros sites, coletamos informação contida nos registros: endereço IP, provedor de internet,
      navegador utilizado, horário da visita e páginas visitadas dentro do site.
    </p>

    <H>7. Contato</H>
    <p>
      Dúvidas sobre esta política podem ser enviadas pela página <Link to="/sobre" className="text-cyan-400 underline">Sobre</Link>.
    </p>
  </Shell>
);

export const AboutPage: React.FC = () => (
  <Shell title="Sobre o MIR4 Boss Timer">
    <p>
      O MIR4 Boss Timer é uma ferramenta gratuita e feita por um jogador para a comunidade de MIR4. Ela mostra
      em tempo real o respawn dos bosses de campo por servidor, e reúne também marketplace de NFTs, consulta de
      jogadores, transferências de servidor, guerra de clãs, expedição, rankings e mercado de itens.
    </p>
    <p>
      Os dados de marketplace e rankings vêm de fontes públicas do jogo e podem ter atraso ou diferenças em
      relação ao que você vê dentro do MIR4. Este site não é afiliado à Draco Studios, à Wemade ou ao jogo MIR4.
    </p>
    <H>Contato</H>
    {CONTACT_EMAIL ? (
      <p>
        Sugestões, correções e parcerias:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
          {CONTACT_EMAIL}
        </a>
      </p>
    ) : (
      <p>Sugestões e correções são bem-vindas pelas redes e grupos da comunidade onde o site é divulgado.</p>
    )}
    <p>
      Veja também a <Link to="/privacidade" className="text-cyan-400 underline">Política de Privacidade</Link>.
    </p>
  </Shell>
);
