import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export default function Modal({ title, children, onClose, variant = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    const previous = document.activeElement;
    node.showModal();
    node.querySelector("input[type=text], input:not([type])")?.focus();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      node.close();
      document.body.style.overflow = before;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${variant}`}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <button
        autoFocus
        className="icon-button close"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={20} />
      </button>
      {children}
    </dialog>
  );
}
