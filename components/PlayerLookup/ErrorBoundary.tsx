import React from 'react';

interface Props {
  children: React.ReactNode;
  label: string;
}

interface State {
  hasError: boolean;
}

// Sem isso, um formato de JSON inesperado vindo do mir4tracker (campo que
// virou objeto em vez de array, por exemplo) derruba a árvore inteira do
// React até o componente pai mais próximo — no caso do modal, isso fazia as
// PRÓPRIAS ABAS somem, porque o React desmonta tudo acima do erro por não
// haver um Error Boundary. Isolando cada aba aqui, um erro em "Progressão"
// não derruba mais "Histórico"/"Equipamento" nem as abas em si.
export class TabErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error(`[${this.props.label}] erro ao renderizar:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-amber-400 text-sm text-center py-8">
          Não foi possível exibir "{this.props.label}" — o formato retornado pela fonte mudou
          ou veio incompleto. As outras abas continuam funcionando normalmente.
        </div>
      );
    }
    return this.props.children;
  }
}
