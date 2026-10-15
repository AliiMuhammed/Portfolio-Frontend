// Demo, repository and video destinations share the same external-URL policy.
export const webLink = value => {
  try {
    const href = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
    const url = new URL(href);
    return ["https:", "http:"].includes(url.protocol) && url.hostname && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
};
