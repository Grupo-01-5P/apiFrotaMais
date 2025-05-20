import prisma from "../config/database.js";

export const list = async (req, res, next) => {
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
            select: {
                id: true,
                descricaoServico: true,
                valorMaoObra: true,
                status: true,
                dataEnvio: true,
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
            }
        });
    } catch (error) {
        return next(error);
    }
};

export const getById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const orcamento = await prisma.orcamento.findUnique({
            where: { id },
            include: {
                manutencao: true,
                oficina: true,
                produtos: true
            }
        });
    
        if (!orcamento) return res.status(404).json({ error: "Orçamento não encontrado." });
    
        return res.ok(res.hateos_item(orcamento));
    } catch (error) {
        return next(error);
    }
};

export const create = async (req, res, next) => {
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
    try {
        const id = parseInt(req.params.id);
        const orcamento = await prisma.orcamento.update({
            where: { id },
            data: req.body,
        });

        return res.no_content(res.hateos_item(orcamento));
    } catch (error) {
        console.error(error)
        return res.status(404).json({ error: "Orçamento não encontrado ou inválido." });
    }
};

export const remove = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.orcamento.delete({ where: { id } });
        return res.no_content();
    } catch (error) {
        return res.status(404).json({ error: "Orçamento não encontrado." });
    }
};
