import prisma from "../config/database.js";

export const list = async (req, res, next) => {
  /*
    #swagger.tags = ["Orçamentos"]
    #swagger.summary = "Lista todos os orçamentos"
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.parameters['_limit'] = {
      in: 'query',
      description: 'Número de itens por página',
      required: false,
      type: 'integer',
      default: 10
    }
    #swagger.parameters['_page'] = {
      in: 'query',
      description: 'Página atual',
      required: false,
      type: 'integer',
      default: 1
    }
    #swagger.parameters['_sort'] = {
      in: 'query',
      description: 'Campo para ordenação (id, descricaoServico, valorMaoObra, status)',
      required: false,
      type: 'string'
    }
    #swagger.parameters['_order'] = {
      in: 'query',
      description: 'Direção da ordenação (asc ou desc)',
      required: false,
      type: 'string',
      enum: ['asc', 'desc']
    }
    #swagger.responses[200] = {
      description: "Lista de orçamentos com paginação"
    }
  */
  try {
    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;

    const totalItems = await prisma.orcamento.count();
    const totalPages = Math.ceil(totalItems / limit);

    const order = req.query._order?.toLowerCase() === "desc" ? "desc" : "asc";
    const sort = req.query._sort;
    const validSortFields = ["id", "descricaoServico", "valorMaoObra", "status"];
    const orderBy = validSortFields.includes(sort) ? { [sort]: order } : undefined;

    const orcamentos = await prisma.orcamento.findMany({
      skip: offset,
      take: limit,
      ...(orderBy && { orderBy }),
      include: {
        manutencao: {
          select: {
            veiculo: {
              select: {
                placa: true, 
              },
            },
          },
        },
        produtos: {
          include: {
            produto: true, 
          },
        },
      },
    });

    return res.ok({
      data: orcamentos,
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
  /*
    #swagger.tags = ["Orçamentos"]
    #swagger.summary = "Busca orçamento por ID"
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.responses[200]
    #swagger.responses[404] = { description: "Orçamento não encontrado" }
  */
  try {
    const id = parseInt(req.params.id);
    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        manutencao: {
          include: {
            veiculo: true, 
          }
        },
        oficina: true,
        produtos: {
          include: {
            produto: true,
          },
        },
      },
    });
    if (!orcamento) return res.status(404).json({ error: "Orçamento não encontrado." });

    return res.ok(res.hateos_item(orcamento));
  } catch (error) {
    return next(error);
  }
};

export const create = async (req, res, next) => {
  /*
    #swagger.tags = ["Orçamentos"]
    #swagger.summary = "Cria um novo orçamento"
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              descricaoServico: { type: "string" },
              valorMaoObra: { type: "number" },
              status: { type: "string" },
              dataEnvio: { type: "string", format: "date-time" },
              manutencaoId: { type: "integer" },
              oficinaId: { type: "integer" },
              produtos: { type: "array" }
            },
            required: ["descricaoServico", "valorMaoObra", "status", "dataEnvio", "manutencaoId", "oficinaId"]
          }
        }
      }
    }
    #swagger.responses[201] = { description: "Orçamento criado com sucesso" }
  */
  try {
    const { produtos, dataEnvio, ...rest } = req.body;

    const orcamento = await prisma.orcamento.create({
      data: {
        ...rest,
        dataEnvio: new Date(dataEnvio).toISOString(),
      },
    });

    return res.created(res.hateos_item(orcamento));
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  /*
    #swagger.tags = ["Orçamentos"]
    #swagger.summary = "Atualiza um orçamento existente"
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.responses[204] = { description: "Atualizado com sucesso" }
    #swagger.responses[404] = { description: "Orçamento não encontrado" }
  */
  try {
    const id = parseInt(req.params.id);
    const orcamento = await prisma.orcamento.update({
      where: { id },
      data: req.body,
    });

    return res.no_content(res.hateos_item(orcamento));
  } catch (error) {
    return res.status(404).json({ error: "Orçamento não encontrado ou inválido." });
  }
};

export const remove = async (req, res, next) => {
  /*
    #swagger.tags = ["Orçamentos"]
    #swagger.summary = "Remove um orçamento"
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.responses[204] = { description: "Removido com sucesso" }
    #swagger.responses[404] = { description: "Orçamento não encontrado" }
  */
  try {
    const id = parseInt(req.params.id);
    await prisma.orcamento.delete({ where: { id } });
    return res.no_content();
  } catch (error) {
    return res.status(404).json({ error: "Orçamento não encontrado." });
  }
};
