import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { memoize } from 'lodash';

const { PROJECT_ID } = process.env;

async function getSecret({
  secretName,
  version = 'latest',
}: {
  secretName: string;
  version?: string | number;
}): Promise<string> {
  const secretPath = `projects/${PROJECT_ID}/secrets/${secretName}/versions/${version}`;
  const client = new SecretManagerServiceClient();
  const [secret] = await client.accessSecretVersion({ name: secretPath });

  const payload = secret.payload?.data?.toString();
  if (!payload) {
    throw new Error(`Failed to retrieve secret data for secret: ${secretName}`);
  }

  return payload;
}

export async function getParsedSecret<T extends Record<string, unknown>>({
  secretName,
  version,
}: {
  secretName: string;
  version?: string | number;
}): Promise<T> {
  const payload = await getSecret({ secretName, version });

  return JSON.parse(payload);
}

export const getMemoizedSecret = memoize(getSecret);
export const getMemoizedParsedSecret = memoize(getParsedSecret);
