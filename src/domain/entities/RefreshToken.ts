export class RefreshToken {
  public readonly userId: string;
  public readonly token: string;
  public readonly expiresAt: Date;
  public readonly revoked: boolean;

  constructor(props: {
    userId: string;
    token: string;
    expiresAt: Date;
    revoked: boolean;
  }) {
    this.userId = props.userId;
    this.token = props.token;
    this.expiresAt = props.expiresAt;
    this.revoked = props.revoked;
  }

  public isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  public isUsable(): boolean {
    return !this.revoked && !this.isExpired();
  }
}
