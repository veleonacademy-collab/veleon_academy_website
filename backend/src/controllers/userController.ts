import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService.js";

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    const user = await userService.updateUserRole(id, role);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const user = await userService.updateUserStatus(id, status);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function getMyTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const transactions = await userService.getUserTransactions(userId);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

export async function getMyTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const tasks = await userService.getUserTasks(userId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export async function updateUserEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { email } = req.body;
    const user = await userService.updateUserEmail(id, email);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function resendUserCredentials(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await userService.resendUserCredentials(id);
    res.json({ message: "Credentials resent successfully." });
  } catch (err) {
    next(err);
  }
}
