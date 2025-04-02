import jsonwebtoken from "jsonwebtoken";

export const generate = (req, res, next) => {
  if (!req.user) {
    res.unauthorized();
  }

  const payload = {
    email: req.user.email,
  };

  const JWTSECRET = process.env.JWT_SECRET;

  const token = jsonwebtoken.sign(payload, JWTSECRET, {
    expiresIn: '1d',
  });

  res.ok({ token });
}

export const verify = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    const JWTSECRET = process.env.JWT_SECRET;
    return jsonwebtoken.verify(token, JWTSECRET, (err, payload) => {
      if (err) return next(err);

      req.payload = payload;

      return next();
    });
  }

  res.unauthorized();
}
