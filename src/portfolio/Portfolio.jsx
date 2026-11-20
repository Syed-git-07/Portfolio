import { lazy, Suspense, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { initialContent, validateContent } from "./content";
import { backend } from "./backend";
import "./portfolio.css";
import Experience from "./Experience";
const Studio = lazy(() => import("./Studio"));
export default function Portfolio() {
  const [content, setContent] = useState(initialContent);
  const [route, setRoute] = useState(location.hash);
  useEffect(() => {
    const fn = () => setRoute(location.hash);
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    let live = true;
    if (backend)
      backend
        .from("portfolio_content")
        .select("data")
        .eq("id", "main")
        .maybeSingle()
        .then(({ data }) => {
          if (data && live) {
            try {
              setContent(validateContent(data.data));
            } catch {
              /* Retain the checked-in snapshot when remote data is invalid. */
            }
          }
        });
    return () => {
      live = false;
    };
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      {route === "#/syed" || route === "#/studio" ? (
        <Suspense fallback={<div className="loading">Opening studio…</div>}>
          <Studio content={content} onPublish={setContent} />
        </Suspense>
      ) : (
        <Experience content={content} />
      )}
    </MotionConfig>
  );
}
