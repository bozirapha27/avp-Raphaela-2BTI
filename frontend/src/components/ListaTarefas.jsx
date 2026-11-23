import ItemTarefa from "./ItemTarefa";

export default function ListaTarefas({ tarefas, aoEditar, aoExcluir, aoAlternar }) {
  if (tarefas.length === 0) {
    return (
      <div className="empty-state">
        <strong>Nenhuma tarefa cadastrada</strong>
        <p>Use o formulário ao lado para criar a primeira tarefa.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tarefas.map((tarefa) => (
        <ItemTarefa
          key={tarefa.id}
          tarefa={tarefa}
          aoEditar={aoEditar}
          aoExcluir={aoExcluir}
          aoAlternar={aoAlternar}
        />
      ))}
    </div>
  );
}
