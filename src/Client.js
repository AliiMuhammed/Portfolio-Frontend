import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
  dataset: process.env.REACT_APP_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: true,
});

export const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);

// Optional or malformed CMS images should not interrupt page rendering.
export const imageUrl = (source) => {
  if (!source) return undefined;
  try {
    return urlFor(source).url();
  } catch {
    return undefined;
  }
};
