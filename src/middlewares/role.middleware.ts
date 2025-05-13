import { Role } from "../../generated/prisma";

export function authorizeRole(allowedRoles: Role[]) {
    return (req, res, next) => {
      const user = req.user; 
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    };
  }