import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ContactMe from "./ContactMe";
import emailjs from "emailjs-com";
import { validateForm, fieldRules } from "./components/validation";
import fs from "fs";
import path from "path";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({ useDispatch: () => mockDispatch }));
jest.mock("emailjs-com", () => ({ sendForm: jest.fn() }));
let container, root;
const valid = { firstName: "Ali", lastName: "", email: "ali@example.com", phone: "", subject: "Hello", message: "Hi" };
const input = async (name, value) => {
  const node = container.querySelector(`[name="${name}"]`);
  const proto = name === "message" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  await act(async () => { Object.getOwnPropertyDescriptor(proto, "value").set.call(node, value); node.dispatchEvent(new Event("input", { bubbles: true })); });
};
const fill = async values => { for (const [name, value] of Object.entries(values)) await input(name, value); };
const submit = async () => act(async () => container.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
const click = async node => act(async () => node.click());
const topic = label => [...container.querySelectorAll(".contact-topics button")].find(node => node.textContent === label);
beforeEach(async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  mockDispatch.mockReset(); emailjs.sendForm.mockReset().mockResolvedValue({ status: 200 });
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  await act(async () => root.render(<ContactMe />));
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT; });

test("six named, labelled controls with four required fields and autocomplete", () => {
  expect([...container.querySelectorAll("input,textarea")].map(node => node.name)).toEqual(Object.keys(valid));
  for (const [name, rule] of Object.entries(fieldRules)) {
    const node = container.querySelector(`[name=${name}]`);
    expect(node.required).toBe(rule.required);
    expect(container.querySelector(`label[for=${node.id}]`).textContent).toContain(rule.label);
    if (rule.max) expect(node.maxLength).toBe(rule.max);
    if (rule.autocomplete) expect(node.autocomplete).toBe(rule.autocomplete);
  }
  expect(container.querySelectorAll("h1")).toHaveLength(1);
});
test("optional blank fields are valid", () => expect(validateForm(valid)).toEqual({}));
test.each(["firstName", "email", "subject", "message"])("%s rejects blank and whitespace", name => {
  expect(validateForm({ ...valid, [name]: "" })[name]).toBeTruthy();
  expect(validateForm({ ...valid, [name]: "   " })[name]).toBeTruthy();
});
test.each(["firstName", "lastName", "email", "subject", "message"])("%s enforces maximum without truncation", name => {
  const max = fieldRules[name].max;
  const value = name === "email" ? "a".repeat(max - 6) + "@b.com" : "a".repeat(max);
  expect(validateForm({ ...valid, [name]: value })[name]).toBeUndefined();
  expect(validateForm({ ...valid, [name]: value + "a" })[name]).toContain("characters or fewer");
});
test.each(["a@b.com", "  a@b.com  "])("accepts email %s", email => expect(validateForm({ ...valid, email })).toEqual({}));
test.each(["a@b", "a b@c.com", "a@b.com extra", "a@@b.com"])("rejects invalid email %s", email => expect(validateForm({ ...valid, email }).email).toBeTruthy());
test.each(["+20 (106) 656-7630", "1234567890", "123456789012345", ""])("accepts phone %s", phone => expect(validateForm({ ...valid, phone })).toEqual({}));
test.each(["123", "1234567890123456", "+20abc1066567630", "++201066567630"])("rejects phone %s", phone => expect(validateForm({ ...valid, phone }).phone).toBeTruthy());
test("topics prefill editable subject and deselection preserves its value", async () => {
  await click(topic("Collaboration")); expect(container.querySelector("[name=subject]").value).toBe("Collaboration");
  await click(topic("Collaboration")); expect(topic("Collaboration").getAttribute("aria-pressed")).toBe("false");
  expect(container.querySelector("[name=subject]").value).toBe("Collaboration");
  await input("subject", "Custom inquiry"); expect(container.querySelectorAll('[aria-pressed=true]')).toHaveLength(0);
});
test("counter updates without a per-keystroke live region", async () => {
  await input("message", "Hello"); expect(container.querySelector("#contact-counter").textContent).toBe("5 / 1200 characters");
  expect(container.querySelector("#contact-counter").hasAttribute("aria-live")).toBe(false);
});
test("invalid submission focuses first field and associates errors; typing corrects them", async () => {
  await submit(); const node = container.querySelector("[name=firstName]");
  expect(document.activeElement).toBe(node); expect(node.getAttribute("aria-invalid")).toBe("true");
  expect(node.getAttribute("aria-describedby")).toBe("contact-firstName-error");
  expect(emailjs.sendForm).not.toHaveBeenCalled();
  await input("firstName", "Ali"); expect(node.getAttribute("aria-invalid")).toBe("false");
});
test("one four-argument main-template request serializes trimmed fields and blanks, then resets with inline feedback only", async () => {
  let serialized;
  emailjs.sendForm.mockImplementation((service, template, form) => { serialized = Object.fromEntries(new FormData(form)); return Promise.resolve({ status: 200 }); });
  await fill({ ...valid, email: "  ali@example.com  " }); await click(topic("Say hello")); await submit();
  expect(emailjs.sendForm).toHaveBeenCalledTimes(1);
  const args = emailjs.sendForm.mock.calls[0]; expect(args).toHaveLength(4); expect(args[0]).toBe("service_o2o2h4p"); expect(args[1]).toBe("template_cahhqro");
  expect(serialized).toEqual({ ...valid, subject: "Say hello" });
  expect(container.querySelector("[name=email]").value).toBe(""); expect(container.querySelector("#contact-counter").textContent).toContain("0 / 1200");
  expect(container.querySelectorAll('[aria-pressed=true]')).toHaveLength(0); expect(mockDispatch).not.toHaveBeenCalled();
  expect(container.querySelector("[role=status]").textContent).toContain("sent successfully");
});
test("synchronous guard rejects duplicate events and pending draft edits", async () => {
  let resolve; emailjs.sendForm.mockImplementation(() => new Promise(done => { resolve = done; })); await fill(valid);
  await act(async () => { const form = container.querySelector("form"); for(let i=0;i<2;i++) form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
  expect(emailjs.sendForm).toHaveBeenCalledTimes(1); expect(container.querySelector('[type=submit]').disabled).toBe(true);
  expect([...container.querySelectorAll("input,textarea")].every(node => node.readOnly && !node.disabled)).toBe(true);
  await input("message", "New unsent draft"); expect(container.querySelector("[name=message]").value).toBe("Hi");
  await act(async () => resolve({ status: 200 }));
});
test.each(["promise", "synchronous"])("%s error retains draft, announces error and permits retry", async mode => {
  emailjs.sendForm.mockImplementationOnce(() => { if(mode === "synchronous") throw new Error("failed"); return Promise.reject(new Error("failed")); });
  await fill(valid); await submit(); expect(container.querySelector("[name=message]").value).toBe(valid.message);
  expect(container.querySelector('[type=submit]').disabled).toBe(false); expect(container.querySelector('[role=status]').textContent).toContain("draft is preserved");
  expect(mockDispatch).not.toHaveBeenCalled(); await submit(); expect(emailjs.sendForm).toHaveBeenCalledTimes(2);
});
test.each(["resolve", "reject"])("late %s after unmount does not affect replacement content", async outcome => {
  let resolve, reject; emailjs.sendForm.mockImplementation(() => new Promise((yes,no) => { resolve=yes; reject=no; }));
  await fill(valid); await submit(); await act(async () => root.render(<div>Contact closed</div>));
  await act(async () => { if(outcome === "resolve") resolve({}); else reject(new Error("late")); }); expect(mockDispatch).not.toHaveBeenCalled(); expect(container.textContent).toBe("Contact closed");
});
test("real contact destinations, footer and direct submit without review/reset", () => {
  for(const href of ["mailto:ali.muhammed.dev@gmail.com", "tel:+201066567630", "https://github.com/AliiMuhammed", "https://www.linkedin.com/in/ali-muhammed-dev/", "#contact-main"]) expect(container.querySelector(`a[href="${href}"]`)).not.toBeNull();
  expect(container.querySelector("footer").textContent).toContain("Ali Muhammed · Software Engineer"); expect(container.querySelector("dialog,[type=reset]")).toBeNull();
});
test("scoped reduced-motion styling preserves immediately visible content", () => {
  const css = fs.readFileSync(path.join(__dirname,"style/contact.css"),"utf8"); expect(css).toContain("prefers-reduced-motion: reduce"); expect(css).toContain("transition: none !important");
  expect(container.querySelector("h1").textContent).toContain("Have an idea?");
});

test("floating hero decorations stay hidden from assistive technology and non-interactive", () => {
  const art = container.querySelector(".contact-art");
  expect(art.getAttribute("aria-hidden")).toBe("true");
  for (const selector of [".contact-note", ".contact-code", ".contact-orbit"]) expect(art.querySelector(selector)).not.toBeNull();
  expect(art.querySelector("a,button,input")).toBeNull();
  const css = fs.readFileSync(path.join(__dirname, "style/contact.css"), "utf8");
  expect(css).toContain("prefers-reduced-motion: no-preference");
  expect(css).toContain(".contact-note, .contact-code, .contact-orbit::before, .contact-orbit::after { animation: none; }");
});
