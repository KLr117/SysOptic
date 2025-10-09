import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" }); // 👈 garantiza carga segura solo para este módulo

import jwt from "jsonwebtoken";

export const signToken = (payload) => {
  const { JWT_SECRET, JWT_EXPIRES = "1d" } = process.env;

  if (!JWT_SECRET) throw new Error("Falta JWT_SECRET en .env");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

export const verifyTokenSync = (token) => {
  const { JWT_SECRET } = process.env;
  if (!JWT_SECRET) throw new Error("Falta JWT_SECRET en .env");
  return jwt.verify(token, JWT_SECRET);
};
