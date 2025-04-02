import User from "../models/userModel.js";
import { hashPassword } from "../utils/bcrypt.js";
import bcrypt from "bcrypt";

export const login = async (req, res, next) => {
  /*
  #swagger.tags = ["Login"]
  #swagger.security = [{ "BearerAuth": [] }]
  */
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.unauthorized();
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      res.unauthorized();
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const showUser = async (req, res, next) => {
  /*
  #swagger.tags = ["Users"]
  #swagger.summary = "Get user by ID"
  #swagger.responses[200]
  #swagger.security = [{ "BearerAuth": [] }]
  */

  try{
    const user = await User.findOne(req.params)
    .select("-password");
  
    res.ok(res.hateos_item(user));
  }catch (err) {
    next(err);
  }
}

export const listUsers = async (req, res, next) => {
  /*
  #swagger.tags = ["Users"]
  #swagger.summary = "List all users"
  #swagger.responses[200]
  #swagger.security = [{ "BearerAuth": [] }]
  */

  try {
    const page = parseInt(req.query._page) || 1;
    const size = parseInt(req.query._size) || 10;
    const sort = req.query._sort || 'name'; 
    const order = req.query._order === 'desc' ? -1 : 1; 

    const offset = (page - 1) * size;

    const users = await User.find({})
      .skip(offset)
      .limit(size)
      .sort({ [sort]: order })
      .select("-password");

    const totalData = await User.countDocuments();
    const totalPages = Math.ceil(totalData / size);

    res.ok(res.hateos_list("users", users, totalPages));
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  /*
  #swagger.tags = ["Users"]
  #swagger.summary = "Create new user"
  #swagger.security = [{ "BearerAuth": [] }]
   #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" }
          },
          required: ["name", "email", "password"]
        }
      }
    }
  }
  #swagger.responses[201]
  */

  try{
    await new User(req.body).save();

    res.created();
  }catch (err) {
    next(err);
  }
}

export const editUser = async (req, res, next) => {
  /*
  #swagger.tags = ["Users"]
  #swagger.summary = "Edit user by ID"
  #swagger.security = [{ "BearerAuth": [] }]
  #swagger.parameters["body"] = {
    in: "body",
    schema: {
      $name: "",
      $email: "",
      $password: ""
    }
  }
  #swagger.responses[200]
  */

  try{
    const user = await User.findOneAndUpdate(req.params, req.body, { new: true }).select("-password");
  
    res.ok(res.hateos_item(user));
  }catch (err) {
    next(err);
  }
}

export const deleteUser = async (req, res, next) => {
  /*
  #swagger.tags = ["Users"]
  #swagger.summary = "Delete user by ID"
  #swagger.responses[204]
  #swagger.security = [{ "BearerAuth": [] }]
  */

  try{
    await User.findByIdAndDelete(req.params._id);
  
    res.no_content();
  }catch (err) {
    next(err);
  }
}