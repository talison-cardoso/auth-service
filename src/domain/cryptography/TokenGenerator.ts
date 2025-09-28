export interface TokenGenerator {
  generate(
    payload: object,
    expiresIn: string | number,
    tokenType: "access" | "refresh",
  ): Promise<string>;
}
