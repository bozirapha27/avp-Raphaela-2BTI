import { useEffect, useState } from "react";
import Login from "./components/Login";
import Cadastro from "./components/Cadastro";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [tela, setTela] = useState("login");
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("usuario");
    return salvo ? JSON.parse(salvo) : null;
  });
  const [avisoSessao, setAvisoSessao] = useState("");

  useEffect(() => {
    if (!usuario) {
      setTela("login");
    }
  }, [usuario]);

  function entrar(dados) {
    localStorage.setItem("token", dados.token);
    localStorage.setItem("usuario", JSON.stringify(dados.usuario));
    setUsuario(dados.usuario);
  }

  function sair(mensagem = "") {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setAvisoSessao(mensagem);
    setUsuario(null);
  }

  if (usuario) {
    return <Dashboard usuario={usuario} aoSair={sair} />;
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand">
          <span className="brand-mark">✓</span>
          <div>
            <p className="eyebrow">Organize o seu dia</p>
            <h1>Minhas Tarefas</h1>
          </div>
        </div>
        {tela === "login" ? (
          <Login aoEntrar={entrar} avisoInicial={avisoSessao} />
        ) : (
          <Cadastro aoCadastrar={() => setTela("login")} />
        )}
        <button className="link-button" onClick={() => setTela(tela === "login" ? "cadastro" : "login")}>
          {tela === "login" ? "Não tem conta? Criar cadastro" : "Já tem conta? Fazer login"}
        </button>
      </section>
    </main>
  );
}
