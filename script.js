// Scroll-linked touches: the work timeline fills as you read through it, and
// the top nav marks the section you're in.

const timeline = document.querySelector(".timeline");
const roles = timeline ? [...timeline.querySelectorAll(".role")] : [];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

// The fill tracks a reading line 60% down the viewport.
function updateTimeline() {
  if (!timeline) return;
  if (reduced.matches) {
    timeline.style.setProperty("--p", 1);
    roles.forEach((r) => r.classList.add("lit"));
    return;
  }
  const line = window.innerHeight * 0.6;
  const box = timeline.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (line - box.top) / box.height));
  timeline.style.setProperty("--p", p.toFixed(4));
  roles.forEach((r) => r.classList.toggle("lit", r.getBoundingClientRect().top + 12 <= line));
}

let queued = false;
function onScroll() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    updateTimeline();
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
reduced.addEventListener("change", updateTimeline);
updateTimeline();

// Active section in the nav.
const links = new Map(
  [...document.querySelectorAll(".top nav a")].map((a) => [a.getAttribute("href").slice(1), a])
);
const visible = new Set();
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
    // Education sits between Skills and Contact without its own link, so it keeps Skills lit.
    const order = ["work", "projects", "skills", "education", "contact"];
    let current = order.filter((id) => visible.has(id)).pop();
    if (current === "education") current = "skills";
    links.forEach((a, id) => (id === current ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
["work", "projects", "skills", "education", "contact"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) observer.observe(el);
});
