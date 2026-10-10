import React, { act } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home";
import { client } from "../../Client";

jest.mock("../../Client", () => ({
  client: { fetch: jest.fn() },
  imageUrl: (source) => source?.asset?._ref === "image-bistro-1665x917-png" ? "https://cdn.sanity.io/bistro.png" : undefined,
}));
jest.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }) => require("react").createElement("a", { href: to, ...props }, children),
}), { virtual: true });

const project = {
  _id: "0f4ff2bf-76ea-49c2-9e53-ab42284fe53f", title: "Bistro Bliss",
  description: "Bistro Bliss is a handy web app for food lovers. Explore menus, book tables effortlessly, and save your reservations with an account. Dining out made easy!",
  techStack: ["React.js", "Node.js", "Express", "MongoDB", "HTML5", "CSS3", "JavaScript", "Redux"],
  imageurl: { _type: "image", asset: { _type: "reference", _ref: "image-bistro-1665x917-png" } },
  github: "https://github.com/AliiMuhammed/Final-Project-Amit", link: "https://bistro-bliss-template.netlify.app/",
};
let container, root;
const render = async () => act(async () => root.render(<Home />));

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  client.fetch.mockReset().mockResolvedValue([]);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

test("hero has one heading and the verified professional identity", async () => {
  await render();
  expect(container.querySelectorAll("h1")).toHaveLength(1);
  expect(container.querySelector("h1").textContent).toBe("Engineering meets a little imagination.");
  expect(container.textContent).toContain("Ali Muhammed");
  expect(container.textContent).toContain("software engineer specializing in React and web development");
});
test("renders the real portrait with meaningful alternative text", async () => {
  await render();
  const image = container.querySelector(".home-portrait");
  expect(image.getAttribute("src")).toBe("me.webp");
  expect(image.alt).toBe("Ali Muhammed, software engineer");
  expect(image.getAttribute("fetchpriority")).toBe("high");
});
test("preserves the real downloadable CV", async () => {
  await render();
  expect(container.querySelector("a[download]").getAttribute("href")).toBe("/Ali Muhammed Ahmed.pdf");
});
test("preserves all four labeled social destinations", async () => {
  await render();
  const expected = {
    LinkedIn: "https://www.linkedin.com/in/ali-muhammed-dev/",
    GitHub: "https://github.com/AliiMuhammed",
    Facebook: "https://www.facebook.com/profile.php?id=100004223081202",
    WhatsApp: "https://wa.me/201066567630",
  };
  Object.entries(expected).forEach(([label, href]) => expect(container.querySelector(`a[aria-label="Ali Muhammed on ${label}"]`).getAttribute("href")).toBe(href));
});
test("Home actions navigate to Work, Resume and Contact", async () => {
  await render();
  expect([...container.querySelectorAll(".home-actions a")].map((a) => a.getAttribute("href"))).toEqual(["/work", "/resume"]);
  expect(container.querySelector(".home-contact a").getAttribute("href")).toBe("/contact");
  expect(container.querySelector(".home-about a").getAttribute("href")).toBe("/resume");
});
test("uses the existing query and renders two real-shaped CMS records and their URLs", async () => {
  client.fetch.mockResolvedValue([project, { ...project, _id: "second", title: "Ahl al-Qur'an" }, { ...project, _id: "third", title: "Third project" }]);
  await render();
  expect(client.fetch).toHaveBeenCalledWith('*[_type=="work"]', {}, { signal: expect.any(AbortSignal) });
  expect(container.querySelectorAll(".home-project-card")).toHaveLength(2);
  expect(container.textContent).toContain(project.description);
  expect(container.textContent).not.toContain("Third project");
  expect(container.querySelector('a[aria-label="Live demo of Bistro Bliss"]').href).toBe(project.link);
  expect(container.querySelector('a[aria-label="GitHub repository for Bistro Bliss"]').href).toBe(project.github);
  expect(container.querySelector(".home-project-media img").alt).toBe("Bistro Bliss interface screenshot");
  expect([...container.querySelectorAll(".home-tags li")].map((li) => li.textContent)).toContain("React.js");
});
test("handles missing image, title and optional fields without invented content", async () => {
  client.fetch.mockResolvedValue([{ _id: "missing" }]);
  await render();
  expect(container.textContent).toContain("Project image unavailable.");
  expect(container.querySelector("h3").textContent).toBe("Untitled project");
  expect(container.querySelector(".home-project-links a").getAttribute("href")).toBe("/work");
  expect(container.querySelector(".home-tags")).toBeNull();
});
test("loading leaves the hero and contact navigation usable", async () => {
  client.fetch.mockReturnValue(new Promise(() => {}));
  await render();
  expect(container.querySelector('[role="status"]').textContent).toBe("Loading selected projects…");
  expect(container.querySelector(".home-contact a")).not.toBeNull();
  expect(container.querySelector("h1")).not.toBeNull();
});
test("CMS failure provides a polite error state and Work navigation", async () => {
  client.fetch.mockRejectedValue(new Error("unavailable"));
  await render();
  expect(container.querySelector('[role="status"]').textContent).toContain("Unable to load projects");
  expect(container.querySelector(".home-work-all").getAttribute("href")).toBe("/work");
});
test("empty CMS response provides an empty state", async () => {
  await render();
  expect(container.querySelector('[role="status"]').textContent).toContain("No projects to show yet");
});
test("reduced motion leaves all content immediate and decorative elements static", async () => {
  jest.useFakeTimers();
  try {
    await render();
    const portrait = container.querySelector(".home-portrait");
    const before = portrait.outerHTML;
    await act(async () => jest.advanceTimersByTime(30000));
    expect(portrait.outerHTML).toBe(before);
    expect(container.querySelector('[style*="opacity: 0"]')).toBeNull();
    expect(container.querySelector(".home-orb").getAttribute("aria-hidden")).toBe("true");
    const css = require("fs").readFileSync(require("path").join(__dirname, "style/home.css"), "utf8");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("transform: none");
    expect(css).not.toMatch(/animation\s*:/);
  } finally { jest.useRealTimers(); }
});
test("does not introduce prototype claims, unsupported routes or experimental controls", async () => {
  await render();
  expect(container.textContent).not.toMatch(/Developer Lab|Plementus|iSchool|Almentor|years of experience|Open to work|testimonials|BrandStore/i);
  expect(container.querySelector('a[href^="/writing"], a[href^="/work/"], button')).toBeNull();
  expect(container.querySelector('.home-contact-art').getAttribute('aria-hidden')).toBe('true');
});
test("malformed CMS fields and unsafe URLs cannot break cards or create executable links", async () => {
  client.fetch.mockResolvedValue([null, "invalid", [], { _id: "malformed", title: {}, description: {}, techStack: ["React", null, {}, "React"], github: "javascript:alert(1)", link: "data:text/html,hi", imageurl: {} }]);
  await render();
  expect(container.querySelectorAll(".home-project-card")).toHaveLength(1);
  expect(container.querySelectorAll(".home-tags li")).toHaveLength(1);
  expect(container.querySelector(".home-project-links a").getAttribute("href")).toBe("/work");
});
test("broken screenshot falls back to a readable placeholder", async () => {
  client.fetch.mockResolvedValue([project]);
  await render();
  await act(async () => container.querySelector(".home-project-media img").dispatchEvent(new Event("error")));
  expect(container.querySelector(".home-project-media img")).toBeNull();
  expect(container.textContent).toContain("Project image unavailable.");
});
test("unmount aborts pending CMS reads", async () => {
  client.fetch.mockReturnValue(new Promise(() => {}));
  await render();
  const signal = client.fetch.mock.calls[0][2].signal;
  await act(async () => root.render(null));
  expect(signal.aborted).toBe(true);
});
