import { AuthRepository } from "./auth.repository";
import { AuthenticatedApiClient } from "./auth.types";
import {
  parseApiToken,
  verifyApiTokenSecret,
} from "../../shared/utils/token";

export class AuthService {
  constructor(
    private readonly authRepository = new AuthRepository(),
  ) {}

  async authenticate(
    token: string,
  ): Promise<AuthenticatedApiClient | null> {
    const parsedToken = parseApiToken(token);

    if (!parsedToken) {
      return null;
    }

    const tokenRecord =
      await this.authRepository.findValidTokenById(
        parsedToken.tokenId,
      );

    if (!tokenRecord) {
      return null;
    }

    const isValidSecret = verifyApiTokenSecret(
      parsedToken.secret,
      tokenRecord.tokenHash,
    );

    if (!isValidSecret) {
      return null;
    }

    return {
      clientId: tokenRecord.clientId,
      companyName: tokenRecord.companyName,
      tokenId: tokenRecord.tokenId,
    };
  }
}