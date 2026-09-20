/**
 * ⚠️ PREENCHA COM SEUS DADOS ANTES DE PUBLICAR ⚠️
 *
 * merchantName e merchantCity precisam ser EXATAMENTE como aparecem no seu
 * cadastro PIX no banco (sem acento, maiúsculas — o código já normaliza,
 * mas o conteúdo precisa ser real e bater com sua conta, senão alguns
 * apps de banco recusam o QR Code por segurança).
 *
 * Limites do padrão EMV: nome até 25 caracteres, cidade até 15 caracteres.
 */
export const PIX_CONFIG = {
  pixKey: '25a5e572-2ea1-469f-9e72-52a113132e21',
  merchantName: 'DAVID DA SILVA RIBEIRO', // confirmado via QR real do C6 Bank
  merchantCity: 'SAO PAULO', // confirmado via QR real do C6 Bank (cidade que o banco registrou, mesmo não sendo a cidade pessoal do usuário — é assim que o C6 gera)

  // Valores sugeridos que aparecem como botões de atalho no modal de doação.
  suggestedAmounts: [5, 10, 20, 50],
};

/**
 * Link opcional pra uma plataforma de apoio internacional (Ko-fi, Buy Me a
 * Coffee, Livepix, Apoia.se, etc). Deixe null pra não mostrar esse botão.
 * Isso ajuda a captar apoio de fora do Brasil, onde PIX não funciona.
 */
export const ALTERNATIVE_SUPPORT_URL: string | null = null; // TODO: ex. 'https://ko-fi.com/seunome'
