import prisma from "../config/database.js";
import { hashPassword } from "../utils/bcrypt.js";
import bcrypt from "bcrypt";


export const listAll = async (req, res, next) => {
  try {
    const whereClause = {
      veiculo: {
        manutencoes: {
          some: {
            status: {
              in: ["aprovado", "concluido"],
            },
          },
        },
      },
    };

    if (req.payload && req.payload.funcao === 'supervisor') {
      whereClause.veiculo = {
        ...whereClause.veiculo,
        supervisorId: req.payload.id,
      };
    }

    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;

    const totalItems = await prisma.inoperante.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    const order = req.query._order?.toLowerCase() === "desc" ? "desc" : "asc";
    const sort = req.query._sort;
    const validSortFields = ["id", "veiculoId", "oficinaId", "responsavelId"];
    const orderBy = validSortFields.includes(sort) ? { [sort]: order } : undefined;

    const inoperantes = await prisma.inoperante.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      ...(orderBy && { orderBy }),
      include: {
        veiculo: {
          select: {
            placa: true,
            marca: true,
            modelo: true,
            anoModelo: true,
            cor: true,
            empresa: true,
            departamento: true,
            supervisor: {
              select: {
                nome: true,
                email: true,
              },
            },
            manutencoes: {
              where: {
                status: {
                  in: ["aprovado", "concluido"],
                },
              },
              select: {
                status: true,
              },
            },
          },
        },
        oficina: {
          select: {
            telefone: true,
            rua: true,
            bairro: true,
            cidade: true,
            estado: true,
          },
        },
        responsavel: {
          select: {
            nome: true,
          },
        },
      },
    });

    return res.status(200).json({
      data: inoperantes,
      meta: {
        totalItems,
        currentPage: page,
        totalPages,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const listInoperative = async (req, res, next) => {
   
}

export const listCompleted = async (req, res, next) => {
   
}

export const getById  = async (req, res, next) => {
   
}

export const getPhaseInfo = async (req, res, next) => {
   
}

