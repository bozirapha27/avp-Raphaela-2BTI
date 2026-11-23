export default function ItemTarefa({ tarefa, aoEditar, aoExcluir, aoAlternar }) {
  return (
    <article className={`task-item ${tarefa.concluida ? "completed" : ""}`}>
      <button
        className="check-button"
        type="button"
        onClick={() => aoAlternar(tarefa)}
        aria-label={tarefa.concluida ? "Reabrir tarefa" : "Concluir tarefa"}
      >
        {tarefa.concluida ? "✓" : ""}
      </button>
      <div className="task-content">
        <h3>{tarefa.titulo}</h3>
        {tarefa.descricao && <p>{tarefa.descricao}</p>}
        <span>{tarefa.concluida ? "Concluída" : "Pendente"}</span>
      </div>
      <div className="task-actions">
        <button type="button" onClick={() => aoEditar(tarefa)}>Editar</button>
        <button type="button" className="delete-button" onClick={() => aoExcluir(tarefa.id)}>Excluir</button>
      </div>
    </article>
  );
}
