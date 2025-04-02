import Product from "../models/productModel.js";


export const showProduct = async (req, res, next) => {
  /* 
  #swagger.tags = ["Products"]
  #swagger.summary = "Get a single product"
  #swagger.responses[200]
  #swagger.responses[404]
  #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const product = await Product.findOne(req.params);
    res.ok(res.hateos_item(product));
  } catch (err) {
    next(err);
  }
};


export const listProducts = async (req, res, next) => {
  /* 
  #swagger.tags = ["Products"]
  #swagger.summary = "List all products with pagination"
  #swagger.responses[200]
  #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const page = parseInt(req.query._page) || 1;
    const size = parseInt(req.query._size) || 10;
    const sort = req.query._sort || 'name'; 
    const order = req.query._order === 'desc' ? -1 : 1; 

    const offset = (page - 1) * size;

    const products = await Product.find({})
      .skip(offset)
      .limit(size)
      .sort({ [sort]: order }); 

    const totalData = await Product.countDocuments();
    const totalPages = Math.ceil(totalData / size);

    res.ok(res.hateos_list("products", products, totalPages));
  } catch (err) {
    next(err);
  }
};


export const createProduct = async (req, res, next) => {
  /* 
  #swagger.tags = ["Products"]
  #swagger.summary = "Create a new product"
  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: { $ref: "#/components/schemas/Product" }
          }
      }
  }
  #swagger.responses[201]
  #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    await new Product(req.body).save();
    res.created({ message: "Product created successfully" });
  } catch (err) {
    next(err);
  }
};

export const editProduct = async (req, res, next) => {
  /* 
  #swagger.tags = ["Products"]
  #swagger.summary = "Edit an existing product"
  #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: { $ref: "#/components/schemas/Product" }
          }
      }
  }
  #swagger.responses[200]
  #swagger.responses[404]
  #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const product = await Product.findOneAndUpdate(req.params, req.body, { new: true });
    
    res.ok(res.hateos_item(product));
  } catch (err) {
    next(err);
  }
};


export const deleteProduct = async (req, res, next) => {
  /* 
  #swagger.tags = ["Products"]
  #swagger.security = [{ "BearerAuth": [] }]
  #swagger.summary = "Delete a product"
  #swagger.responses[204]
  #swagger.responses[404]
  */
  try {
    await Product.findByIdAndDelete(req.params._id);
    res.no_content();
  } catch (err) {
    next(err);
  }
};
