import type { CreateUserDTO } from "../dtos/CreateUserDTO";
import type { User } from "../entities/User";

export interface UserRepository {
  findById(id: string): Promise<User | null>; //
  findByUsername(username: string): Promise<User | null>; //
  findAll(): Promise<User[]>; //
  create(user: CreateUserDTO): Promise<User>; //
  update(id: string, user: User): Promise<User>; //
  delete(id: string): Promise<void>; //
  // REMOVIDO: updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;
}
