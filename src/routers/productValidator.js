import yup from "yup";

export default yup
  .object()
  .shape({
    name:
      yup
        .string()
        .min(2, "Too short (name)")
        .max(100, "Too long (name)")
        .required("Required (name)"),
    price:
      yup
        .number()
        .min(0, "Price cannot be negative")
        .required("Required (price)"),
    category:
      yup
        .string()
        .min(3, "Too short (category)")
        .max(50, "Too long (category)")
        .required("Required (category)"),
    stock:
      yup
        .number()
        .integer("Stock must be an integer")
        .min(0, "Stock cannot be negative")
        .required("Required (stock)"),
  });