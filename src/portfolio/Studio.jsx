import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Download,
  Plus,
  Upload,
  LogOut,
  Trash2,
} from "lucide-react";
import { backend } from "./backend";
import { initialContent, validateContent, safeUrl } from "./content";
const sections = [
  "profile",
  "projects",
  "skills",
  "education",
  "certificates",
  "achievements",
  "pages",
];
const longFields = [
  "headline",
  "intro",
  "about",
  "description",
  "detail",
  "body",
  "items",
];
const mediaFields = ["photo", "resume", "image", "file"];
const linkFields = [
  "github",
  "linkedin",
  "leetcode",
  "url",
  "source",
  ...mediaFields,
];

async function prepareFile(file) {
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Choose a file smaller than 10 MB.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const prefix = String.fromCharCode(...bytes);
  if (file.type === "application/pdf" && prefix.startsWith("%PDF-"))
    return { blob: file, ext: "pdf", type: "application/pdf" };
  const valid =
    (file.type === "image/png" &&
      bytes[0] === 137 &&
      prefix.slice(1, 4) === "PNG") ||
    (file.type === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216) ||
    (file.type === "image/webp" &&
      prefix.startsWith("RIFF") &&
      prefix.slice(8) === "WEBP");
  if (!valid) throw new Error("Choose a PNG, JPEG, WebP image or PDF.");
  const image = await createImageBitmap(file);
  if (image.width * image.height > 40000000) {
    image.close();
    throw new Error("Choose an image below 40 megapixels.");
  }
  const scale = Math.min(1, 2000 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.88),
  );
  if (!blob) throw new Error("Could not process this image.");
  return { blob, ext: "webp", type: "image/webp" };
}
function download(data) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "portfolio-content.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Studio({ content, onPublish }) {
  const [session, setSession] = useState(null),
    [owner, setOwner] = useState(false),
    [preview, setPreview] = useState(false),
    [draft, setDraft] = useState(() => structuredClone(content)),
    [section, setSection] = useState("profile"),
    [version, setVersion] = useState(0),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  useEffect(() => {
    if (!backend) return;
    const {
      data: { subscription },
    } = backend.auth.onAuthStateChange((_event, value) => {
      setSession(value);
      if (!value) setOwner(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const { data, error } = await backend.auth.signInWithPassword({
        email,
        password,
      });
      if (error)
        throw new Error("Sign-in failed. Check your email and password.");
      const result = await backend.rpc("is_portfolio_owner");
      if (result.error || result.data !== true) {
        await backend.auth.signOut();
        throw new Error("This account cannot edit the portfolio.");
      }
      setSession(data.session);
      setOwner(true);
      setPassword("");
      const loaded = await backend
        .from("portfolio_content")
        .select("data,version")
        .eq("id", "main")
        .maybeSingle();
      if (loaded.error) throw loaded.error;
      if (loaded.data) {
        setDraft(structuredClone(validateContent(loaded.data.data)));
        setVersion(loaded.data.version);
      }
      setDirty(false);
    } catch (e) {
      setOwner(false);
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }
  function change(next) {
    setDraft(next);
    setDirty(true);
    setStatus("");
  }
  function setField(index, key, value) {
    if (section === "profile")
      change({ ...draft, profile: { ...draft.profile, [key]: value } });
    else
      change({
        ...draft,
        [section]: draft[section].map((item, i) =>
          i === index ? { ...item, [key]: value } : item,
        ),
      });
  }
  async function upload(file, index, key) {
    if (!file) return;
    setBusy(true);
    setStatus("");
    try {
      if (!session || !owner) throw new Error("Sign in to upload files.");
      const prepared = await prepareFile(file);
      if (
        ["photo", "image"].includes(key) &&
        prepared.type === "application/pdf"
      )
        throw new Error("Choose an image for this field.");
      const path = `${session.user.id}/${crypto.randomUUID()}.${prepared.ext}`;
      const result = await backend.storage
        .from("portfolio-media")
        .upload(path, prepared.blob, {
          contentType: prepared.type,
          upsert: false,
        });
      if (result.error) throw result.error;
      const { data } = backend.storage
        .from("portfolio-media")
        .getPublicUrl(path);
      setField(index, key, data.publicUrl);
      setStatus("Uploaded. Publish to show this file.");
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    setBusy(true);
    setStatus("");
    try {
      validateContent(draft);
      for (const item of [
        draft.profile,
        ...draft.projects,
        ...draft.certificates,
        ...draft.pages,
      ])
        for (const key of linkFields)
          if (
            item[key] &&
            !safeUrl(item[key], mediaFields.includes(key) ? "media" : "link")
          )
            throw new Error(`Use a secure URL for ${key}.`);
      const { data, error } = await backend.rpc("publish_portfolio", {
        new_data: draft,
        expected_version: version,
      });
      if (error)
        throw new Error(
          error.message.includes("version_conflict")
            ? "A newer version was published elsewhere. Export your draft, then sign in again to reload."
            : error.message,
        );
      setVersion(data);
      setDirty(false);
      onPublish(structuredClone(draft));
      setStatus("Published.");
    } catch (e) {
      setStatus(e.message);
    } finally {
      setBusy(false);
    }
  }
  function add() {
    const item =
      section === "pages"
        ? { id: crypto.randomUUID(), title: "New page", body: "", image: "" }
        : Object.fromEntries(
            Object.keys(initialContent[section][0]).map((k) => [
              k,
              k === "id"
                ? crypto.randomUUID()
                : k === "title"
                  ? "New item"
                  : k === "visual"
                    ? "campus"
                    : "",
            ]),
          );
    change({ ...draft, [section]: [...draft[section], item] });
  }
  function remove(index) {
    if (!confirm(`Remove ${draft[section][index].title}?`)) return;
    change({
      ...draft,
      [section]: draft[section].filter((_, i) => i !== index),
    });
  }
  function move(index, dir) {
    const items = [...draft[section]];
    [items[index], items[index + dir]] = [items[index + dir], items[index]];
    change({ ...draft, [section]: items });
  }
  function leave() {
    if (dirty && !confirm("Leave without publishing changes?")) return;
    location.hash = "#home";
  }
  async function signOut() {
    if (dirty && !confirm("Sign out without publishing changes?")) return;
    if (backend) await backend.auth.signOut();
    setOwner(false);
    setPreview(false);
    setSession(null);
    setDirty(false);
    setDraft(structuredClone(content));
    setStatus("");
  }
  const editing = owner || preview;
  return (
    <div className="studio">
      <div className="studio-bar">
        <div>
          <button
            className="text-link"
            style={{ border: 0, background: "none" }}
            onClick={leave}
          >
            <ArrowLeft size={14} />
            Portfolio
          </button>
          <h1>Content studio</h1>
        </div>
        {editing && (
          <div className="studio-actions">
            <button className="button outline" onClick={() => download(draft)}>
              <Download size={14} />
              Export
            </button>
            <button className="button outline" onClick={signOut}>
              <LogOut size={14} />
              Sign out
            </button>
            {owner && (
              <button className="button dark" disabled={busy} onClick={publish}>
                {busy ? "Saving…" : "Publish changes"}
              </button>
            )}
          </div>
        )}
      </div>
      {!editing ? (
        <form className="login-card" onSubmit={login}>
          <h2>Welcome back.</h2>
          {backend ? (
            <>
              <label>
                Email
                <input
                  autoComplete="username"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  autoComplete="current-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="button dark" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </>
          ) : (
            <>
              <p>Owner sign-in is not connected yet.</p>
              <button
                type="button"
                className="button outline"
                onClick={() => setPreview(true)}
              >
                Preview editor
              </button>
            </>
          )}
          <p role="status">{status}</p>
        </form>
      ) : (
        <>
          {preview && (
            <p className="preview-note">
              Editor preview. Changes can be exported; publishing and uploads
              require owner sign-in.
            </p>
          )}
          <div className="studio-tabs" aria-label="Content sections">
            {sections.map((s) => (
              <button
                key={s}
                aria-pressed={section === s}
                onClick={() => setSection(s)}
              >
                {section === s && (
                  <motion.span
                    className="studio-tab-active"
                    layoutId="studio-tab-active"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span>{s}</span>
              </button>
            ))}
          </div>
          <p className="studio-status" role="status">
            {status || (dirty ? "Unpublished changes" : "")}
          </p>
          <fieldset
            disabled={busy}
            style={{ border: 0, padding: 0, margin: 0 }}
          >
            {(section === "profile" ? [draft.profile] : draft[section]).map(
              (item, index) => (
                <div
                  className="editor-item"
                  key={section === "profile" ? "profile" : item.id}
                >
                  <h3>{item.title || "Profile"}</h3>
                  <div className="editor-fields">
                    {Object.entries(item)
                      .filter(([key]) => key !== "id")
                      .map(([key, value]) => (
                        <label
                          key={key}
                          className={
                            longFields.includes(key) ||
                            mediaFields.includes(key)
                              ? "editor-field-wide"
                              : ""
                          }
                        >
                          {key}
                          {longFields.includes(key) ? (
                            <textarea
                              aria-label={key}
                              value={value}
                              maxLength={key === "body" ? 20000 : 6000}
                              rows={key === "body" ? 10 : 3}
                              onChange={(e) =>
                                setField(index, key, e.target.value)
                              }
                            />
                          ) : key === "visual" ? (
                            <select
                              aria-label={key}
                              value={value}
                              onChange={(e) =>
                                setField(index, key, e.target.value)
                              }
                            >
                              {[
                                "production",
                                "payment",
                                "risk",
                                "schedule",
                                "campus",
                                "video",
                              ].map((v) => (
                                <option key={v}>{v}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              aria-label={key}
                              value={value}
                              maxLength={2000}
                              type={key === "email" ? "email" : "text"}
                              onChange={(e) =>
                                setField(index, key, e.target.value)
                              }
                            />
                          )}{" "}
                          {mediaFields.includes(key) && owner && (
                            <span className="upload-field">
                              <Upload size={14} />
                              <input
                                aria-label={`Upload ${key} for ${item.title || "profile"}`}
                                type="file"
                                accept={
                                  ["photo", "image"].includes(key)
                                    ? "image/png,image/jpeg,image/webp"
                                    : "image/png,image/jpeg,image/webp,application/pdf"
                                }
                                onChange={(e) => {
                                  upload(e.target.files[0], index, key);
                                  e.target.value = "";
                                }}
                              />
                            </span>
                          )}
                        </label>
                      ))}
                  </div>
                  {section !== "profile" && (
                    <div className="editor-item-actions">
                      <button
                        className="icon-button"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        aria-label={`Move ${item.title} up`}
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        className="icon-button"
                        disabled={index === draft[section].length - 1}
                        onClick={() => move(index, 1)}
                        aria-label={`Move ${item.title} down`}
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        className="button delete-button"
                        onClick={() => remove(index)}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ),
            )}
            {section !== "profile" && (
              <button className="button outline" onClick={add}>
                <Plus size={15} />
                Add {section === "pages" ? "page" : "item"}
              </button>
            )}
          </fieldset>
        </>
      )}
    </div>
  );
}
