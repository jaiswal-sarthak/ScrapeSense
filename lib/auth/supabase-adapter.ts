import { createClient } from "@supabase/supabase-js";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "@auth/core/adapters";

interface SupabaseAdapterOptions {
  url: string;
  secret: string;
  schema?: string;
}

export const createSupabasePublicAdapter = ({
  url,
  secret,
  schema = "public",
}: SupabaseAdapterOptions): Adapter => {
  const supabase = createClient(url, secret, {
    db: { schema },
    global: { headers: { "X-Client-Info": "custom-supabase-adapter" } },
    auth: { persistSession: false },
  });

  return {
    async createUser(user) {
      const { data, error } = await supabase
        .from("users")
        .insert(mapUserToDb(user))
        .select()
        .single();
      if (error) throw error;
      return mapUserFromDb(data);
    },
    async getUser(id) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? mapUserFromDb(data) : null;
    },
    async getUserByEmail(email) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      if (error) throw error;
      return data ? mapUserFromDb(data) : null;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const { data, error } = await supabase
        .from("accounts")
        .select("*, users(*)")
        .match({ provider, provider_account_id: providerAccountId })
        .maybeSingle();
      if (error) throw error;
      if (!data || !data.users) return null;
      return mapUserFromDb(data.users);
    },
    async updateUser(user) {
      const { data, error } = await supabase
        .from("users")
        .update(mapUserToDb(user))
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      return mapUserFromDb(data);
    },
    async deleteUser(userId) {
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if (error) throw error;
    },
    async linkAccount(account) {
      const { error } = await supabase.from("accounts").insert(mapAccountToDb(account));
      if (error) throw error;
    },
    async unlinkAccount({ providerAccountId, provider }) {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .match({ provider, provider_account_id: providerAccountId });
      if (error) throw error;
    },
    async createSession(session) {
      const { data, error } = await supabase
        .from("sessions")
        .insert(mapSessionToDb(session))
        .select()
        .single();
      if (error) throw error;
      return mapSessionFromDb(data);
    },
    async getSessionAndUser(sessionToken) {
      const { data, error } = await supabase
        .from("sessions")
        .select("*, users(*)")
        .eq("session_token", sessionToken)
        .maybeSingle();
      if (error) throw error;
      if (!data || !data.users) return null;
      return {
        user: mapUserFromDb(data.users),
        session: mapSessionFromDb(data),
      };
    },
    async updateSession(session) {
      const { data, error } = await supabase
        .from("sessions")
        .update(mapSessionToDb(session))
        .eq("session_token", session.sessionToken)
        .select()
        .single();
      if (error) throw error;
      return mapSessionFromDb(data);
    },
    async deleteSession(sessionToken) {
      const { error } = await supabase.from("sessions").delete().eq("session_token", sessionToken);
      if (error) throw error;
    },
    async createVerificationToken(token) {
      const { data, error } = await supabase
        .from("verification_tokens")
        .insert(mapVerificationTokenToDb(token))
        .select()
        .single();
      if (error) throw error;
      return mapVerificationTokenFromDb(data);
    },
    async useVerificationToken({ identifier, token }) {
      const { data, error } = await supabase
        .from("verification_tokens")
        .delete()
        .match({ identifier, token })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data ? mapVerificationTokenFromDb(data) : null;
    },
  };
};

type DbUser = {
  id: string;
  name: string | null;
  email: string;
  email_verified: string | null;
  image: string | null;
};

const mapUserFromDb = (user: DbUser): AdapterUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerified: user.email_verified ? new Date(user.email_verified) : null,
  image: user.image,
});

const mapUserToDb = (user: Partial<AdapterUser>) => {
  const payload: Record<string, unknown> = {};
  if (user.id) payload.id = user.id;
  if (user.name !== undefined) payload.name = user.name;
  if (user.email !== undefined) payload.email = user.email;
  if (user.emailVerified !== undefined) {
    payload.email_verified = user.emailVerified
      ? user.emailVerified.toISOString()
      : null;
  }
  if (user.image !== undefined) payload.image = user.image;
  return payload;
};

type DbAccount = {
  id?: number;
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
};

const mapAccountToDb = (account: AdapterAccount): DbAccount => ({
  user_id: account.userId,
  type: account.type,
  provider: account.provider,
  provider_account_id: account.providerAccountId,
  refresh_token: toNullableString(account.refresh_token),
  access_token: toNullableString(account.access_token),
  expires_at: account.expires_at ?? null,
  token_type: toNullableString(account.token_type),
  scope: toNullableString(account.scope),
  id_token: toNullableString(account.id_token),
  session_state: toNullableString(account.session_state),
});

type DbSession = {
  session_token: string;
  user_id: string;
  expires: string;
};

const mapSessionFromDb = (session: DbSession): AdapterSession => ({
  sessionToken: session.session_token,
  userId: session.user_id,
  expires: new Date(session.expires),
});

const mapSessionToDb = (
  session: AdapterSession | (Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">),
) => {
  const payload: Record<string, unknown> = {
    session_token: session.sessionToken,
  };
  if ("userId" in session && session.userId !== undefined) {
    payload.user_id = session.userId;
  }
  if (session.expires) {
    payload.expires = session.expires.toISOString();
  }
  return payload;
};

type DbVerificationToken = {
  identifier: string;
  token: string;
  expires: string;
};

const mapVerificationTokenFromDb = (
  token: DbVerificationToken,
): VerificationToken => ({
  identifier: token.identifier,
  token: token.token,
  expires: new Date(token.expires),
});

const mapVerificationTokenToDb = (token: VerificationToken) => ({
  identifier: token.identifier,
  token: token.token,
  expires: token.expires.toISOString(),
});

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
};

