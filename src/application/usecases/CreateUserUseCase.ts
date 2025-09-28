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
    const usernameExists = await this.userRepository.findByUsername(
      data.username,
    );

    if (usernameExists) throw new Error("Username already exists");

    const hashedPassword = await this.hasher.hash(data.password);

    return await this.userRepository.create({
      username: data.username,
      password: hashedPassword,
      email: data.email,
    });
  }
}
