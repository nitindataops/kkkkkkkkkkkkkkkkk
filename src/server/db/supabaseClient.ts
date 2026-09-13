import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let connectionTested = false;
let isConnected = false;
let isSchemaReady = false;
let lastConnectionError: string | null = null;

export interface SupabaseConfigStatus {
  configured: boolean;
  hasUrl: boolean;
  hasServiceRoleKey: boolean;
  hasAnonKey: boolean;
  url: string | null;
  connected: boolean;
  schemaReady: boolean;
  lastError: string | null;
}

/**
 * Checks whether an error is due to missing PostgreSQL tables / schema cache
 */
export function isSchemaMissingError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const msg = String(error.message || error.details || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table') ||
    msg.includes('does not exist') ||
    (msg.includes('relation') && msg.includes('does not exist'))
  );
}

/**
 * Returns true if the required Supabase environment variables are present.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();
  return Boolean(url && url.startsWith('http') && key && key.length > 10);
}

/**
 * Returns true if Supabase is connected AND the database tables have been created.
 */
export function isSupabaseSchemaReady(): boolean {
  return isConnected && isSchemaReady;
}

/**
 * Explicitly updates the schema readiness status.
 */
export function setSupabaseSchemaReady(ready: boolean): void {
  isSchemaReady = ready;
}

/**
 * Gets or initializes the server-side Supabase client.
 * Uses the high-privilege service_role key when available for administrative backend operations,
 * falling back to anon key.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || anonKey;

  if (!url || !key) {
    return null;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
    });
    return cachedClient;
  } catch (err: any) {
    console.warn('[SupabaseClient] Initialization warning:', err?.message || err);
    lastConnectionError = err?.message || String(err);
    return null;
  }
}

/**
 * Validates connection to the Supabase PostgreSQL database.
 */
export async function testSupabaseConnection(forceCheck = false): Promise<{
  connected: boolean;
  schemaReady: boolean;
  latencyMs?: number;
  message: string;
}> {
  if (connectionTested && !forceCheck) {
    return {
      connected: isConnected,
      schemaReady: isSchemaReady,
      message: isConnected
        ? isSchemaReady
          ? 'Supabase connection active and schema ready.'
          : 'Connected to Supabase PostgreSQL (schema tables pending initialization in Supabase SQL Editor).'
        : (lastConnectionError || 'Supabase connection inactive.'),
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      schemaReady: false,
      message: 'Supabase credentials not configured. Please supply SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    };
  }

  const startTime = Date.now();
  try {
    // Lightweight test query against users table
    const { data, error } = await client.from('users').select('id').limit(1);

    if (error) {
      if (isSchemaMissingError(error)) {
        isConnected = true;
        isSchemaReady = false;
        connectionTested = true;
        lastConnectionError = null;
        return {
          connected: true,
          schemaReady: false,
          latencyMs: Date.now() - startTime,
          message: 'Connected to Supabase PostgreSQL (schema tables pending initialization in Supabase SQL Editor).',
        };
      }

      isConnected = false;
      isSchemaReady = false;
      connectionTested = true;
      lastConnectionError = error.message;
      return {
        connected: false,
        schemaReady: false,
        latencyMs: Date.now() - startTime,
        message: `Supabase query error: ${error.message} (Code: ${error.code})`,
      };
    }

    isConnected = true;
    isSchemaReady = true;
    connectionTested = true;
    lastConnectionError = null;
    return {
      connected: true,
      schemaReady: true,
      latencyMs: Date.now() - startTime,
      message: 'Supabase connection verified successfully with active schema.',
    };
  } catch (err: any) {
    isConnected = false;
    isSchemaReady = false;
    connectionTested = true;
    lastConnectionError = err?.message || String(err);
    return {
      connected: false,
      schemaReady: false,
      latencyMs: Date.now() - startTime,
      message: `Supabase connection failed: ${err?.message || err}`,
    };
  }
}

/**
 * Returns overall diagnostic information about the Supabase configuration.
 */
export function getSupabaseStatus(): SupabaseConfigStatus {
  const url = process.env.SUPABASE_URL?.trim() || null;
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const hasAnonKey = Boolean(process.env.SUPABASE_ANON_KEY?.trim());

  return {
    configured: isSupabaseConfigured(),
    hasUrl: Boolean(url),
    hasServiceRoleKey,
    hasAnonKey,
    url: url ? url.replace(/(https?:\/\/)([^@]+@)?([^\/]+).*/, '$1$3') : null,
    connected: isConnected,
    schemaReady: isSchemaReady,
    lastError: lastConnectionError,
  };
}
