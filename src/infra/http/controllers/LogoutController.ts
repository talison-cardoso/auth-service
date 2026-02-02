export class LogoutController extends BaseController {
  constructor(private logoutUseCase: LogoutUseCase) {
    super();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await this.logoutUseCase.execute(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // cross-domain
      path: "/refresh",
    });

    return res.status(204).send();
  }
}
