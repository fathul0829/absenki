import { createClient } from '@insforge/sdk';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

// Singleton pattern — mencegah double-init di Next.js (hot reload)
let clientInstance: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (clientInstance) return clientInstance;

  clientInstance = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeAnonKey,
  });

  return clientInstance;
}

export const insforge = getClient();
