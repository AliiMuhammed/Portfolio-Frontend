import React, { act } from "react";
import { createRoot } from "react-dom/client";
import Resume from "./Resume";
import Experience from "./components/Experience";
import { client } from "../../Client";
import fs from "fs";
import path from "path";

jest.mock("../../Client", () => ({
  client: { fetch: jest.fn() },
  imageUrl: source => source?.asset?._ref ? "https://cdn.sanity.io/certificate.png" : undefined,
}));
const roles = [
  { _id: "school", title: "Coding Instructor", company: "iSchool", startDate: "2024-06-01", endDate: "2024-10-01" },
  { _id: "current", title: "Junior Web Developer", company: "Plementus", startDate: "2026-01-01", endDate: null },
  { _id: "coordinator", title: "Online Coordinator", company: "Almentor", startDate: "2023-12-01", endDate: "2024-07-01" },
];
const course = { _id: "course", title: "Agile Scrum", issuedBy: "Information Technology Institute (ITI)", issuedDate: "2024-10-01", certificateImgUrl: { asset: { _ref: "image-certificate" } } };
let container, root;
const render = async (element = <Resume />) => act(async () => root.render(element));
const click = async element => act(async () => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  client.fetch.mockReset().mockImplementation(query => Promise.resolve(query.includes('"experience"') ? roles : [course]));
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT; });

test("renders one H1 and all five sections continuously with labelled headings", async () => {
  await render();
  expect(container.querySelectorAll("h1")).toHaveLength(1);
  expect(container.querySelector("h1").textContent).toBe("The workbehind the work.");
  for (const id of ["experience", "education", "skills", "certifications", "about"]) {
    const section = container.querySelector(`section#${id}`);
    expect(section).not.toBeNull();
    expect(section.querySelector(`h2#${id}-title`)).not.toBeNull();
    expect(section.hidden).toBe(false);
  }
  expect(container.querySelector('[role="tab"]')).toBeNull();
});
test("section navigation uses real native anchors and exactly one current location", async () => {
  await render();
  const links = [...container.querySelectorAll('nav[aria-label="Resume sections"] a')];
  expect(links.map(a => a.getAttribute("href"))).toEqual(["#experience", "#education", "#skills", "#certifications", "#about"]);
  expect(links.filter(a => a.getAttribute("aria-current") === "location")).toHaveLength(1);
});
test("Resume footer matches Home content and social links with a working page-top destination", async () => {
  await render();
  const footer = container.querySelector("footer");
  expect(footer.closest("main")).toBeNull();
  expect(footer.querySelector("p").textContent).toBe(`© ${new Date().getFullYear()} Ali Muhammed · Software Engineer`);
  expect([...footer.querySelectorAll("a")].map(link => link.getAttribute("href"))).toEqual([
    "#resume-main", "https://github.com/AliiMuhammed", "https://www.linkedin.com/in/ali-muhammed-dev/",
  ]);
  expect(container.querySelector("main#resume-main").getAttribute("tabindex")).toBe("-1");
});
test("active section follows scrolling and pending work is cleaned up on unmount", async () => {
  const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 12);
  const cancel = jest.spyOn(window, "cancelAnimationFrame");
  await render();
  const update = raf.mock.calls[0][0];
  for (const [index, section] of [...container.querySelectorAll('.resume-section')].entries()) section.getBoundingClientRect = () => ({ top: index <= 1 ? 0 : 1000 });
  await act(async () => update());
  expect(container.querySelector('nav a[aria-current]').getAttribute("href")).toBe("#education");
  await act(async () => window.dispatchEvent(new Event("scroll")));
  await act(async () => root.unmount());
  expect(cancel).toHaveBeenCalledWith(12);
  root = createRoot(container);
  raf.mockRestore(); cancel.mockRestore();
});
test("initial section hash is restored after the route mounts", async () => {
  const previous = window.location.hash;
  window.history.replaceState(null, "", "#education");
  const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 12);
  await render();
  const target = container.querySelector("#education"); target.scrollIntoView = jest.fn();
  await act(async () => raf.mock.calls[0][0]());
  expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
  window.history.replaceState(null, "", previous || "/"); raf.mockRestore();
});
test("experience preserves query, cancellation and real records newest first", async () => {
  await render(<Experience />);
  expect(client.fetch.mock.calls[0][0]).toBe('*[_type=="experience"]');
  expect([...container.querySelectorAll("h3")].map(e => e.textContent)).toEqual(["Junior Web Developer", "Coding Instructor", "Online Coordinator"]);
  expect(container.textContent).toContain("Plementus");
  expect(container.textContent).toContain("Jan 2026 — Present");
  const signal = client.fetch.mock.calls[0][2].signal;
  await act(async () => root.unmount()); expect(signal.aborted).toBe(true); root = createRoot(container);
});
test("experience exposes loading state without hiding the rest of Resume", async () => {
  client.fetch.mockImplementation(query => query.includes('"experience"') ? new Promise(() => {}) : Promise.resolve([]));
  await render(); expect(container.textContent).toContain("Loading experience"); expect(container.textContent).toContain("Helwan University"); expect(container.querySelector("#about")).not.toBeNull();
});
test("experience exposes request failure safely", async () => {
  client.fetch.mockRejectedValue(new Error("Network unavailable")); await render(<Experience />);
  expect(container.querySelector('[role="status"]').textContent).toContain("Unable to load experience");
});
test("experience exposes empty state", async () => {
  client.fetch.mockResolvedValue([]); await render(<Experience />);
  expect(container.querySelector('[role="status"]').textContent).toContain("No experience found");
});
test("invalid and missing dates never display Invalid Date or invented dates", async () => {
  client.fetch.mockResolvedValue([{ title: "Missing", company: "Employer" }, { title: "Invalid", startDate: "not-a-date", endDate: "not-a-date" }, roles[1]]);
  await render(<Experience />);
  expect(container.querySelector("h3").textContent).toBe("Junior Web Developer");
  expect(container.textContent).toContain("Date not listed — Present");
  expect(container.textContent).toContain("Date not listed — Date not listed");
  expect(container.textContent).not.toContain("Invalid Date");
});
test("malformed records and optional text cannot crash rendering", async () => {
  client.fetch.mockResolvedValue([null, "bad", 4, [], { title: {}, company: 4, startDate: {} }]);
  await render(<Experience />); expect(container.querySelectorAll(".resume-role")).toHaveLength(1);
  expect(container.textContent).toContain("Role not listed"); expect(container.textContent).toContain("Company not listed");
});
test("late experience response after unmount is safely ignored", async () => {
  let resolve; client.fetch.mockReturnValue(new Promise(r => { resolve = r; }));
  await render(<Experience />); const signal = client.fetch.mock.calls[0][2].signal;
  await act(async () => root.unmount()); expect(signal.aborted).toBe(true);
  await act(async () => resolve(roles)); expect(container.textContent).toBe(""); root = createRoot(container);
});
test("education and About preserve factual details and working contact destinations", async () => {
  await render(); expect(container.textContent).toContain("Bachelor of Computer Science — CS Department");
  expect(container.textContent).toContain("Helwan University"); expect(container.textContent).toContain("Sep 2020 — Jun 2024");
  expect(container.querySelector('#about a[href="tel:+201066567630"]')).not.toBeNull();
  expect(container.querySelector('#about a[href="mailto:ali.muhammed.dev@gmail.com"]')).not.toBeNull();
  expect(container.querySelector('#about a[href="https://www.linkedin.com/in/ali-muhammed-dev"]').rel).toBe("noopener noreferrer");
  expect(container.textContent).toContain("Arabic, English");
  expect(container.textContent).not.toMatch(/\+1 years|Available|AI models|OPEN TO CONNECT/);
});
test("all existing skills and live course titles and issuers remain accessible", async () => {
  await render(); expect(container.querySelectorAll('#skills .cards .card')).toHaveLength(8);
  expect([...container.querySelectorAll('#skills svg')].map(e => e.getAttribute('aria-label'))).toEqual(["HTML5", "CSS3", "JavaScript", "React", "Figma", "Material-UI", "Git", "Redux"]);
  expect(container.querySelector('#certifications').textContent).toContain("Agile Scrum");
  expect(container.querySelector('#certifications').textContent).toContain("Information Technology Institute (ITI)");
});
test("existing certificate preview opens and closes via its MUI close control", async () => {
  await render(); const button = container.querySelector('button[aria-label="Show certificate: Agile Scrum"]');
  await click(button); const dialog = document.querySelector('[role="dialog"]'); expect(dialog).not.toBeNull(); expect(dialog.getAttribute("aria-labelledby")).toBe("certifications-title");
  expect(dialog.querySelector('img[alt="Certificate"]').src).toBe("https://cdn.sanity.io/certificate.png");
  await click(dialog.querySelector('button[aria-label="close"]'));
  expect(document.querySelector('[role="dialog"] img')).toBeNull();
});
test("courses retain loading, empty and error states in the continuous page", async () => {
  let resolve; client.fetch.mockImplementation(query => query.includes('"courses"') ? new Promise(r => { resolve = r; }) : Promise.resolve([]));
  await render(); expect(container.querySelector('#certifications .spinner')).not.toBeNull();
  await act(async () => resolve([])); expect(container.querySelector('#certifications').textContent).toContain("No courses or certifications found");
  await act(async () => root.unmount()); root = createRoot(container);
  client.fetch.mockRejectedValue(new Error("Network unavailable")); await render();
  expect(container.querySelector('#certifications').textContent).toContain("Unable to load courses or certifications");
});
test("Resume provides anchor offsets and a reduced-motion fallback without content-reveal animations", async () => {
  await render(); const css = fs.readFileSync(path.join(__dirname, "style/resume.css"), "utf8");
  expect(css).toContain("scroll-margin-top:"); expect(css).toContain("prefers-reduced-motion: reduce"); expect(css).toContain("scroll-behavior: auto; transition: none;");
  expect(container.querySelector('[style*="opacity: 0"]')).toBeNull();
});

test("About becomes current at the page end even below the activation line", async () => {
  const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 12);
  const oldHeight = Object.getOwnPropertyDescriptor(document.documentElement, "scrollHeight");
  const oldScroll = Object.getOwnPropertyDescriptor(window, "scrollY");
  const oldViewport = Object.getOwnPropertyDescriptor(window, "innerHeight");
  try {
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 5000 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 4100 });
    await render();
    for (const section of container.querySelectorAll('.resume-section')) section.getBoundingClientRect = () => ({ top: section.id === "about" ? 300 : -100 });
    await act(async () => raf.mock.calls[0][0]());
    expect(container.querySelector('nav a[aria-current]').getAttribute("href")).toBe("#about");
    expect(container.querySelectorAll('nav a[aria-current]')).toHaveLength(1);
  } finally {
    if (oldHeight) Object.defineProperty(document.documentElement, "scrollHeight", oldHeight); else delete document.documentElement.scrollHeight;
    Object.defineProperty(window, "scrollY", oldScroll);
    Object.defineProperty(window, "innerHeight", oldViewport);
    raf.mockRestore();
  }
});
test("hero decorations retain separate motion and stop under reduced motion", async () => {
  await render();
  expect(container.querySelector('.resume-identity-code').getAttribute("aria-hidden")).toBe("true");
  expect(container.querySelector('.resume-stamp').getAttribute("aria-hidden")).toBe("true");
  const css = fs.readFileSync(path.join(__dirname, "style/resume.css"), "utf8");
  expect(css).toContain("resume-code-float 6s"); expect(css).toContain("resume-stamp-float 7s");
  expect(css).toContain("translateY(-6px) rotate(-3deg)");
  expect(css).toContain(".resume-identity-code, .resume-stamp, .resume-identity::before { animation: none; }");
});

test("scrolling between sections reveals hidden navigation links without scrolling the page or moving focus", async () => {
  const raf = jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 12);
  const oldMedia = window.matchMedia;
  window.matchMedia = jest.fn(() => ({ matches: true }));
  try {
    await render();
    const list = container.querySelector('.resume-section-nav ul');
    Object.defineProperties(list, { scrollWidth: { value: 500 }, clientWidth: { value: 300 } });
    list.getBoundingClientRect = () => ({ left: 0, right: 300 });
    list.scrollBy = jest.fn();
    const about = list.querySelector('a[href="#about"]');
    about.getBoundingClientRect = () => ({ left: 430, right: 500 });
    const experience = list.querySelector('a[href="#experience"]');
    experience.getBoundingClientRect = () => ({ left: -180, right: -80 });
    experience.focus();
    const scrollY = window.scrollY;
    for (const section of container.querySelectorAll('.resume-section')) section.getBoundingClientRect = () => ({ top: 0 });
    await act(async () => raf.mock.calls[0][0]());
    expect(about.getAttribute("aria-current")).toBe("location");
    expect(list.scrollBy).toHaveBeenLastCalledWith({ left: 208, behavior: "auto" });
    expect(document.activeElement).toBe(experience);
    expect(window.scrollY).toBe(scrollY);
    for (const section of container.querySelectorAll('.resume-section')) section.getBoundingClientRect = () => ({ top: section.id === "experience" ? 0 : 1000 });
    await act(async () => raf.mock.calls[0][0]());
    expect(list.scrollBy).toHaveBeenLastCalledWith({ left: -188, behavior: "auto" });
  } finally {
    raf.mockRestore(); window.matchMedia = oldMedia;
  }
});

test("navigation only scrolls when its active link is clipped and rechecks visibility on resize", async () => {
  await render();
  const list = container.querySelector('.resume-section-nav ul');
  const link = list.querySelector('a[aria-current]');
  let width = 500;
  Object.defineProperties(list, { scrollWidth: { get: () => width }, clientWidth: { value: 300 } });
  list.scrollBy = jest.fn();
  list.getBoundingClientRect = () => ({ left: 0, right: 300 });
  link.getBoundingClientRect = () => ({ left: 20, right: 100 });
  await act(async () => window.dispatchEvent(new Event("resize")));
  expect(list.scrollBy).not.toHaveBeenCalled();
  link.getBoundingClientRect = () => ({ left: 280, right: 350 });
  await act(async () => window.dispatchEvent(new Event("resize")));
  expect(list.scrollBy).toHaveBeenCalledWith({ left: 58, behavior: "smooth" });
  list.scrollBy.mockClear(); width = 300;
  await act(async () => window.dispatchEvent(new Event("resize")));
  expect(list.scrollBy).not.toHaveBeenCalled();
});
