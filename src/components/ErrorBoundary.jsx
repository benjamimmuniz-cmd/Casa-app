import React from "react";

// Rede de segurança pra qualquer erro de renderização não tratado — sem isso,
// um erro em qualquer tela derrubava o app inteiro pra uma página em branco,
// sem nenhuma explicação nem jeito de voltar.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("APP_CRASH_ERR", error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="w-full min-h-[100svh] flex items-center justify-center px-6" style={{ background: "#0E1120" }}>
        <div className="w-full max-w-[340px] rounded-3xl p-6 text-center" style={{ background: "#F2F2F2" }}>
          <p style={{ fontFamily: "Fraunces", fontWeight: 600, color: "#000000" }} className="text-[18px] mb-2">Algo deu errado</p>
          <p style={{ fontFamily: "Inter", color: "#707070" }} className="text-[12.5px] leading-relaxed mb-5">
            Encontramos um problema inesperado. Recarregue o app pra tentar de novo — se continuar acontecendo, avise a liderança da igreja.
          </p>
          <button onClick={() => window.location.reload()}
            className="w-full py-3.5 rounded-full font-semibold text-[14px]"
            style={{ background: "#000000", color: "#FFFFFF", fontFamily: "Inter" }}>
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
