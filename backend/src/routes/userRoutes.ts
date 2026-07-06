import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getMyTransactions,
  getMyTasks,
  deleteUser,
  updateUserEmail,
  resendUserCredentials,
} from "../controllers/userController.js";

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/me/transactions", getMyTransactions);
userRouter.get("/me/tasks", getMyTasks);

userRouter.use(authorize(["admin", "tutor"]));

userRouter.get("/", getAllUsers);
userRouter.put("/:id/role", updateUserRole);
userRouter.put("/:id/status", updateUserStatus);

userRouter.delete("/:id", authorize(["admin"]), deleteUser);
userRouter.put("/:id/email", authorize(["admin"]), updateUserEmail);
userRouter.post("/:id/resend-credentials", authorize(["admin"]), resendUserCredentials);
