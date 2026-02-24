export type UserRole = "admin" | "tutor" | "student";

export interface JwtPayload {
  sub: number;
  role: UserRole;
  type: "access" | "refresh";
}






