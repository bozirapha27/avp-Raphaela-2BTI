import { useEffect, useState } from "react";
import { api } from "../api";
import FormularioTarefa from "./FormularioTarefa";
import ListaTarefas from "./ListaTarefas";
import Mensagens from "./Mensagens";

export default function Dashboard({ usuario, aoSair }) {
  const [tarefas, setTarefas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editando, setEditando] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function carregar() {
    setErro("");
    setCarregando(true);
    try {
      setTarefas(await api("/tarefas"));
    } catch (error) {
      if (error.status === 401) {
        aoSair("Sua sessão expirou. Entre novamente.");
      } else {
        setErro(error.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  function limparFormulario() {
    setTitulo("");
    setDescricao("");
    setEditando(null);
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");
    if (!titulo.trim()) {
      setErro("Informe o título da tarefa.");
      return;
    }

    setCarregando(true);
    try {
      if (editando) {
        const dados = await api(`/tarefas/${editando.id}`, {
          method: "PUT",
          body: JSON.stringify({ titulo, descricao, concluida: editando.concluida })
        });
        setMensagem(dados.mensagem);
      } else {
        const dados = await api("/tarefas", {
          method: "POST",
          body: JSON.stringify({ titulo, descricao, concluida: false })
        });
        setMensagem(dados.mensagem);
      }
      limparFormulario();
      await carregar();
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  function editar(tarefa) {
    setEditando(tarefa);
    setTitulo(tarefa.titulo);
    setDescricao(tarefa.descricao || "");
    setMensagem("");
    setErro("");
  }

  async function excluir(id) {
    if (!window.confirm("Deseja excluir esta tarefa?")) return;
    setErro("");
    setMensagem("");
    try {
      const dados = await api(`/tarefas/${id}`, { method: "DELETE" });
      setMensagem(dados.mensagem);
      await carregar();
    } catch (error) {
      setErro(error.message);
    }
  }

  async function alternar(tarefa) {
    setErro("");
    setMensagem("");
    try {
      const dados = await api(`/tarefas/${tarefa.id}`, {
        method: "PATCH",
        body: JSON.stringify({ concluida: !tarefa.concluida })
      });
      setMensagem(dados.mensagem);
      await carregar();
    } catch (error) {
      setErro(error.message);
    }
  }

  const pendentes = tarefas.filter((tarefa) => !tarefa.concluida).length;
  const concluidas = tarefas.length - pendentes;

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand compact">
          <span className="brand-mark">✓</span>
          <h1>Minhas Tarefas</h1>
        </div>
        <div className="user-area">
          <span>{usuario.nome}</span>
          <button type="button" className="logout-button" onClick={aoSair}>Sair</button>
        </div>
      </header>

      <section className="summary">
        <div><strong>{pendentes}</strong><span>Pendentes</span></div>
        <div><strong>{concluidas}</strong><span>Concluídas</span></div>
        <div><strong>{tarefas.length}</strong><span>Total</span></div>
      </section>

      <Mensagens mensagem={mensagem} erro={erro} carregando={carregando} />

      <section className="dashboard-grid">
        <div className="tasks-panel">
          <h2>Lista de tarefas</h2>
          <ListaTarefas tarefas={tarefas} aoEditar={editar} aoExcluir={excluir} aoAlternar={alternar} />
        </div>
        <aside className="form-panel">
          <FormularioTarefa
            titulo={titulo}
            descricao={descricao}
            aoTitulo={setTitulo}
            aoDescricao={setDescricao}
            aoEnviar={enviar}
            aoCancelar={limparFormulario}
            editando={editando}
            carregando={carregando}
          />
        </aside>
      </section>
    </main>
  );
}
