export function ProjectTitle({ title }) {
  const words = title.trim().split(/\s+/);
  const last = words.pop();
  return (
    <>
      {words.length > 0 && words.join(" ") + " "}
      <em>{last}</em>
    </>
  );
}

export function ProjectDescription({ project }) {
  return project.id === "fee-portal"
    ? "A simpler path from fees to receipts, built for National Engineering College."
    : project.description;
}

export function BrowserBar() {
  return (
    <span className="cin-bar" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
