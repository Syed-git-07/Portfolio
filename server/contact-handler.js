import { validSignature, signatureImage } from "./signature-image.js";
import { createHmac } from "node:crypto";

export function makeContactHandler({ env, sendMail, reserve }) {
  return async function contact(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    const reply = (status, message) => {
      res.statusCode = status;
      res.end(JSON.stringify({ ok: status === 200, message }));
    };
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return reply(405, "Method not allowed.");
    }
    const origins = [
      env.SITE_URL,
      env.VERCEL_URL ? `https://${env.VERCEL_URL}` : null,
    ]
      .filter(Boolean)
      .map((x) => {
        try {
          return new URL(x).origin;
        } catch {
          return "";
        }
      });
    if (!origins.includes(req.headers.origin))
      return reply(403, "Request not allowed.");
    if (
      !String(req.headers["content-type"] || "")
        .toLowerCase()
        .startsWith("application/json")
    )
      return reply(415, "Use JSON.");
    if (
      !env.GMAIL_USER ||
      !env.GMAIL_APP_PASSWORD ||
      !env.SUPABASE_URL ||
      !env.SUPABASE_SERVICE_ROLE_KEY
    )
      return reply(503, "Contact is not configured.");
    if (Number(req.headers["content-length"]) > 65536)
      return reply(413, "Message too large.");
    let body = req.body;
    try {
      if (body === undefined) {
        let raw = "";
        for await (const chunk of req) {
          raw += chunk.toString();
          if (Buffer.byteLength(raw) > 65536)
            return reply(413, "Message too large.");
        }
        body = JSON.parse(raw);
      } else if (typeof body === "string") body = JSON.parse(body);
      if (Buffer.byteLength(JSON.stringify(body)) > 65536)
        return reply(413, "Message too large.");
    } catch {
      return reply(400, "Invalid request.");
    }
    if (!body || typeof body !== "object")
      return reply(400, "Invalid request.");
    const { name, email, message, website } = body;
    if (
      typeof name !== "string" ||
      name.trim().length < 1 ||
      name.length > 100 ||
      /[\r\n]/.test(name) ||
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
      typeof message !== "string" ||
      message.trim().length < 10 ||
      message.length > 5000 ||
      website
    )
      return reply(400, "Check your message details.");
    if(body.signature != null && !validSignature(body.signature)) return reply(400,"Invalid signature.");
    const ip = String(
      req.headers["x-vercel-forwarded-for"] ||
        req.socket?.remoteAddress ||
        "unknown",
    )
      .split(",")[0]
      .trim();
    const digest = createHmac("sha256", env.GMAIL_APP_PASSWORD)
      .update(ip)
      .digest("hex");
    try {
      if (!(await reserve(digest))) return reply(429, "Please try later.");
      const result = await sendMail({
        from: { name: "Portfolio enquiries", address: env.GMAIL_USER },
        to: env.CONTACT_TO || "syedsufyanpersonal@gmail.com",
        replyTo: { name: name.trim(), address: email.trim() },
        subject: "New portfolio enquiry",
        text: `From: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`,
        ...(body.signature ? {attachments:[{filename:"signature.png",contentType:"image/png",content:signatureImage(body.signature)}]} : {}),
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      if (!result?.accepted?.length)
        return reply(502, "Mail could not be accepted.");
      return reply(200, "Message accepted.");
    } catch {
      return reply(502, "Could not send. Please retry later.");
    }
  };
}
