import prisma from "../config/database.js";

export const list = async (req, res, next) => {
  /*
    #swagger.tags = ["Garage"]
    #swagger.summary = "Listar oficinas"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const whereClause = {};
    if (req.query.nome) {
      whereClause.nome = {
        contains: req.query.nome,
        mode: 'insensitive'
      };
    }

    const page = parseInt(req.query._page) || 1;
    const limit = parseInt(req.query._limit) || 10;
    const offset = (page - 1) * limit;

    const totalItems = await prisma.oficina.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    const order = req.query._order?.toLowerCase() === "desc" ? "desc" : "asc";
    const sort = req.query._sort;
    const validSortFields = ["id", "nome", "cidade"];
    const orderBy = validSortFields.includes(sort) ? { [sort]: order } : undefined;

    const oficinas = await prisma.oficina.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      ...(orderBy && { orderBy })
    });

    return res.ok(res.hateos_list("oficinas", oficinas, totalPages));
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  /*
    #swagger.tags = ["Garage"]
    #swagger.summary = "Obter oficina por ID"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

    const oficina = await prisma.oficina.findUnique({ where: { id } });
    if (!oficina) {
      return res.status(404).json({ error: "Oficina não encontrada." });
    }

    return res.ok(res.hateos_item(oficina));
  } catch (error) {
    return next(error);
  }
};

export const create = async (req, res, next) => {
  /*
    #swagger.tags = ["Garage"]
    #swagger.summary = "Criar nova oficina"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const novaOficina = await prisma.oficina.create({ data: req.body });
    return res.created(res.hateos_item(novaOficina));
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  /*
    #swagger.tags = ["Garage"]
    #swagger.summary = "Atualizar oficina existente"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

    await prisma.oficina.update({
      where: { id },
      data: req.body,
    });

    return res.no_content();
  } catch (error) {
    return res.status(404).json({ error: "Oficina não encontrada." });
  }
};

export const remove = async (req, res, next) => {
  /*
    #swagger.tags = ["Garage"]
    #swagger.summary = "Deletar oficina"
    #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

    await prisma.oficina.delete({ where: { id } });
    return res.no_content();
  } catch (error) {
    return res.status(404).json({ error: "Oficina não encontrada." });
  }
};
