import { FillControl } from "./HomeInteractions";
import ValidationThreads from "./ValidationThreads";
import { SignaturePad } from "./reference/SignaturePad";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { contactEndpoint } from "./backend";

const localAnimationTrial =
  import.meta.env.DEV &&
  ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);

export default function Contact({ profile }) {
  const [signature, setSignature] = useState(null);
  const [padVersion, setPadVersion] = useState(0);
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
    website: "",
  });
  const [phase, setPhase] = useState("writing");
  const [error, setError] = useState("");
  const [caret, setCaret] = useState({ field: "name", offset: 0 });
  const sheet = useRef(null),
    marker = useRef(null);
  function track(event) {
    setCaret({
      field: event.target.name,
      offset: event.target.selectionEnd ?? event.target.value.length,
    });
  }
  function ink(field) {
    const value = values[field];
    return caret.field === field ? (
      <>
        {value.slice(0, caret.offset)}
        <i className="ink-point" ref={marker} />
        {value.slice(caret.offset)}
      </>
    ) : (
      value
    );
  }
  useLayoutEffect(() => {
    const paper = sheet.current,
      point = marker.current;
    if (!paper || !point) return;
    const position = () => {
      const line = point.closest(".ink-line");
      if (line) {
        line.scrollTop +=
          point.getBoundingClientRect().bottom -
            line.getBoundingClientRect().bottom >
          0
            ? point.getBoundingClientRect().bottom -
              line.getBoundingClientRect().bottom
            : Math.min(
                0,
                point.getBoundingClientRect().top -
                  line.getBoundingClientRect().top,
              );
      }
      const a = paper.getBoundingClientRect(),
        b = point.getBoundingClientRect();
      paper.style.setProperty("--pen-x", b.left - a.left + "px");
      paper.style.setProperty("--pen-y", b.bottom - a.top + "px");
    };
    position();
    const observer = new ResizeObserver(position);
    observer.observe(paper);
    return () => observer.disconnect();
  }, [caret, values]);
  const scene = useRef(null);
  const locked = phase !== "writing";
  const [finished, setFinished] = useState(false);
  useLayoutEffect(() => {
    if (phase !== "sent") return;
    const flight = scene.current.querySelector(".mail-object").getAnimations();
    let active = true;
    Promise.allSettled(flight.map((animation) => animation.finished)).then(
      () => {
        if (active) setFinished(true);
      },
    );
    return () => {
      active = false;
    };
  }, [phase]);
  function reset() {
    setFinished(false);
    setPhase("writing");
    setSignature(null);
    setPadVersion((v) => v + 1);
    setValues({ name: "", email: "", message: "", website: "" });
    requestAnimationFrame(() =>
      document.querySelector("#contact input[name=name]")?.focus(),
    );
  }
  function dispatchLetter() {
    if (scene.current.getBoundingClientRect().top > window.innerHeight * 0.75) {
      scene.current.scrollIntoView({ block: "center", behavior: "instant" });
    }
    setPhase("sent");
  }
  async function submit(e) {
    e.preventDefault();
    if (locked) return;
    setError("");
    if (values.website) {
      setError("Please leave the website field empty.");
      return;
    }
    if (localAnimationTrial) {
      setPhase("sending");
      await new Promise((resolve) => window.setTimeout(resolve, 200));
      dispatchLetter();
      return;
    }
    if (!contactEndpoint) {
      setError(
        "Online sending is not connected yet. Please use the email link below.",
      );
      return;
    }
    setPhase("sending");
    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          signature,
          name: values.name,
          email: values.email,
          message: values.message,
          website: values.website,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (response.status === 503)
        throw new Error(
          "Online sending is not connected yet. Please use the email link below.",
        );
      if (response.status === 429)
        throw new Error(
          "Too many messages. Please try later or email me directly.",
        );
      if (!response.ok)
        throw new Error(
          "Your message could not be sent. Please try again or email me directly.",
        );
      dispatchLetter();
    } catch (e) {
      setPhase("writing");
      setError(
        e.name === "TimeoutError"
          ? "The request timed out. Your draft is still here; please retry or email me."
          : e.message,
      );
    }
  }
  const renderNote = (fieldValue) => (
    <>
      <div className="note-meta">
        <span>CONTACT NOTE</span>
        <span>
          {new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date())}
        </span>
      </div>
      <div className="note-row">
        <small>Name</small>
        <span className="ink-line">{fieldValue("name")}</span>
      </div>
      <div className="note-row">
        <small>From</small>
        <span className="ink-line">{fieldValue("email")}</span>
      </div>
      <div className="ink-line letter-message">
        <small>Message</small>{fieldValue("message")}
      </div>
    </>
  );
  const letterContent = renderNote(ink);
  const flatContent =
    phase === "sent" ? renderNote((field) => values[field]) : null;
  return (
    <section id="contact" className="contact section">
      <div className="contact-grid">
        <div className="contact-column">
          <div className="section-heading">
            <h2>
              Let’s talk
              <br />
              about your
              <br />
              project.
            </h2>
          </div>
          <form
            onSubmit={submit}
            className="contact-form"
            onSelect={track}
            onFocus={(e) => {
              if (["name", "email", "message"].includes(e.target.name))
                track(e);
            }}
            onInput={track}
          >
            <strong className="form-title">Contact Syed</strong>
            <div className="form-pair">
              <label>
                Your name
                <input
                  required
                  maxLength={100}
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  disabled={locked}
                  onChange={(e) =>
                    setValues({ ...values, name: e.target.value })
                  }
                />
              </label>
              <label>
                Email address
                <input
                  required
                  maxLength={254}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={values.email}
                  disabled={locked}
                  onChange={(e) =>
                    setValues({ ...values, email: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Message
              <textarea
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                name="message"
                value={values.message}
                disabled={locked}
                onChange={(e) =>
                  setValues({ ...values, message: e.target.value })
                }
              />
            </label>
            <label className="honeypot" aria-hidden="true">
              Website
              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={(e) =>
                  setValues({ ...values, website: e.target.value })
                }
              />
            </label>
            <fieldset
              className="signature-field"
              disabled={locked}
              inert={locked}
            >
              <legend>
                Signature <small>(optional)</small>
              </legend>
              <SignaturePad key={padVersion} onChange={setSignature} />
            </fieldset>
            <div aria-live="polite">
              {error && <p className="error">{error}</p>}
            </div>
            <div className="contact-actions">
              <small className="message-count">
                {values.message.length} / 5000
              </small>
              <FillControl disabled={locked}>
                {finished ? "Done" : locked ? "Sending…" : "Send message"}
              </FillControl>
            </div>
            <ValidationThreads />
          </form>
          <a className="email-link" href={`mailto:${profile.email}`}>
            {profile.email}
            <ArrowUpRight size={15} />
          </a>
        </div>
        <div className={`letter-scene ${phase}`} ref={scene}>
          <div className="mail-object" aria-hidden="true">
            <div className="envelope-back" />
            <div className="mail-pocket">
              <div className="letter" ref={sheet}>
                <div className="paper-content">{letterContent}</div>
                {phase === "sent" &&
                  ["upper", "lower"].map((side) => (
                    <div key={side} className={`paper-fold ${side}`}>
                      <div className="paper-face">
                        <div className="paper-copy">{flatContent}</div>
                      </div>
                      <div className="paper-reverse" />
                    </div>
                  ))}
                <span className="pen" />
              </div>
            </div>
            <div className="envelope-front" />
            <div className="envelope-flap" />
            <div className="seal" />
          </div>
          {finished && (
            <div className="sent-stamp">
              <Check size={30} aria-hidden="true" />
              {!localAnimationTrial && (
                <strong role="status">Message sent</strong>
              )}
              <button type="button" className="contact-send" onClick={reset}>
                Write another
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
