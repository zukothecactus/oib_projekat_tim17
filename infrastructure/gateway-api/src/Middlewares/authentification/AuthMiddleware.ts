import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthTokenClaimsType } from "../../Domain/types/AuthTokenClaims";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenClaimsType;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Token is missing!" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? ""
    ) as AuthTokenClaimsType;

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token provided!" });
  }
};
