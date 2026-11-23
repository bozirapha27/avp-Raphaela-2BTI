export default function FormularioTarefa({ titulo, descricao, aoTitulo, aoDescricao, aoEnviar, aoCancelar, editando, carregando }) {
  return (
    <form className="task-form" onSubmit={aoEnviar}>
      <h2>{editando ? "Editar tarefa" : "Nova tarefa"}</h2>
      <label>Título<input value={titulo} onChange={(e) => aoTitulo(e.target.value)} required maxLength={100} /></label>
      <label>Descrição<textarea value={descricao} onChange={(e) => aoDescricao(e.target.value)} rows={3} /></label>
      <div className="form-actions">
        {editando && <button type="button" className="secondary-button" onClick={aoCancelar}>Cancelar</button>}
        <button type="submit" className="primary-button" disabled={carregando}>
          {editando ? "Salvar alterações" : "Adicionar tarefa"}
        </button>
      </div>
    </form>
  );
}
