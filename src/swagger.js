import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "1.0.0",
    title: "Tecnologias Emergentes",
    description: "Documentação da API criada em sala"
  },
  servers: [
    {
      url: "http://localhost:3000",
    }
  ],
  components: {
    schemas: {
      InternalServerError: {
        code: "",
        message: "",
      },
      Product: {
        type: "object",
        required: ["name", "price", "category", "stock"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100, example: "Smartphone XYZ" },
          price: { type: "number", minimum: 0, example: 1999.99 },
          category: { type: "string", minLength: 3, maxLength: 50, example: "Electronics" },
          stock: { type: "integer", minimum: 0, example: 100 }
        }
      },
      User: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100, example: "João" },
          email: { type: "string", minimum: 0, example: "example@example.com" },
          password: { type: "string", minLength: 8, maxLength: 20, example: "password123" },
        }
      }
    },
    securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT"
        }
      },
      security: [
        {
          BearerAuth: []
        }
      ]
  }
};

const outputFile = "./config/swagger.json";
const endpointsFiles = ["./routes.js"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc)
  .then(async () => {
    await import("./server.js");
  });
