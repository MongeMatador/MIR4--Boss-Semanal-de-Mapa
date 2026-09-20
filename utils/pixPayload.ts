/**
 * Gera um payload PIX "Copia e Cola" (BR Code) válido, seguindo o padrão
 * EMV do Banco Central (Merchant Presented Mode QR Code).
 *
 * Antes só se colocava a chave PIX crua num QR Code — isso obriga quem
 * escaneia a digitar o valor manualmente no app do banco, gerando muita
 * fricção (e provavelmente é a principal razão de baixa conversão em
 * doações). Com um payload EMV real, o app do banco já abre com valor,
 * nome do beneficiário e tudo preenchido — só falta confirmar.
 *
 * Referência do formato: manual BR Code do Banco Central (EMV QRCPS-MPM).
 */

// Monta um campo no formato TLV (Tag-Length-Value) exigido pelo padrão EMV
const tlv = (tag: string, value: string): string => {
  const length = value.length.toString().padStart(2, '0');
  return `${tag}${length}${value}`;
};

// CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF) — exigido no final do payload
const crc16 = (payload: string): string => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

// Normaliza texto para o padrão exigido (sem acentos, maiúsculas, tamanho máximo)
const sanitize = (text: string, maxLength: number): string => {
  const noAccents = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove acentos
  return noAccents.toUpperCase().slice(0, maxLength);
};

export interface PixPayloadOptions {
  /** Chave PIX (UUID, e-mail, telefone ou CPF/CNPJ) */
  pixKey: string;
  /** Nome do beneficiário como registrado no banco — máx. 25 caracteres, sem acento */
  merchantName: string;
  /** Cidade do beneficiário — máx. 15 caracteres, sem acento */
  merchantCity: string;
  /** Valor da doação em reais. Se omitido, o app do banco pede o valor ao usuário. */
  amount?: number;
  /** Identificador curto da transação (aparece no extrato). Opcional. */
  txId?: string;
}

export function buildPixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txId = 'DOACAO',
}: PixPayloadOptions): string {
  const merchantAccountInfo =
    tlv('00', 'br.gov.bcb.pix') + // GUI fixo do PIX
    tlv('01', pixKey);

  let payload =
    tlv('00', '01') + // Payload Format Indicator
    tlv('26', merchantAccountInfo) + // Merchant Account Information (PIX)
    tlv('52', '0000') + // Merchant Category Code (genérico)
    tlv('53', '986') + // Moeda: BRL (ISO 4217)
    (amount ? tlv('54', amount.toFixed(2)) : '') + // Valor (opcional)
    tlv('58', 'BR') + // País
    tlv('59', sanitize(merchantName, 25)) + // Nome do beneficiário
    tlv('60', sanitize(merchantCity, 15)) + // Cidade do beneficiário
    tlv('62', tlv('05', sanitize(txId, 25))); // Additional Data Field (txid)

  // CRC16 é sempre o último campo, e sua "Length" (04) conta no cálculo
  payload += '6304';
  const checksum = crc16(payload);

  return payload + checksum;
}
