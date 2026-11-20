import { test } from "node:test";
import assert from "node:assert/strict";
import { PNG } from "pngjs";
import { makeContactHandler } from "../server/contact-handler.js";
const env = {
  SITE_URL: "https://portfolio.example",
  GMAIL_USER: "owner@example.com",
  GMAIL_APP_PASSWORD: "test-only-app-password",
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-only-service-key",
};
const body = {
  name: "Visitor",
  email: "visitor@example.com",
  message: "A project worth discussing.",
  website: "",
};
test("a signed enquiry attaches its ink as a PNG and rejects invalid coordinates", async () => {
  const signature = [[[500, 500, 250], [900, 800, 185]]];
  let attachment;
  const response = await request({
    payload: { ...body, signature },
    sendMail: async (mail) => {
      [attachment] = mail.attachments;
      return { accepted: [mail.to] };
    },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(attachment.filename, "signature.png");
  const png = PNG.sync.read(attachment.content);
  assert.equal(png.width, 600);
  assert.equal(png.height, 360);
  assert.ok(png.data[(100 * png.width + 100) * 4] < 100);
  assert.equal(png.data[0], 255);
  const invalid = await request({ payload: { ...body, signature: [[[9000, 500, 250]]] } });
  assert.equal(invalid.statusCode, 400);
});
async function request({
  environment = env,
  method = "POST",
  origin = env.SITE_URL,
  payload = body,
  reserve = async () => true,
  sendMail = async () => ({ accepted: ["owner@example.com"] }),
} = {}) {
  const req = {
    method,
    headers: {
      origin,
      "content-type": "application/json",
      "x-vercel-forwarded-for": "192.0.2.1",
    },
    body: payload,
  };
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    end(data) {
      this.body = JSON.parse(data);
    },
  };
  await makeContactHandler({ env: environment, reserve, sendMail })(req, res);
  return res;
}
test("contact rejects wrong method, origin, malformed input and unconfigured sender", async () => {
  assert.equal((await request({ method: "GET" })).statusCode, 405);
  assert.equal(
    (await request({ origin: "https://attacker.example" })).statusCode,
    403,
  );
  for (const payload of [
    { ...body, name: "bad\nBCC: other@example.com" },
    { ...body, email: "bad\naddress@example.com" },
    { ...body, website: "bot" },
    { ...body, message: "tiny" },
    null,
    "not json",
  ])
    assert.equal((await request({ payload })).statusCode, 400);
  assert.equal(
    (await request({ environment: { SITE_URL: env.SITE_URL } })).statusCode,
    503,
  );
});
test("limits and failures never claim delivery; sending awaits SMTP acceptance", async () => {
  let sends = 0;
  assert.equal(
    (
      await request({
        reserve: async () => false,
        sendMail: async () => {
          sends++;
        },
      })
    ).statusCode,
    429,
  );
  assert.equal(sends, 0);
  assert.equal(
    (
      await request({
        reserve: async () => {
          throw Error("secret detail");
        },
      })
    ).statusCode,
    502,
  );
  const failed = await request({
    sendMail: async () => {
      throw Error("private credentials");
    },
  });
  assert.equal(failed.statusCode, 502);
  assert.ok(!JSON.stringify(failed).includes("private credentials"));
  assert.equal(
    (await request({ sendMail: async () => ({ accepted: [] }) })).statusCode,
    502,
  );
  const ok = await request({
    reserve: async (digest) => {
      assert.match(digest, /^[a-f0-9]{64}$/);
      return true;
    },
    sendMail: async (mail) => {
      assert.equal(mail.to, "syedsufyanpersonal@gmail.com");
      assert.equal(mail.from.address, env.GMAIL_USER);
      assert.equal(mail.replyTo.address, body.email);
      assert.equal(mail.subject, "New portfolio enquiry");
      assert.equal(mail.disableFileAccess, true);
      assert.equal(mail.disableUrlAccess, true);
      assert.equal(mail.html, undefined);
      return { accepted: [mail.to] };
    },
  });
  assert.equal(ok.statusCode, 200);
  assert.equal(ok.headers["Cache-Control"], "no-store");
});
