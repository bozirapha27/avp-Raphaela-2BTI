export default function Mensagens({ mensagem, erro, carregando }) {
  return (
    <>
      {carregando && <p className="feedback loading">Carregando...</p>}
      {erro && <p className="feedback error">{erro}</p>}
      {mensagem && <p className="feedback success">{mensagem}</p>}
    </>
  );
}
