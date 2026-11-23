import prisma from "./prisma.js";

export const usuarioModel = {
  buscarPorEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  buscarPorId(id) {
    return prisma.usuario.findUnique({ where: { id } });
  },

  criar(dados) {
    return prisma.usuario.create({ data: dados });
  }
};
