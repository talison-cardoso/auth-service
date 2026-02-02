import bcrypt from "bcrypt";
import type { Hasher } from "../../domain/cryptography/Hasher";

export class BcryptHasher implements Hasher {
  private readonly saltRounds = 12;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
