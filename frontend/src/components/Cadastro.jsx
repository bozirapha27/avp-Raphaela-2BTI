import { useState } from "react";
import { api } from "../api";
import Mensagens from "./Mensagens";

export default function Cadastro({ aoCadastrar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");
    setCarregando(true);
    try {
      const dados = await api("/usuarios", {
        method: "POST",
        body: JSON.stringify({ nome, email, senha })
      });
      setMensagem(dados.mensagem);
      setNome("");
      setEmail("");
      setSenha("");
      setTimeout(aoCadastrar, 700);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={enviar}>
      <h2>Criar conta</h2>
      <label>Nome<input value={nome} onChange={(e) => setNome(e.target.value)} required /></label>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} /></label>
      <Mensagens mensagem={mensagem} erro={erro} carregando={carregando} />
      <button className="primary-button" type="submit" disabled={carregando}>Cadastrar</button>
    </form>
  );
}
