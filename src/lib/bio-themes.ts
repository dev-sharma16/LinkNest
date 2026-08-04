import type { ThemeStyleValues } from "@/lib/validations/bio";

export type ThemePreset = {
  id: string;
  name: string;
  style: Pick<
    ThemeStyleValues,
    | "themeName"
    | "primaryColor"
    | "secondaryColor"
    | "accentColor"
    | "textColor"
    | "backgroundColor"
    | "buttonBackground"
    | "buttonText"
    | "backgroundType"
    | "gradientFrom"
    | "gradientTo"
    | "fontFamily"
    | "buttonStyle"
    | "buttonRadius"
  >;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "minimal",
    name: "Minimal",
    style: {
      themeName: "light",
      primaryColor: "#6366f1",
      secondaryColor: "#a855f7",
      accentColor: "#22d3ee",
      textColor: "#18181b",
      backgroundColor: "#ffffff",
      buttonBackground: "#18181b",
      buttonText: "#ffffff",
      backgroundType: "solid",
      gradientFrom: "#ffffff",
      gradientTo: "#ffffff",
      fontFamily: "Inter, sans-serif",
      buttonStyle: "solid",
      buttonRadius: "12px",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    style: {
      themeName: "dark",
      primaryColor: "#818cf8",
      secondaryColor: "#c084fc",
      accentColor: "#22d3ee",
      textColor: "#f4f4f5",
      backgroundColor: "#09090b",
      buttonBackground: "#27272a",
      buttonText: "#fafafa",
      backgroundType: "solid",
      gradientFrom: "#09090b",
      gradientTo: "#09090b",
      fontFamily: "Inter, sans-serif",
      buttonStyle: "solid",
      buttonRadius: "12px",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    style: {
      themeName: "dark",
      primaryColor: "#fb923c",
      secondaryColor: "#f43f5e",
      accentColor: "#fbbf24",
      textColor: "#fff7ed",
      backgroundColor: "#0c0a09",
      buttonBackground: "#f97316",
      buttonText: "#ffffff",
      backgroundType: "gradient",
      gradientFrom: "#7c2d12",
      gradientTo: "#0c0a09",
      fontFamily: "Inter, sans-serif",
      buttonStyle: "solid",
      buttonRadius: "9999px",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    style: {
      themeName: "light",
      primaryColor: "#0ea5e9",
      secondaryColor: "#06b6d4",
      accentColor: "#3b82f6",
      textColor: "#0f172a",
      backgroundColor: "#f0f9ff",
      buttonBackground: "#0ea5e9",
      buttonText: "#ffffff",
      backgroundType: "gradient",
      gradientFrom: "#e0f2fe",
      gradientTo: "#f0f9ff",
      fontFamily: "Inter, sans-serif",
      buttonStyle: "solid",
      buttonRadius: "12px",
    },
  },
  {
    id: "forest",
    name: "Forest",
    style: {
      themeName: "dark",
      primaryColor: "#22c55e",
      secondaryColor: "#10b981",
      accentColor: "#84cc16",
      textColor: "#ecfdf5",
      backgroundColor: "#052e16",
      buttonBackground: "#16a34a",
      buttonText: "#ffffff",
      backgroundType: "solid",
      gradientFrom: "#052e16",
      gradientTo: "#052e16",
      fontFamily: "Inter, sans-serif",
      buttonStyle: "solid",
      buttonRadius: "12px",
    },
  },
  {
    id: "rose",
    name: "Rose",
    style: {
      themeName: "light",
      primaryColor: "#e11d48",
      secondaryColor: "#f43f5e",
      accentColor: "#fb7185",
      textColor: "#1c1917",
      backgroundColor: "#fff1f2",
      buttonBackground: "#e11d48",
      buttonText: "#ffffff",
      backgroundType: "gradient",
      gradientFrom: "#ffe4e6",
      gradientTo: "#fff1f2",
      fontFamily: "Inter, sans-serif",
      buttonStyle: "solid",
      buttonRadius: "9999px",
    },
  },
];

export const DEFAULT_THEME: ThemeStyleValues = {
  themeName: "light",
  preset: "minimal",
  primaryColor: "#6366f1",
  secondaryColor: "#a855f7",
  accentColor: "#22d3ee",
  textColor: "#18181b",
  backgroundColor: "#ffffff",
  buttonBackground: "#18181b",
  buttonText: "#ffffff",
  fontFamily: "Inter, sans-serif",
  fontSize: "16px",
  fontWeight: "500",
  backgroundType: "solid",
  gradientFrom: "#ffffff",
  gradientTo: "#ffffff",
  backgroundImage: "",
  buttonStyle: "solid",
  buttonRadius: "12px",
  cardStyle: "shadow",
  blockSpacing: "12px",
  alignment: "center",
  customCss: "",
};

export function getPreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((p) => p.id === id);
}

export function applyPresetToTheme(theme: ThemeStyleValues, presetId: string): ThemeStyleValues {
  const preset = getPreset(presetId);
  if (!preset) return theme;
  return { ...theme, ...preset.style, preset: presetId };
}

export function mergeTheme(base: ThemeStyleValues, partial: Partial<ThemeStyleValues>): ThemeStyleValues {
  return { ...DEFAULT_THEME, ...base, ...partial };
}