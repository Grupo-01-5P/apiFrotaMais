import httpStatus from "http-status";

export default (_, res, next) => {
  res.ok = (data) => res
    .status(httpStatus.OK)
    .json(data);

  res.created = (data) => res
    .status(httpStatus.CREATED)
    .json(data);

  res.no_content = () => res
    .status(httpStatus.NO_CONTENT)
    .send();

  res.internal_server_error = (data) => res
    .status(httpStatus.INTERNAL_SERVER_ERROR)
    .json(data);

  res.unauthorized = () => res
    .status(httpStatus.UNAUTHORIZED)
    .send();

  next();
}
