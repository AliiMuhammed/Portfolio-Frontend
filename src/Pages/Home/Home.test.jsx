import React, { act } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home";

jest.mock("framer-motion", () => ({
  ...jest.requireActual("framer-motion"),
  useReducedMotion: () => true,
}));

jest.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }) =>
    require("react").createElement("a", { href: to, ...props }, children),
}), { virtual: true });

test("reduced motion shows the portrait immediately and keeps the decorative circle still", async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.useFakeTimers();
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    await act(async () => root.render(<Home />));
    const portrait = container.querySelector('img[alt="ali\'s-photo"]');
    const circle = container.querySelector("circle");
    expect(portrait.parentElement.style.opacity).toBe("1");
    const initialDash = circle.getAttribute("stroke-dasharray");
    const initialTransform = circle.style.transform;

    await act(async () => jest.advanceTimersByTime(30000));
    expect(circle.getAttribute("stroke-dasharray")).toBe(initialDash);
    expect(circle.style.transform).toBe(initialTransform);
    expect(container.querySelector("a[download]").getAttribute("href"))
      .toBe("/Ali Muhammed Ahmed.pdf");
  } finally {
    await act(async () => root.unmount());
    container.remove();
    jest.useRealTimers();
    delete global.IS_REACT_ACT_ENVIRONMENT;
  }
});
