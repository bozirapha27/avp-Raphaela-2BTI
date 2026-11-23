import prisma from "./prisma.js";

export const tarefaModel = {
  listarPorUsuario(usuarioId) {
    return prisma.tarefa.findMany({
      where: { usuarioId },
      orderBy: { createdAt: "desc" }
    });
  },

  buscarPorIdEUsuario(id, usuarioId) {
    return prisma.tarefa.findFirst({ where: { id, usuarioId } });
  },

  criar(dados) {
    return prisma.tarefa.create({ data: dados });
  },

  atualizar(id, usuarioId, dados) {
    return prisma.tarefa.updateMany({ where: { id, usuarioId }, data: dados });
  },

  excluir(id, usuarioId) {
    return prisma.tarefa.deleteMany({ where: { id, usuarioId } });
  }
};
