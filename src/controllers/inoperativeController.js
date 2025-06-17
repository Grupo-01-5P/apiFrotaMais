import prisma from "../config/database.js";
import { hashPassword } from "../utils/bcrypt.js";
import bcrypt from "bcrypt";


export const listInoperantVehicles = async (req, res, next) => {
  /*
    #swagger.tags = ["Inoperative"]
    #swagger.summary = "Listar veículos com manutenção aprovada ou concluída"
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['status'] = {
      in: 'query',
      description: 'Filtrar por status (aprovada/concluida)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['_page'] = {
      in: 'query',
      description: 'Número da página',
      required: false,
      type: 'integer'
    }
    #swagger.parameters['_limit'] = {
      in: 'query',
      description: 'Limite de itens por página',
      required: false,
      type: 'integer'
    }
  */
  try {
    const { _page, _limit, _sort, _order, status } = req.query;

    // Se não passar status, usa os dois padrões
    const statusFiltro = status ? [status] : ['aprovada', 'concluida'];

    const whereClause = {
      status: { in: statusFiltro }
    };

    if (req.payload?.funcao === 'supervisor') {
      whereClause.supervisorId = req.payload.id;
    }

    const page = parseInt(_page) || 1;
    const limit = parseInt(_limit) || 10;
    const offset = (page - 1) * limit;

    const totalItems = await prisma.manutencao.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    const order = _order?.toLowerCase() === "desc" ? "desc" : "asc";
    const validSortFields = ["id", "veiculoId", "oficinaId", "responsavelId"];
    const orderBy = validSortFields.includes(_sort) ? { [_sort]: order } : undefined;

    const manutencoes = await prisma.manutencao.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      ...(orderBy && { orderBy }),
      include: {
        veiculo: {
          select: {
            id: true,
            placa: true,
            marca: true,
            modelo: true,
            anoModelo: true,
            cor: true,
            empresa: true,
            departamento: true,
            renavam: true,
            chassi: true,
            supervisor: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        oficina: {
          select: {
            id: true,
            telefone: true,
            rua: true,
            bairro: true,
            cidade: true,
            estado: true,
          },
        },
        supervisor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: manutencoes,
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
    console.error('Erro ao listar veículos inoperantes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};


export const getById = async (req, res, next) => {
  /*
    #swagger.tags = ["Inoperative"]
    #swagger.summary = "Buscar veículo inoperante por ID"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const { id } = req.params;

    const manutencao = await prisma.manutencao.findUnique({
      where: { id: parseInt(id) },
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
            renavam: true,
            chassi: true,
            supervisor: {
              select: {
                nome: true,
                email: true,
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
        supervisor: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!manutencao) {
      return res.status(404).json({ 
        success: false,
        message: 'Veículo inoperante não encontrado' 
      });
    }

    return res.status(200).json({
      success: true,
      data: manutencao
    });
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};


export const getPhaseInfo = async (req, res, next) => {
  /*
    #swagger.tags = ["Inoperative"]
    #swagger.summary = "Obter informações da fase atual do veículo inoperante"
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID do veículo inoperante',
      required: true,
      type: 'integer'
    }
    #swagger.responses[200] = { 
      description: "Informações da fase",
      schema: {
        id: 1,
        faseAtual: "FASE1",
        updatedAt: "2024-03-20T10:00:00Z",
        veiculo: {
          placa: "ABC1234",
          marca: "Toyota",
          modelo: "Corolla"
        },
        responsavel: {
          nome: "João Silva",
          funcao: "supervisor"
        }
      }
    }
    #swagger.responses[404] = { description: "Veículo inoperante não encontrado" }
    #swagger.responses[403] = { description: "Acesso proibido" }
  */
  try {
    const { id } = req.params;

    const inoperante = await prisma.inoperante.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        id: true,
        faseAtual: true,
        updatedAt: true,
        veiculo: {
          select: {
            placa: true,
            marca: true,
            modelo: true,
          }
        },
        responsavel: {
          select: {
            nome: true,
            funcao: true,
          }
        }
      }
    });

    if (!inoperante) {
      return res.not_found({ message: "Veículo inoperante não encontrado." });
    }

    // Verifica permissão do supervisor
    if (req.payload && req.payload.funcao === 'supervisor') {
      if (inoperante.responsavel.id !== req.payload.id) {
        return res.forbidden({ message: "Acesso Proibido: Você não tem permissão para visualizar este registro." });
      }
    }

    return res.ok(inoperante);
  } catch (error) {
    return next(error);
  }
};


export const updatePhase = async (req, res, next) => {
  /*
    #swagger.tags = ["Inoperative"]
    #swagger.summary = "Atualizar fase do veículo inoperante"
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID do veículo inoperante',
      required: true,
      type: 'integer'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dados da fase',
      required: true,
      schema: {
        fase: "FASE1"
      }
    }
    #swagger.responses[200] = { 
      description: "Fase atualizada com sucesso",
      schema: {
        id: 1,
        faseAtual: "FASE1",
        updatedAt: "2024-03-20T10:00:00Z",
        veiculo: {
          placa: "ABC1234",
          marca: "Toyota",
          modelo: "Corolla"
        },
        responsavel: {
          nome: "João Silva",
          funcao: "supervisor"
        }
      }
    }
    #swagger.responses[400] = { description: "Fase inválida" }
    #swagger.responses[404] = { description: "Veículo inoperante não encontrado" }
    #swagger.responses[403] = { description: "Acesso proibido ou sem permissão para atualizar" }
  */
  try {
    const { id } = req.params;
    const { fase } = req.body;

    // Validação básica
    if (!id || !fase) {
      return res.status(400).json({
        success: false,
        message: 'ID e fase são obrigatórios'
      });
    }

    // Busca o inoperante atual
    const inoperanteAtual = await prisma.inoperante.findUnique({
      where: { id: parseInt(id) },
      include: {
        veiculo: true
      }
    });

    if (!inoperanteAtual) {
      return res.status(404).json({
        success: false,
        message: 'Veículo inoperante não encontrado'
      });
    }

    // Se estiver concluindo a FASE4, atualiza o status da manutenção
    if (inoperanteAtual.faseAtual === 'FASE4' && fase === 'FASE5') {
      // Busca a manutenção ativa do veículo
      const manutencao = await prisma.manutencao.findFirst({
        where: {
          veiculoId: inoperanteAtual.veiculoId,
          status: {
            in: ['aprovada', 'em_andamento']
          }
        }
      });

      if (manutencao) {
        // Atualiza o status da manutenção para concluída
        await prisma.manutencao.update({
          where: { id: manutencao.id },
          data: {
            status: 'concluida'
          }
        });
      }
    }

    // Atualiza a fase do inoperante
    const inoperante = await prisma.inoperante.update({
      where: { id: parseInt(id) },
      data: {
        faseAtual: fase
      },
      include: {
        veiculo: {
          select: {
            placa: true,
            marca: true,
            modelo: true
          }
        },
        oficina: {
          select: {
            nome: true,
            cidade: true,
            estado: true
          }
        },
        responsavel: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Fase atualizada com sucesso',
      data: inoperante
    });

  } catch (error) {
    console.error('Erro ao atualizar fase:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export const getPhase = async (req, res, next) => {
  /*
    #swagger.tags = ["Inoperative"]
    #swagger.summary = "Buscar fase atual do veículo inoperante"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    console.log('Buscando fase para o ID:', req.params.id);
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const inoperante = await prisma.inoperante.findUnique({
      where: { 
        id: parseInt(id) 
      },
      select: {
        id: true,
        faseAtual: true,
        updatedAt: true,
        veiculo: {
          select: {
            placa: true,
            marca: true,
            modelo: true
          }
        },
        oficina: {
          select: {
            nome: true,
            cidade: true,
            estado: true
          }
        },
        responsavel: {
          select: {
            nome: true,
            email: true
          }
        }
      },
    });

    console.log('Resultado da busca:', inoperante);

    if (!inoperante) {
      return res.status(404).json({ 
        success: false,
        message: 'Veículo inoperante não encontrado' 
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: inoperante.id,
        faseAtual: inoperante.faseAtual,
        updatedAt: inoperante.updatedAt,
        veiculo: inoperante.veiculo,
        oficina: inoperante.oficina,
        responsavel: inoperante.responsavel
      }
    });
  } catch (error) {
    console.error('Erro ao buscar fase:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

export const create = async (req, res, next) => {
  /*
    #swagger.tags = ["Inoperative"]
    #swagger.summary = "Criar novo veículo inoperante"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const { veiculoId } = req.params;
    console.log('Criando inoperante para veículo:', veiculoId);

    if (!veiculoId || isNaN(parseInt(veiculoId))) {
      return res.status(400).json({
        success: false,
        message: 'ID do veículo inválido'
      });
    }

    // Verifica se o veículo existe e busca sua manutenção ativa
    const manutencao = await prisma.manutencao.findFirst({
      where: {
        veiculoId: parseInt(veiculoId),
        status: {
          in: ['aprovada', 'em_andamento']
        },
        oficinaId: {
          not: null
        }
      },
      include: {
        veiculo: true,
        oficina: true
      }
    });

    if (!manutencao) {
      return res.status(404).json({
        success: false,
        message: 'Veículo não possui manutenção ativa ou aprovada'
      });
    }

    // Verifica se já existe um inoperante ativo para este veículo
    const inoperanteExistente = await prisma.inoperante.findFirst({
      where: {
        veiculoId: parseInt(veiculoId),
        faseAtual: {
          not: 'FASE5' // FASE5 indica que o processo foi concluído
        }
      }
    });

    if (inoperanteExistente) {
      return res.status(400).json({
        success: false,
        message: 'Veículo já possui um registro inoperante ativo',
        data: {
          id: inoperanteExistente.id,
          faseAtual: inoperanteExistente.faseAtual
        }
      });
    }

    // Cria o inoperante usando a oficina da manutenção
    const inoperante = await prisma.inoperante.create({
      data: {
        veiculoId: parseInt(veiculoId),
        oficinaId: manutencao.oficinaId,
        responsavelId: req.payload.id, // Usa o ID do usuário logado como responsável
        faseAtual: 'FASE1' // Começa na FASE1
      },
      include: {
        veiculo: {
          select: {
            placa: true,
            marca: true,
            modelo: true
          }
        },
        oficina: {
          select: {
            nome: true,
            cidade: true,
            estado: true
          }
        },
        responsavel: {
          select: {
            nome: true,
            email: true
          }
        }
      }
    });

    console.log('Inoperante criado:', inoperante);

    return res.status(201).json({
      success: true,
      message: 'Veículo inoperante criado com sucesso',
      data: inoperante
    });

  } catch (error) {
    console.error('Erro ao criar inoperante:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export const checkVehicleInoperative = async (req, res, next) => {
  /*
    #swagger.tags = ["Inoperative"]
    #swagger.summary = "Verifica se um veículo já está inoperante"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const { veiculoId } = req.params;

    if (!veiculoId || isNaN(parseInt(veiculoId))) {
      return res.status(400).json({
        success: false,
        message: 'ID do veículo inválido'
      });
    }

    // Busca inoperante ativo para o veículo (que não esteja na FASE5)
    const inoperante = await prisma.inoperante.findFirst({
      where: {
        veiculoId: parseInt(veiculoId),
        faseAtual: {
          not: 'FASE5' // FASE5 indica que o processo foi concluído
        }
      }
    });

    return res.status(200).json({
      success: true,
      exists: !!inoperante,
      data: inoperante ? {
        id: inoperante.id,
        faseAtual: inoperante.faseAtual
      } : null
    });

  } catch (error) {
    console.error('Erro ao verificar veículo inoperante:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

