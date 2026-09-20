import React, { useEffect, useRef } from 'react';

// Tipagem para a variável global do AdSense para evitar erros de TypeScript
declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const AdComponent: React.FC = () => {
    const adPushed = useRef(false);

    useEffect(() => {
        // With React 19's StrictMode, effects can run twice. This guard
        // ensures we only push the ad once per component instance to avoid errors.
        if (adPushed.current) {
            return;
        }

        try {
            // Esta chamada notifica o script do AdSense para carregar um anúncio neste slot.
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            adPushed.current = true;
        } catch (e) {
            // Loga qualquer erro que ocorra ao tentar carregar o anúncio.
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <ins className="adsbygoogle block my-6 text-center"
             aria-label="Anúncio"
             // Seu ID de editor foi inserido aqui.
             data-ad-client="ca-pub-3116582090144363"
             // ID do seu bloco de anúncios inserido.
             data-ad-slot="6411152258"
             // Alterado de 'auto' para 'rectangle' para um formato de anúncio mais previsível.
             data-ad-format="rectangle"
             // Desativado para evitar que o anúncio ocupe a largura total em dispositivos móveis.
             data-full-width-responsive="false"></ins>
    );
};

export default AdComponent;