import React, { act } from "react";
import { createRoot } from "react-dom/client";
import Courses from "./Courses";
import Skills from "./Skills";
import { client, imageUrl } from "../../../Client";
import fs from "fs";
import path from "path";

jest.mock("../../../Client", () => ({
  client: { fetch: jest.fn() },
  imageUrl: jest.fn(source => source?.asset?._ref ? `https://cdn.sanity.io/${source.asset._ref}.png` : undefined),
}));
const record = { _id: "course", title: "Software Development - React Web Developer", issuedBy: "Digital Egypt Pioneers Initiative - DEPI", issuedDate: "2024-10-01", certificateImgUrl: { asset: { _ref: "image-course" } } };
let container, root;
const render = async (element = <Courses />) => act(async () => root.render(element));
const click = async element => act(async () => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
const preview = () => container.querySelector('button[aria-label^="Show certificate:"]');
const dialog = () => document.querySelector('[role="dialog"]');
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  client.fetch.mockReset().mockResolvedValue([record]); imageUrl.mockReset().mockImplementation(source => source?.asset?._ref ? `https://cdn.sanity.io/${source.asset._ref}.png` : undefined);
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT; });

test("all eight skills have persistent labels, decorative icons and factual categories without fake controls", async () => {
  await render(<Skills />);
  const cards = [...container.querySelectorAll('li.resume-skill-card')];
  expect(cards.map(card => card.querySelector('.resume-skill-name').textContent)).toEqual(["HTML5", "CSS3", "JavaScript", "React", "Figma", "Material UI", "Git", "Redux"]);
  expect(cards.every(card => card.querySelector('svg[aria-hidden="true"]') && !card.hasAttribute('tabindex'))).toBe(true);
  expect(container.querySelector('button')).toBeNull();
  expect(container.textContent).not.toMatch(/%|expert|proficien|years/i);
});
test("real-shaped records retain title, issuer, dates and helper-generated preview", async () => {
  await render(); expect(client.fetch).toHaveBeenCalledTimes(1);
  expect(client.fetch.mock.calls[0][0]).toBe('*[_type=="courses"]');
  expect(container.querySelector('h3').textContent).toBe(record.title);
  expect(container.textContent).toContain(record.issuedBy); expect(container.textContent).toContain("Issued Oct 2024");
  await click(preview()); expect(dialog().querySelector('img').src).toBe('https://cdn.sanity.io/image-course.png');
  expect(client.fetch).toHaveBeenCalledTimes(1);
});
test("course dates sort newest first with invalid, missing and impossible dates safely last", async () => {
  client.fetch.mockResolvedValue([
    { ...record, _id: "old", title: "Older", issuedDate: "2023-08-01" },
    { ...record, _id: "invalid", title: "Invalid", issuedDate: "not-a-date" },
    record,
    { ...record, _id: "missing", title: "Missing", issuedDate: null },
    { ...record, _id: "impossible", title: "Impossible", issuedDate: "2024-02-30" },
  ]);
  await render(); expect([...container.querySelectorAll('h3')].map(e => e.textContent)).toEqual([record.title, "Older", "Invalid", "Missing", "Impossible"]);
  expect(container.querySelectorAll('.date')[2].textContent).toBe("Issue date not listed");
  expect(container.textContent).not.toContain('Invalid Date'); expect(container.textContent).not.toContain('Present');
});
test("malformed response and optional fields cannot crash or invent content", async () => {
  client.fetch.mockResolvedValue([null, [], 2, 'bad', { _id: "missing", title: {}, issuedBy: 4, issuedDate: {} }]);
  await render(); expect(container.querySelectorAll('article')).toHaveLength(1);
  expect(container.textContent).toContain('Course title not listed'); expect(container.textContent).toContain('Issuer not listed');
  expect(preview()).toBeNull(); expect(container.textContent).toContain('Preview unavailable');
});
test("missing or invalid certificate images have no actionable preview", async () => {
  client.fetch.mockResolvedValue([{ ...record, certificateImgUrl: null }, { ...record, _id: 'invalid', certificateImgUrl: { asset: {} } }]);
  await render(); expect(container.querySelectorAll('button')).toHaveLength(0);
  expect(container.querySelectorAll('.resume-certificate-unavailable')).toHaveLength(2);
});
test("loading, error and empty feedback remain available", async () => {
  let resolve; client.fetch.mockReturnValue(new Promise(r => { resolve = r; })); await render();
  expect(container.querySelector('[role="status"]').textContent).toContain('Loading courses');
  await act(async () => resolve([])); expect(container.textContent).toContain('No courses or certifications found');
  await act(async () => root.unmount()); root = createRoot(container);
  client.fetch.mockRejectedValue(new Error('Offline')); await render(); expect(container.textContent).toContain('Unable to load courses or certifications');
});
test("course requests abort and ignore late resolution on unmount", async () => {
  let resolve; client.fetch.mockReturnValue(new Promise(r => { resolve = r; })); await render();
  const signal = client.fetch.mock.calls[0][2].signal;
  await act(async () => root.unmount()); expect(signal.aborted).toBe(true);
  await act(async () => resolve([record])); expect(container.textContent).toBe(''); root = createRoot(container);
});
test("dialog has certificate-specific naming, context and a focusable close control", async () => {
  await render(); await click(preview());
  expect(document.getElementById(dialog().getAttribute('aria-labelledby')).textContent).toBe(record.title);
  expect(dialog().textContent).toContain(record.issuedBy);
  expect(document.activeElement).toBe(dialog().querySelector('button[aria-label="close"]'));
  expect(dialog().querySelector('img').alt).toBe(`${record.title} certificate`);
});
test("image loading becomes readable media on success", async () => {
  await render(); await click(preview());
  const image = dialog().querySelector('img'); expect(image.hidden).toBe(true);
  expect(dialog().textContent).toContain('Loading certificate image');
  await act(async () => image.dispatchEvent(new Event('load')));
  expect(image.hidden).toBe(false); expect(dialog().querySelector('[role="status"]')).toBeNull();
});
test("image failure displays a clear fallback and reopening resets loading", async () => {
  await render(); await click(preview());
  await act(async () => dialog().querySelector('img').dispatchEvent(new Event('error')));
  expect(dialog().textContent).toContain('Unable to load this certificate image'); expect(dialog().querySelector('img')).toBeNull();
  await click(dialog().querySelector('button[aria-label="close"]')); await click(preview());
  expect(dialog().textContent).toContain('Loading certificate image'); expect(dialog().querySelector('img')).not.toBeNull();
});
test("Escape closes the dialog and focus returns to the invoking control", async () => {
  await render(); const button = preview(); button.focus(); await click(button);
  await act(async () => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  await act(async () => new Promise(resolve => setTimeout(resolve, 250)));
  expect(dialog()).toBeNull(); expect(document.activeElement).toBe(button);
});
test("scoped layouts have responsive grids, image containment and reduced-motion rules", async () => {
  await render();
  for (const file of ['skills.css', 'courses.css']) {
    const css = fs.readFileSync(path.join(__dirname, '../style', file), 'utf8');
    expect(css).toContain('minmax(0, 1fr)'); expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).not.toMatch(/height: (35|40)vh|overflow-y: auto/);
  }
  const css = fs.readFileSync(path.join(__dirname, '../style/courses.css'), 'utf8');
  expect(css).toContain('object-fit: contain'); expect(css).toContain('min-height: 44px');
});

test("non-array CMS responses are treated as empty", async () => {
  client.fetch.mockResolvedValue({ unexpected: true }); await render();
  expect(container.textContent).toContain("No courses or certifications found");
  expect(container.querySelector('article')).toBeNull();
});
test("opening another certificate replaces image context and resets loading without refetching", async () => {
  client.fetch.mockResolvedValue([record, { ...record, _id: "second", title: "Agile Scrum", certificateImgUrl: { asset: { _ref: "image-second" } } }]);
  await render(); await click(preview());
  await act(async () => dialog().querySelector('img').dispatchEvent(new Event('load')));
  await click(dialog().querySelector('button[aria-label="close"]'));
  await click(container.querySelector('button[aria-label="Show certificate: Agile Scrum"]'));
  expect(document.getElementById(dialog().getAttribute('aria-labelledby')).textContent).toBe("Agile Scrum");
  expect(dialog().querySelector('img').src).toBe("https://cdn.sanity.io/image-second.png");
  expect(dialog().querySelector('img').hidden).toBe(true);
  expect(dialog().textContent).toContain("Loading certificate image");
  expect(client.fetch).toHaveBeenCalledTimes(1);
});
