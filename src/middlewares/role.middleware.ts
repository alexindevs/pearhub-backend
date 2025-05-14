import { RequestHandler } from "express";
import { Role } from "../../generated/prisma";
import { AuthenticatedRequest } from "./auth.middleware";

export function authorizeRole(allowedRoles: Role[]): RequestHandler {
  return (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user?.role) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(user.role as Role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}
