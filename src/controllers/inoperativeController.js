import prisma from "../config/database.js";
import { hashPassword } from "../utils/bcrypt.js";
import bcrypt from "bcrypt";


export const listInoperantVehicles = async (req, res, next) => {
  try {
    const { _page, _limit, _sort, _order, status } = req.query;

    const whereClause = {
      veiculo: {
        manutencoes: {
          some: {
            status: status ? status : { in: ["aprovado", "concluido"] },
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

    const page = parseInt(_page) || 1;
    const limit = parseInt(_limit) || 10;
    const offset = (page - 1) * limit;

    const totalItems = await prisma.inoperante.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    const order = _order?.toLowerCase() === "desc" ? "desc" : "asc";
    const validSortFields = ["id", "veiculoId", "oficinaId", "responsavelId"];
    const orderBy = validSortFields.includes(_sort) ? { [_sort]: order } : undefined;

    const vehicles = await prisma.inoperante.findMany({
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
                status: status ? status : { in: ["aprovado", "concluido"] },
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

    return res.ok({
      data: vehicles,
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


export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inoperante = await prisma.inoperante.findUnique({
      where: {
        id: parseInt(id),
      },
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
              select: {
                status: true,
                descricaoProblema: true,
                dataSolicitacao: true,
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

    if (!inoperante) {
      return res.not_found({ message: "Registro de veículo inoperante não encontrado." });
    }

    if (req.payload && req.payload.funcao === 'supervisor') {
      if (inoperante.veiculo.supervisor.id !== req.payload.id) {
        return res.forbidden({ message: "Acesso Proibido: Você não tem permissão para visualizar este registro de veículo." });
      }
    }

    return res.ok(inoperante);
  } catch (error) {
    return next(error);
  }
};


export const getPhaseInfo = async (req, res, next) => {
   
}

