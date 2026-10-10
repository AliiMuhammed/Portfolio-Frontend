import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
// CRA's Jest resolver cannot follow React Router 7 exports; use its installed CJS entry.
jest.mock("react-router-dom", () => require("../../node_modules/react-router/dist/development/index.js"), { virtual: true });
const { MemoryRouter, useNavigate } = require("react-router-dom");
const Navbar = require("./Navbar").default;

let container, root, media, breakpoint, navigate;
function Harness() {
  navigate = useNavigate();
  return <><Navbar /><button id="outside">Page control</button></>;
}
const toggle = () => container.querySelector(".navbar-toggle");
const menu = () => container.querySelector("#mobile-navigation");
const click = async (element) => act(async () => element.click());
beforeEach(async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  media = { matches: false, addEventListener: (_, fn) => { breakpoint = fn; }, removeEventListener: jest.fn() };
  window.matchMedia = () => media;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<MemoryRouter initialEntries={["/resume"]}><Harness /></MemoryRouter>));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

test("all four destinations, brand, CTA and active route use real router links", () => {
  const links = [...container.querySelectorAll(".navbar-desktop li a")];
  expect(links.map(a => [a.textContent, a.getAttribute("href")])).toEqual([
    ["Home", "/"], ["Resume", "/resume"], ["Work", "/work"], ["Contact", "/contact"]
  ]);
  expect(links.filter(a => a.getAttribute("aria-current") === "page").map(a => a.textContent)).toEqual(["Resume"]);
  expect(container.querySelector(".navbar-brand").getAttribute("href")).toBe("/");
  expect(container.querySelector(".navbar-cta").getAttribute("href")).toBe("/contact");
  expect(container.querySelectorAll("ul > :not(li)")).toHaveLength(0);
});

test("disclosure toggle keeps focus and fully hides the controlled menu when closed", async () => {
  toggle().focus();
  expect(menu().hidden).toBe(true);
  expect(toggle().getAttribute("aria-controls")).toBe(menu().id);
  await click(toggle());
  expect(toggle().getAttribute("aria-expanded")).toBe("true");
  expect(menu().hidden).toBe(false);
  expect(document.activeElement).toBe(toggle());
  await click(toggle());
  expect(toggle().getAttribute("aria-expanded")).toBe("false");
  expect(menu().hidden).toBe(true);
});

test("Escape closes and restores focus from a menu link", async () => {
  await click(toggle());
  menu().querySelector("a").focus();
  await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  expect(menu().hidden).toBe(true);
  expect(document.activeElement).toBe(toggle());
});

test("outside pointer closes without preventing focus on the page", async () => {
  await click(toggle());
  menu().querySelector("a").focus();
  const outside = container.querySelector("#outside");
  await act(async () => outside.dispatchEvent(new Event("pointerdown", { bubbles: true })));
  await act(async () => outside.focus());
  expect(menu().hidden).toBe(true);
  expect(document.activeElement).toBe(outside);
});

test("selecting the current link closes and returns focus", async () => {
  await click(toggle());
  const link = menu().querySelector('a[href="/resume"]');
  link.focus();
  await click(link);
  expect(menu().hidden).toBe(true);
  expect(document.activeElement).toBe(toggle());
});

test("CTA navigates to Contact and closes the menu", async () => {
  await click(toggle());
  await click(menu().querySelector('a[href="/contact"]'));
  expect(menu().hidden).toBe(true);
  expect(container.querySelector('.navbar-desktop a[aria-current="page"]').textContent).toBe("Contact");
});

test("external route changes close the menu and preserve usable focus", async () => {
  await click(toggle());
  menu().querySelector("a").focus();
  await act(async () => navigate("/work"));
  expect(menu().hidden).toBe(true);
  expect(document.activeElement).toBe(toggle());
  expect(container.querySelector('.navbar-desktop a[aria-current="page"]').textContent).toBe("Work");
});

test("desktop breakpoint closes disclosure and moves focus to a visible destination", async () => {
  await click(toggle());
  menu().querySelector('a[href="/work"]').focus();
  media.matches = true;
  await act(async () => breakpoint());
  expect(menu().hidden).toBe(true);
  expect(document.activeElement).toBe(container.querySelector('.navbar-desktop a[href="/work"]'));
  media.matches = false;
  await act(async () => breakpoint());
  expect(document.activeElement).toBe(toggle());
});

test("tabbing out closes the disclosure without trapping keyboard focus", async () => {
  await click(toggle());
  menu().querySelector("a").focus();
  await act(async () => container.querySelector("#outside").focus());
  expect(menu().hidden).toBe(true);
});

test("mobile Contact is one final text action and identifies its active route", async () => {
  await act(async () => navigate("/contact"));
  const contact = menu().querySelectorAll('a[href="/contact"]');
  expect(contact).toHaveLength(1);
  expect(contact[0].textContent).toBe("Contact me ↗");
  expect(contact[0].getAttribute("aria-current")).toBe("page");
  expect(contact[0]).toBe(menu().querySelector("li:last-child a"));
  expect(menu().querySelector(".navbar-cta")).toBeNull();
});
