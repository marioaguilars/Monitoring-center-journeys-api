import { RowDataPacket } from "mysql2";
import { pool } from "../../config/db";
import { ApiTokenAuthRecord } from "./auth.types";

interface ApiTokenRow extends RowDataPacket {
  clientId: number;
  companyName: string;
  tokenId: string;
  tokenHash: string;
}

export class AuthRepository {
  async findValidTokenById(
    tokenId: string,
  ): Promise<ApiTokenAuthRecord | null> {
    const [rows] = await pool.execute<ApiTokenRow[]>(
      `
        SELECT
          c.id AS clientId,
          c.company_name AS companyName,
          t.token_id AS tokenId,
          t.token_hash AS tokenHash
        FROM api_tokens t
        INNER JOIN api_clients c
          ON c.id = t.client_id
        WHERE t.token_id = ?
          AND c.is_active = 1
          AND t.revoked_at IS NULL
          AND t.expires_at > UTC_TIMESTAMP()
        LIMIT 1
      `,
      [tokenId],
    );

    const row = rows[0];

    if (!row) {
      return null;
    }

    return {
      clientId: row.clientId,
      companyName: row.companyName,
      tokenId: row.tokenId,
      tokenHash: row.tokenHash,
    };
  }
}