import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { makeContactHandler } from "../server/contact-handler.js";

export function createGmailContactHandler(env) {
  return makeContactHandler({
    env,
    reserve: async (digest) => {
      const client = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      const { data, error } = await client.rpc("reserve_contact_send", {
        ip_digest: digest,
      });
      if (error) throw new Error("Contact limiter unavailable");
      return data === true;
    },
    sendMail: async (message) => {
      const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: env.GMAIL_USER,
          pass: env.GMAIL_APP_PASSWORD.replace(/\s/g, ""),
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 12000,
      });
      try {
        return await transport.sendMail(message);
      } finally {
        transport.close();
      }
    },
  });
}
export default createGmailContactHandler(process.env);
