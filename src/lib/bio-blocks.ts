import type { BlockType } from "@/lib/validations/bio";

export type BlockMeta = {
  type: BlockType;
  label: string;
  category: "core" | "media" | "embed" | "utility";
  description: string;
  defaults: Record<string, unknown>;
};

export const BLOCK_META: Record<BlockType, BlockMeta> = {
  button: {
    type: "button",
    label: "Button",
    category: "core",
    description: "A styled button that links somewhere.",
    defaults: { label: "Click me", url: "https://", style: "solid" },
  },
  link: {
    type: "link",
    label: "Link",
    category: "core",
    description: "A plain text link.",
    defaults: { label: "My link", url: "https://" },
  },
  text: {
    type: "text",
    label: "Text",
    category: "core",
    description: "A paragraph of text.",
    defaults: { content: "Write something here…" },
  },
  heading: {
    type: "heading",
    label: "Heading",
    category: "core",
    description: "A section heading.",
    defaults: { content: "My heading", level: "h2" },
  },
  divider: {
    type: "divider",
    label: "Divider",
    category: "core",
    description: "A horizontal separator line.",
    defaults: { color: "" },
  },
  spacer: {
    type: "spacer",
    label: "Spacer",
    category: "core",
    description: "Adds vertical space.",
    defaults: { height: 16 },
  },
  image: {
    type: "image",
    label: "Image",
    category: "media",
    description: "A single image.",
    defaults: { src: "", alt: "", caption: "" },
  },
  gallery: {
    type: "gallery",
    label: "Image Gallery",
    category: "media",
    description: "A grid of images.",
    defaults: { images: [] },
  },
  video: {
    type: "video",
    label: "Video",
    category: "media",
    description: "A hosted video (MP4).",
    defaults: { src: "", poster: "" },
  },
  audio: {
    type: "audio",
    label: "Audio",
    category: "media",
    description: "An audio player (MP3).",
    defaults: { src: "" },
  },
  youtube: {
    type: "youtube",
    label: "YouTube",
    category: "embed",
    description: "Embed a YouTube video.",
    defaults: { url: "https://www.youtube.com/watch?v=" },
  },
  spotify: {
    type: "spotify",
    label: "Spotify",
    category: "embed",
    description: "Embed a Spotify player.",
    defaults: { url: "https://open.spotify.com/" },
  },
  tiktok: {
    type: "tiktok",
    label: "TikTok",
    category: "embed",
    description: "Embed a TikTok video.",
    defaults: { url: "https://www.tiktok.com/" },
  },
  instagram: {
    type: "instagram",
    label: "Instagram",
    category: "embed",
    description: "Embed an Instagram post.",
    defaults: { url: "https://www.instagram.com/p/" },
  },
  twitter: {
    type: "twitter",
    label: "Twitter / X",
    category: "embed",
    description: "Embed a tweet.",
    defaults: { url: "https://twitter.com/" },
  },
  twitch: {
    type: "twitch",
    label: "Twitch",
    category: "embed",
    description: "Embed a Twitch stream.",
    defaults: { url: "https://www.twitch.tv/" },
  },
  vimeo: {
    type: "vimeo",
    label: "Vimeo",
    category: "embed",
    description: "Embed a Vimeo video.",
    defaults: { url: "https://vimeo.com/" },
  },
  maps: {
    type: "maps",
    label: "Google Maps",
    category: "embed",
    description: "Embed a map location.",
    defaults: { url: "https://www.google.com/maps" },
  },
  custom_embed: {
    type: "custom_embed",
    label: "Custom Embed",
    category: "embed",
    description: "Embed any iframe source.",
    defaults: { url: "https://", height: 300 },
  },
  contact_form: {
    type: "contact_form",
    label: "Contact Form",
    category: "utility",
    description: "Collect name, email and message.",
    defaults: { title: "Contact me", success: "Thanks! I'll get back to you." },
  },
  newsletter: {
    type: "newsletter",
    label: "Newsletter",
    category: "utility",
    description: "Collect email subscribers.",
    defaults: { title: "Join my newsletter", success: "You're subscribed!" },
  },
  html: {
    type: "html",
    label: "HTML",
    category: "utility",
    description: "Custom HTML snippet.",
    defaults: { content: "<p>Hello world</p>" },
  },
  file_download: {
    type: "file_download",
    label: "File Download",
    category: "utility",
    description: "A downloadable file link.",
    defaults: { label: "Download", url: "" },
  },
  pdf_viewer: {
    type: "pdf_viewer",
    label: "PDF Viewer",
    category: "utility",
    description: "Embed a PDF document.",
    defaults: { url: "" },
  },
};

export const BLOCK_CATEGORIES: {
  id: BlockMeta["category"];
  label: string;
}[] = [
  { id: "core", label: "Core" },
  { id: "media", label: "Media" },
  { id: "embed", label: "Embed" },
  { id: "utility", label: "Utility" },
];

export const BLOCK_LIST = Object.values(BLOCK_META);

export function getBlockMeta(type: BlockType): BlockMeta {
  return BLOCK_META[type] ?? BLOCK_META.text;
}

export function normalizeBlockConfig(
  type: BlockType,
  config: Record<string, unknown> | undefined | null,
): Record<string, unknown> {
  const defaults = getBlockMeta(type).defaults;
  return { ...defaults, ...(config ?? {}) };
}