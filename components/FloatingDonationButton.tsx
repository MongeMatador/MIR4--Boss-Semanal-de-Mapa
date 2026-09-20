import React, { useState, useEffect, useRef } from 'react';
import { buildPixPayload } from '../utils/pixPayload';
import { PIX_CONFIG, ALTERNATIVE_SUPPORT_URL } from '../config/pixConfig';

// Declara a variável global QRCode para que o TypeScript a reconheça.
// Esta variável vem da biblioteca importada no index.html.
declare var QRCode: any;

export const FloatingDonationButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(PIX_CONFIG.suggestedAmounts[1] ?? null);
    const qrCodeRef = useRef<HTMLCanvasElement>(null);

    const pixPayload = buildPixPayload({
        pixKey: PIX_CONFIG.pixKey,
        merchantName: PIX_CONFIG.merchantName,
        merchantCity: PIX_CONFIG.merchantCity,
        amount: selectedAmount ?? undefined,
    });

    useEffect(() => {
        // Gera o QR Code (payload EMV completo, não só a chave) sempre que o
        // modal está aberto ou o valor selecionado muda.
        if (isModalOpen && qrCodeRef.current) {
            QRCode.toCanvas(qrCodeRef.current, pixPayload, { width: 220, margin: 1 }, (error: any) => {
                if (error) console.error('Erro ao gerar QR Code:', error);
            });
        }
    }, [isModalOpen, pixPayload]);

    const copyPix = () => {
        navigator.clipboard.writeText(pixPayload).then(() => {
            alert("PIX copiado! Cole no app do seu banco. Obrigado por apoiar 💚");
        }).catch(err => {
            console.error('Falha ao copiar o código PIX: ', err);
        });
    };

    return (
        <>
            <div id="supportBtn" onClick={() => setIsModalOpen(true)}>
                💎 Apoiar
            </div>

            {isModalOpen && (
                <div id="pixModal" style={{ display: 'block' }} onClick={() => setIsModalOpen(false)}>
                    <div className="pix-box" onClick={(e) => e.stopPropagation()}>
                        <h2>⚔️ Apoie o MIR4 Boss Timer</h2>
                        <p>
                            Este site ajuda jogadores a não perderem bosses.<br />
                            Se ele te ajuda, considere apoiar 💚
                        </p>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                            {PIX_CONFIG.suggestedAmounts.map((value) => (
                                <button
                                    key={value}
                                    onClick={() => setSelectedAmount(value)}
                                    style={{
                                        width: 'auto',
                                        padding: '6px 14px',
                                        marginTop: 0,
                                        background: selectedAmount === value ? '#00ff99' : 'transparent',
                                        color: selectedAmount === value ? '#000' : '#00ff99',
                                        border: '1px solid #00ff99',
                                        borderRadius: '20px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                    }}
                                >
                                    R$ {value}
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedAmount(null)}
                                style={{
                                    width: 'auto',
                                    padding: '6px 14px',
                                    marginTop: 0,
                                    background: selectedAmount === null ? '#00ff99' : 'transparent',
                                    color: selectedAmount === null ? '#000' : '#00ff99',
                                    border: '1px solid #00ff99',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                }}
                            >
                                Outro valor
                            </button>
                        </div>

                        {/* O QR Code é gerado a partir do payload PIX completo (EMV), não só
                            da chave — assim o app do banco já abre com o valor preenchido. */}
                        <canvas ref={qrCodeRef} />

                        <textarea id="pixCode" readOnly value={pixPayload}></textarea>

                        <button onClick={copyPix}>📋 Copiar PIX {selectedAmount ? `(R$ ${selectedAmount})` : ''}</button>

                        {ALTERNATIVE_SUPPORT_URL && (
                            <a
                                href={ALTERNATIVE_SUPPORT_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'block', marginTop: '10px', color: '#00ff99', fontSize: '13px', textDecoration: 'underline' }}
                            >
                                Fora do Brasil? Apoie por aqui →
                            </a>
                        )}

                        <span onClick={() => setIsModalOpen(false)}>Fechar</span>
                    </div>
                </div>
            )}
        </>
    );
};
