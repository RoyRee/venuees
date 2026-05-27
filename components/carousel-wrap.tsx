"use client";
import { useEffect, useRef, useState } from "react";

export function CarouselWrap({ children, count }: { children: React.ReactNode; count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Find the scrollable child (vgrid or gcards)
    const scroller = el.querySelector<HTMLElement>(".vgrid, .gcards");
    if (!scroller) return;

    function onScroll() {
      if (!scroller) return;
      const cardWidth = scroller.firstElementChild
        ? (scroller.firstElementChild as HTMLElement).offsetWidth + 14
        : 1;
      const idx = Math.round(scroller.scrollLeft / cardWidth);
      setActive(Math.min(idx, count - 1));
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [count]);

  function goTo(i: number) {
    const scroller = ref.current?.querySelector<HTMLElement>(".vgrid, .gcards");
    if (!scroller) return;
    const cardWidth = scroller.firstElementChild
      ? (scroller.firstElementChild as HTMLElement).offsetWidth + 14
      : 0;
    scroller.scrollTo({ left: i * cardWidth, behavior: "smooth" });
  }

  return (
    <div className="carousel-wrap" ref={ref}>
      {children}
      <div className="carousel-dots">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            aria-label={`Go to item ${i + 1}`}
            className={`carousel-dot ${i === active ? "active" : ""}`}
            onClick={() => goTo(i)}
            style={{ border: "none", padding: 0, cursor: "pointer", background: "none" }}
          />
        ))}
      </div>
    </div>
  );
}
