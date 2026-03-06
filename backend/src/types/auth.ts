export type UserRole = "admin" | "tutor" | "student" | "user";

export interface JwtPayload {
  sub: number;
  role: UserRole;
  type: "access" | "refresh";
}






