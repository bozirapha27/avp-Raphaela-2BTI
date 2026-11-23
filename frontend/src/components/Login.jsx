import { useState } from "react";
import { api } from "../api";
import Mensagens from "./Mensagens";

export default function Login({ aoEntrar, avisoInicial = "" }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(avisoInicial);
  const [carregando, setCarregando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const dados = await api("/login", {
        method: "POST",
        body: JSON.stringify({ email, senha })
      });
      aoEntrar(dados);
    } catch (error) {
      setErro(error.status === 401 ? "Email ou senha incorretos." : error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={enviar}>
      <h2>Entrar na conta</h2>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required /></label>
      <Mensagens erro={erro} carregando={carregando} />
      <button className="primary-button" type="submit" disabled={carregando}>Entrar</button>
    </form>
  );
}
