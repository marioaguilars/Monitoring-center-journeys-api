export interface ApiTokenAuthRecord {
  clientId: number;
  companyName: string;
  tokenId: string;
  tokenHash: string;
}

export interface AuthenticatedApiClient {
  clientId: number;
  companyName: string;
  tokenId: string;
}