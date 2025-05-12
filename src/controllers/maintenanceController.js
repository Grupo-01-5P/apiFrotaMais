import prisma from "../config/database.js";


export const list = async (req, res, next) => {
  /*
    #swagger.tags = ["Maintenance"]
    #swagger.summary = "Listar manutenções"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const whereClause = {};
    if (req.query.status) {
      whereClause.status = req.query.status;
    }

    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;

    const totalItems = await prisma.manutencao.count();
    const totalPages = Math.ceil(totalItems / limit);

    const order = req.query._order?.toLowerCase() === "desc" ? "desc" : "asc";
    const sort = req.query._sort;
    const validSortFields = ["id", "urgencia", "status", "dataSolicitacao"];
    const orderBy = validSortFields.includes(sort) ? { [sort]: order } : undefined;

    const manutencoes = await prisma.manutencao.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      ...(orderBy && { orderBy }),
      include: {
        veiculo: true,
        analista: {
          select: { id: true, nome: true, email: true }
        }
      }
    });

    return res.ok(res.hateos_list("manutencoes", manutencoes, totalPages));
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  /*
    #swagger.tags = ["Maintenance"]
    #swagger.summary = "Obter manutenção por ID"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const id = parseInt(req.params.id);
    const manutencao = await prisma.manutencao.findUnique({
      where: { id },
      include: {
        veiculo: true,
        analista: {
          select: { id: true, nome: true, email: true }
        },
        orcamento: true,
        entrega: true
      }
    });

    if (!manutencao) {
      return res.status(404).json({ error: "Manutenção não encontrada." });
    }

    return res.ok(res.hateos_item(manutencao));
  } catch (error) {
    return next(error);
  }
};

export const create = async (req, res, next) => {
  /*
    #swagger.tags = ["Maintenance"]
    #swagger.summary = "Criar nova manutenção"
    #swagger.security = [{ "BearerAuth": [] }]
  */
    try {
      const nova = await prisma.manutencao.create({
        data: {
          veiculoId: req.body.veiculoId,
          descricaoProblema: req.body.descricaoProblema,
          latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
          longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
          urgencia: req.body.urgencia,
          status: req.body.status || "pendente",
          analistaId: req.body.analistaId
        }
      });
  
      return res.created(res.hateos_item(nova));
    } catch (error) {
      return next(error);
    }
};

export const update = async (req, res, next) => {
  /*
    #swagger.tags = ["Maintenance"]
    #swagger.summary = "Atualizar manutenção existente"
    #swagger.security = [{ "BearerAuth": [] }]
  */
    try {
      const id = parseInt(req.params.id);
      
      // Se os campos latitude ou longitude estiverem presentes, converta para número
      const data = { ...req.body };
      if (data.latitude !== undefined) {
        data.latitude = data.latitude === null ? null : parseFloat(data.latitude);
      }
      if (data.longitude !== undefined) {
        data.longitude = data.longitude === null ? null : parseFloat(data.longitude);
      }
      
      const updated = await prisma.manutencao.update({
        where: { id },
        data
      });
  
      return res.no_content(res.hateos_item(updated));
    } catch (error) {
      return next(error);
    }
};

export const remove = async (req, res, next) => {
  /*
    #swagger.tags = ["Maintenance"]
    #swagger.summary = "Deletar manutenção"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const id = parseInt(req.params.id);
    await prisma.manutencao.delete({ where: { id } });
    return res.no_content();
  } catch (error) {
    return next(error);
  }
};

export const aprovar = async (req, res, next) => {
  /*
    #swagger.tags = ["Maintenance"]
    #swagger.summary = "Aprovar uma manutenção pendente e definir oficina"
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.description = "Altera o status da manutenção para 'Aprovada' e define a oficina responsável"
    #swagger.parameters['oficinaId'] = {
      in: 'body',
      description: 'ID da oficina responsável pela manutenção (opcional)',
      required: false,
      type: 'integer'
    }
    #swagger.responses[204] = { description: "Manutenção aprovada com sucesso" }
    #swagger.responses[404] = { description: "Manutenção ou oficina não encontrada" }
    #swagger.responses[400] = { description: "Manutenção não pode ser aprovada pois não está com status pendente" }
  */
  try {
    const id = parseInt(req.params.id);
    const { oficinaId } = req.body; // Recebe o ID da oficina do corpo da requisição
    
    // Verificar se a manutenção existe e qual o status atual
    const manutencao = await prisma.manutencao.findUnique({
      where: { id },
      select: { status: true }
    });
    
    if (!manutencao) {
      return res.status(404).json({ error: "Manutenção não encontrada." });
    }

    // Verificar se a manutenção está em estado que pode ser aprovada
    if (manutencao.status !== "pendente") {
      return res.status(400).json({ 
        error: `Manutenção não pode ser aprovada pois está com status '${manutencao.status}' ao invés de 'pendente'` 
      });
    }

    // Verificar se a oficina existe, se um ID foi fornecido
    if (oficinaId) {
      const oficina = await prisma.oficina.findUnique({
        where: { id: parseInt(oficinaId) }
      });
      
      if (!oficina) {
        return res.status(404).json({ error: "Oficina não encontrada." });
      }
    }

    // Preparar os dados para atualização
    const updateData = { 
      status: "aprovada", // Note que mudei para minúsculo para manter consistência
      dataAprovacao: new Date()
    };

    // Adicionar oficinaId apenas se foi fornecido
    if (oficinaId) {
      updateData.oficinaId = parseInt(oficinaId);
    }

    // Aprovar a manutenção e definir a oficina (se fornecida)
    const updated = await prisma.manutencao.update({
      where: { id },
      data: updateData
    });

    return res.status(204).send(); // ou use seu método personalizado: res.no_content(res.hateos_item(updated));
  } catch (error) {
    console.error("Erro ao aprovar manutenção:", error);
    return next(error);
  }
};

export const reprovar = async (req, res, next) => {
  /*
    #swagger.tags = ["Maintenance"]
    #swagger.summary = "Reprovar uma manutenção pendente"
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.description = "Altera o status da manutenção para 'Reprovada'"
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Motivo da reprovação',
      required: false,
      schema: {
        motivoReprovacao: 'Custo muito elevado para o tipo de reparo'
      }
    }
    #swagger.responses[204] = { description: "Manutenção reprovada com sucesso" }
    #swagger.responses[404] = { description: "Manutenção não encontrada" }
    #swagger.responses[400] = { description: "Manutenção não pode ser reprovada pois não está com status pendente" }
  */
  try {
    const id = parseInt(req.params.id);
    
    // Verificar se a manutenção existe e qual o status atual
    const manutencao = await prisma.manutencao.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!manutencao) {
      return res.status(404).json({ error: "Manutenção não encontrada." });
    }

    // Verificar se a manutenção está em estado que pode ser reprovada
    if (manutencao.status !== "pendente") {
      return res.status(400).json({ 
        error: `Manutenção não pode ser reprovada pois está com status '${manutencao.status}' ao invés de 'pendente'` 
      });
    }

    // Reprovar a manutenção
    const updated = await prisma.manutencao.update({
      where: { id },
      data: { 
        status: "Reprovada", 
        motivoReprovacao: req.body.motivoReprovacao || null,
        dataReprovacao: new Date() // Opcional: registrar quando foi reprovada
      }
    });

    return res.no_content(res.hateos_item(updated));
  } catch (error) {
    return next(error);
  }
};
