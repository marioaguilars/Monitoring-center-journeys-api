import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const TOKEN_PREFIX = "mcj"; // Monitoring Center Journeys
const TOKEN_ID_BYTES = 16;
const TOKEN_SECRET_BYTES = 32;

export interface GeneratedApiToken {
  token: string;
  tokenId: string;
  tokenHash: string;
}

export const hashApiTokenSecret = (secret: string): string => {
  return createHash("sha256")
    .update(secret, "utf8")
    .digest("hex");
};

export interface ParsedApiToken {
  tokenId: string;
  secret: string;
}

export const parseApiToken = (
  token: string,
): ParsedApiToken | null => {
  const match = /^mcj_([a-f0-9]{32})\.([A-Za-z0-9_-]{43})$/.exec(
    token,
  );

  if (!match) {
    return null;
  }

  return {
    tokenId: match[1],
    secret: match[2],
  };
};

export const verifyApiTokenSecret = (
  secret: string,
  expectedHash: string,
): boolean => {
  if (!/^[a-f0-9]{64}$/.test(expectedHash)) {
    return false;
  }

  const actualHash = hashApiTokenSecret(secret);

  const encoder = new TextEncoder();

  const actualBuffer = encoder.encode(actualHash);
  const expectedBuffer = encoder.encode(expectedHash);

  return timingSafeEqual(actualBuffer, expectedBuffer);
};

export const generateApiToken = (): GeneratedApiToken => {
  const tokenId = randomBytes(TOKEN_ID_BYTES).toString("hex");

  const secret = randomBytes(TOKEN_SECRET_BYTES).toString("base64url");

  const tokenHash = hashApiTokenSecret(secret);

    return {
    token: `${TOKEN_PREFIX}_${tokenId}.${secret}`,
    tokenId,
    tokenHash,
    };
};