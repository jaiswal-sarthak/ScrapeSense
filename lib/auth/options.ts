import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { Resend } from "resend";
import nodemailer, { type TestAccount } from "nodemailer";
import { createSupabasePublicAdapter } from "@/lib/auth/supabase-adapter";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const resendFrom =
  process.env.RESEND_FROM ??
  process.env.EMAIL_FROM ??
  "onboarding@resend.dev";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Supabase adapter missing env configuration");
}

const smtpConfigured =
  Boolean(process.env.EMAIL_SERVER_HOST) &&
  Boolean(process.env.EMAIL_SERVER_USER) &&
  Boolean(process.env.EMAIL_SERVER_PASSWORD);

let smtpTransportPromise: Promise<nodemailer.Transporter> | null = null;

const getSmtpTransport = () => {
  if (smtpTransportPromise) return smtpTransportPromise;
  if (smtpConfigured) {
    smtpTransportPromise = Promise.resolve(
      nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        secure: Number(process.env.EMAIL_SERVER_PORT ?? 587) === 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      }),
    );
    return smtpTransportPromise;
  }

  smtpTransportPromise = nodemailer.createTestAccount().then((account: TestAccount) =>
    nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    }),
  );
  return smtpTransportPromise;
};

const sendMagicLinkEmail = async ({
  identifier,
  url,
}: {
  identifier: string;
  url: string;
}) => {
  const { host } = new URL(url);
  const subject = `Sign in to ${host}`;
  const text = `Sign in to ${host}\n${url}\n\n`;
  const html = `<p>Sign in to <strong>${host}</strong></p><p><a href="${url}">Click here to continue</a></p>`;

  if (resend) {
    const { error } = await resend.emails.send({
      from: resendFrom,
      to: identifier,
      subject,
      html,
      text,
    });
    if (error) {
      throw new Error(error.message ?? "Unable to send verification email");
    }
    return;
  }

  const transporter = await getSmtpTransport();
  const info = await transporter.sendMail({
    to: identifier,
    from: process.env.EMAIL_FROM ?? resendFrom,
    subject,
    text,
    html,
  });
  if (!smtpConfigured) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Preview magic link:", previewUrl);
  }
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
  adapter:
    supabaseUrl && supabaseServiceKey
      ? createSupabasePublicAdapter({
          url: supabaseUrl,
          secret: supabaseServiceKey,
        })
      : undefined,
  providers: [
    EmailProvider({
      from: resendFrom,
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail({ identifier, url });
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
  },
  pages: {
    signIn: "/signin",
  },
};

