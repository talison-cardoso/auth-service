import { AppError } from "@/domain/errors/AppError";
import type { Hasher } from "../../domain/cryptography/Hasher";
import type { CreateUserDTO } from "../../domain/dtos/CreateUserDTO";
import type { User } from "../../domain/entities/User";
import type { UserRepository } from "../../domain/repositories/UserRepository";

export class CreateUser {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: Hasher,
  ) {}

  async execute(data: CreateUserDTO): Promise<User | Error> {
    const userExists = await this.userRepository.findByUsername(data.username);

    if (userExists) throw new AppError("Username already exists", 409);

    const hashedPassword = await this.hasher.hash(data.password);

    return await this.userRepository.create({
      username: data.username,
      password: hashedPassword,
      email: data.email,
    });
  }
}
