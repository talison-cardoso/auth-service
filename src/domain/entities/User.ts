export class User {
  constructor(
    public username: string,
    public passwordHash: string,
    public id: string,
    public email?: string | null,
    public refreshToken?: string | null,
  ) {}
}
