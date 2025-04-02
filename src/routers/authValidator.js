import yup from "yup";

export default yup
  .object()
  .shape({
    email:
      yup
        .string()
        .required("Required (email)"),
    password:
      yup
        .string()
        .required("Required (password)"),
  });
