import { Request, Response, NextFunction } from "express";

export const authorize = (...dozvoljeneUloge: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !dozvoljeneUloge.includes(user.role.toLowerCase())) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    next();
  };
};
