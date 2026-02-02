export interface TokenVerifier {
  verify<T extends object>(
    token: string,
    tokenType: "access" | "refresh",
  ): Promise<T>;
}
