window.__ModuleLoader__.load({ id: "@dshp/web-style", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);

// src/client/md3.ts
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s, l };
}
function hslToHex(h, s, l) {
  h = (h % 360 + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  const seg = Math.floor(h / 60);
  if (seg === 0) {
    r = c;
    g = x;
  } else if (seg === 1) {
    r = x;
    g = c;
  } else if (seg === 2) {
    g = c;
    b = x;
  } else if (seg === 3) {
    g = x;
    b = c;
  } else if (seg === 4) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const to = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(b);
}
function rgbToHex(r, g, b) {
  const to = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(b);
}
function withAlpha(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}
function extractDominant(data) {
  const buckets = Array.from({ length: 12 }, () => ({ count: 0, r: 0, g: 0, b: 0, sat: 0 }));
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const { h, s, l } = hexToHsl(rgbToHex(r, g, b));
    if (s < 0.15 || l < 0.06 || l > 0.96) continue;
    const bucket = buckets[Math.floor(h / 30) % 12];
    bucket.count++;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.sat += s;
  }
  let best = null;
  let bestScore = 0;
  for (const bucket of buckets) {
    if (bucket.count === 0) continue;
    const score = bucket.count * (0.3 + bucket.sat / bucket.count);
    if (score > bestScore) {
      bestScore = score;
      best = bucket;
    }
  }
  if (!best) return "#3b82f6";
  return rgbToHex(best.r / best.count, best.g / best.count, best.b / best.count);
}
function extractPalette(data) {
  const seed = extractDominant(data);
  const seedHsl = hexToHsl(seed);
  return {
    accent: seed,
    companionA: hslToHex(seedHsl.h + 60, Math.min(0.85, seedHsl.s), 0.52),
    companionB: hslToHex(seedHsl.h, Math.min(0.5, seedHsl.s * 0.45), 0.5)
  };
}
var M3_TONES = [
  0,
  4,
  6,
  10,
  12,
  17,
  20,
  22,
  24,
  25,
  30,
  35,
  40,
  50,
  60,
  70,
  80,
  87,
  90,
  92,
  94,
  95,
  96,
  98,
  99,
  100
];
var M3_PREVIEW_TONES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95];
var M3_REF_ORDER = [
  "primary",
  "secondary",
  "tertiary",
  "neutral",
  "neutralVariant",
  "error"
];
var M3_SYS_ORDER = [
  "primary",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "secondary",
  "onSecondary",
  "secondaryContainer",
  "onSecondaryContainer",
  "tertiary",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "error",
  "onError",
  "errorContainer",
  "onErrorContainer",
  "background",
  "onBackground",
  "surfaceDim",
  "surface",
  "surfaceBright",
  "surfaceContainerLowest",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest",
  "onSurface",
  "onSurfaceVariant",
  "outline",
  "outlineVariant",
  "shadow",
  "scrim",
  "inverseSurface",
  "inverseOnSurface",
  "inversePrimary",
  "surfaceTint"
];
var M3_REF_NAMES = {
  primary: "primary",
  secondary: "secondary",
  tertiary: "tertiary",
  neutral: "neutral",
  neutralVariant: "neutral-variant",
  error: "error"
};
var M3_SYS_NAMES = {
  primary: "primary",
  onPrimary: "on-primary",
  primaryContainer: "primary-container",
  onPrimaryContainer: "on-primary-container",
  secondary: "secondary",
  onSecondary: "on-secondary",
  secondaryContainer: "secondary-container",
  onSecondaryContainer: "on-secondary-container",
  tertiary: "tertiary",
  onTertiary: "on-tertiary",
  tertiaryContainer: "tertiary-container",
  onTertiaryContainer: "on-tertiary-container",
  error: "error",
  onError: "on-error",
  errorContainer: "error-container",
  onErrorContainer: "on-error-container",
  background: "background",
  onBackground: "on-background",
  surfaceDim: "surface-dim",
  surface: "surface",
  surfaceBright: "surface-bright",
  surfaceContainerLowest: "surface-container-lowest",
  surfaceContainerLow: "surface-container-low",
  surfaceContainer: "surface-container",
  surfaceContainerHigh: "surface-container-high",
  surfaceContainerHighest: "surface-container-highest",
  onSurface: "on-surface",
  onSurfaceVariant: "on-surface-variant",
  outline: "outline",
  outlineVariant: "outline-variant",
  shadow: "shadow",
  scrim: "scrim",
  inverseSurface: "inverse-surface",
  inverseOnSurface: "inverse-on-surface",
  inversePrimary: "inverse-primary",
  surfaceTint: "surface-tint"
};
function m3Tone(h, s, t) {
  if (t <= 0) return "#000000";
  if (t >= 100) return "#ffffff";
  return hslToHex(h, s, t / 100);
}
function tone(pal, t) {
  return pal[t];
}
function isPalettes(v) {
  return v !== null && typeof v === "object" && "primary" in v;
}
function buildM3Palettes(seed) {
  const { h, s } = hexToHsl(seed);
  const clampS = (v) => Math.min(0.9, Math.max(0, v));
  const defs = {
    primary: { h, s: clampS(Math.max(s, 0.45)) },
    secondary: { h, s: clampS(s * 0.45) },
    tertiary: { h: (h + 60) % 360, s: clampS(Math.max(s * 0.6, 0.3)) },
    neutral: { h, s: clampS(Math.min(s * 0.12, 0.08)) },
    neutralVariant: { h, s: clampS(Math.min(Math.max(s * 0.3, 0.1), 0.2)) },
    error: { h: 4, s: 0.72 }
  };
  const pal = {
    seed,
    primary: {},
    secondary: {},
    tertiary: {},
    neutral: {},
    neutralVariant: {},
    error: {}
  };
  for (const key of M3_REF_ORDER) {
    const tones = {};
    for (const t of M3_TONES) tones[t] = m3Tone(defs[key].h, defs[key].s, t);
    pal[key] = tones;
  }
  return pal;
}
function buildM3Scheme(pal, scheme) {
  const P = pal.primary;
  const S = pal.secondary;
  const T = pal.tertiary;
  const N = pal.neutral;
  const NV = pal.neutralVariant;
  const E = pal.error;
  if (scheme === "dark") {
    return {
      primary: tone(P, 80),
      onPrimary: tone(P, 20),
      primaryContainer: tone(P, 30),
      onPrimaryContainer: tone(P, 90),
      secondary: tone(S, 80),
      onSecondary: tone(S, 20),
      secondaryContainer: tone(S, 30),
      onSecondaryContainer: tone(S, 90),
      tertiary: tone(T, 80),
      onTertiary: tone(T, 20),
      tertiaryContainer: tone(T, 30),
      onTertiaryContainer: tone(T, 90),
      error: tone(E, 80),
      onError: tone(E, 20),
      errorContainer: tone(E, 30),
      onErrorContainer: tone(E, 90),
      background: tone(N, 6),
      onBackground: tone(N, 90),
      surfaceDim: tone(N, 6),
      surface: tone(N, 6),
      surfaceBright: tone(N, 24),
      surfaceContainerLowest: tone(N, 4),
      surfaceContainerLow: tone(N, 10),
      surfaceContainer: tone(N, 12),
      surfaceContainerHigh: tone(N, 17),
      surfaceContainerHighest: tone(N, 22),
      onSurface: tone(N, 90),
      onSurfaceVariant: tone(NV, 80),
      outline: tone(NV, 60),
      outlineVariant: tone(NV, 30),
      shadow: "#000000",
      scrim: "#000000",
      inverseSurface: tone(N, 90),
      inverseOnSurface: tone(N, 20),
      inversePrimary: tone(P, 40),
      surfaceTint: tone(P, 80)
    };
  }
  return {
    primary: tone(P, 40),
    onPrimary: tone(P, 100),
    primaryContainer: tone(P, 90),
    onPrimaryContainer: tone(P, 10),
    secondary: tone(S, 40),
    onSecondary: tone(S, 100),
    secondaryContainer: tone(S, 90),
    onSecondaryContainer: tone(S, 10),
    tertiary: tone(T, 40),
    onTertiary: tone(T, 100),
    tertiaryContainer: tone(T, 90),
    onTertiaryContainer: tone(T, 10),
    error: tone(E, 40),
    onError: tone(E, 100),
    errorContainer: tone(E, 90),
    onErrorContainer: tone(E, 10),
    background: tone(N, 99),
    onBackground: tone(N, 10),
    surfaceDim: tone(N, 87),
    surface: tone(N, 99),
    surfaceBright: tone(N, 100),
    surfaceContainerLowest: tone(N, 100),
    surfaceContainerLow: tone(N, 96),
    surfaceContainer: tone(N, 94),
    surfaceContainerHigh: tone(N, 92),
    surfaceContainerHighest: tone(N, 90),
    onSurface: tone(N, 10),
    onSurfaceVariant: tone(NV, 30),
    outline: tone(NV, 50),
    outlineVariant: tone(NV, 80),
    shadow: "#000000",
    scrim: "#000000",
    inverseSurface: tone(N, 20),
    inverseOnSurface: tone(N, 95),
    inversePrimary: tone(P, 80),
    surfaceTint: tone(P, 40)
  };
}
function buildM3ExportCss(seed) {
  const pal = buildM3Palettes(seed);
  const lines = [":root {", "  /* seed: " + seed + " \xB7 Material You (MD3) \xB7 exported by dshp-web-style */"];
  for (const key of M3_REF_ORDER) {
    for (const t of M3_TONES)
      lines.push("  --md-ref-palette-" + M3_REF_NAMES[key] + t + ": " + tone(pal[key], t) + ";");
  }
  const schemes = {
    light: buildM3Scheme(pal, "light"),
    dark: buildM3Scheme(pal, "dark")
  };
  for (const sk of ["light", "dark"]) {
    lines.push("  /* sys-" + sk + " */");
    const roles = schemes[sk];
    for (const role of M3_SYS_ORDER) {
      lines.push("  --md-sys-color-" + M3_SYS_NAMES[role] + "-" + sk + ": " + roles[role] + ";");
    }
  }
  lines.push("}");
  return lines.join("\n");
}
function buildPhotoTokens(input, scheme) {
  const pal = isPalettes(input) ? input : buildM3Palettes(typeof input === "string" ? input : input.seed ?? input.accent);
  const m = buildM3Scheme(pal, scheme);
  const dark = scheme === "dark";
  const brand = m.primary;
  const brandHover = dark ? tone(pal.primary, 70) : tone(pal.primary, 30);
  const info = m.tertiary;
  const infoHover = dark ? tone(pal.tertiary, 70) : tone(pal.tertiary, 30);
  const textPrimary = m.onSurface;
  const textSecondary = withAlpha(m.onSurface, dark ? 0.8 : 0.72);
  const textTertiary = m.onSurfaceVariant;
  const textQuaternary = m.outline;
  const border1 = m.outlineVariant;
  const border2 = m.outline;
  const hover = m.surfaceContainerHighest;
  const active = withAlpha(brand, 0.22);
  const err = m.error;
  return {
    // 背景
    "--dsw-alias-bg-base": m.surface,
    "--dsw-alias-bg-layer-1": m.surfaceContainerLow,
    "--dsw-alias-bg-layer-2": m.surfaceContainer,
    "--dsw-alias-bg-layer-3": m.surfaceContainerHigh,
    "--dsw-alias-bg-overlay": m.surfaceContainerLow,
    "--dsw-alias-bg-multi-select": m.surfaceContainer,
    "--dsw-alias-bg-module-platform": m.surfaceContainerLow,
    "--dsw-alias-bg-skeleton": m.surfaceContainer,
    // 边框
    "--dsw-alias-border-l1": border1,
    "--dsw-alias-border-l2": border2,
    "--dsw-alias-border-l2-darkmode-thin": border1,
    "--dsw-alias-border-l3": border2,
    "--dsw-alias-border-l4": dark ? textTertiary : border2,
    "--dsw-alias-border-inverted": textPrimary,
    "--dsw-alias-border-inverted2": textSecondary,
    "--dsw-alias-separator-primary": border1,
    "--dsw-alias-line-secondary": m.surfaceContainer,
    "--dsw-alias-fill-l2": m.surfaceContainer,
    "--dsw-alias-fill-tsp-secondary": withAlpha(m.onSurface, dark ? 0.05 : 0.04),
    // 品牌
    "--dsw-alias-brand-primary": brand,
    "--dsw-alias-brand-primary-invert": m.onPrimary,
    "--dsw-alias-brand-text": brand,
    // 按钮
    "--dsw-alias-button-primary-fill": brand,
    "--dsw-alias-button-primary-hover": brandHover,
    "--dsw-alias-button-primary-dimmed": brandHover,
    "--dsw-alias-button-contrast-fill": m.onSurface,
    "--dsw-alias-button-elevated-fill": m.surfaceContainerLow,
    "--dsw-alias-button-floating-fill": m.surfaceContainerLow,
    "--dsw-alias-button-floating-hover": m.surfaceContainer,
    "--dsw-alias-button-ghost-active-border": border2,
    "--dsw-alias-button-ghost-active-fill": hover,
    "--dsw-alias-button-ghost-active-hover": active,
    "--dsw-alias-button-info-fill": info,
    "--dsw-alias-button-info-hover": infoHover,
    "--dsw-alias-button-tool-bar-fill": m.surfaceContainerLow,
    "--dsw-alias-button-tool-bar-fill-invisible": "transparent",
    "--dsw-alias-button-tool-bar-hover": hover,
    // 交互
    "--dsw-alias-interactive-bg-hover": hover,
    "--dsw-alias-interactive-bg-active": active,
    "--dsw-alias-interactive-bg-hover-accent": withAlpha(brand, dark ? 0.2 : 0.12),
    "--dsw-alias-interactive-bg-hover-danger": withAlpha(err, dark ? 0.18 : 0.1),
    "--dsw-alias-interactive-bg-hover-solid": active,
    // 文字
    "--dsw-alias-label-primary": textPrimary,
    "--dsw-alias-label-secondary": textSecondary,
    "--dsw-alias-label-tertiary": textTertiary,
    "--dsw-alias-label-quaternary": textQuaternary,
    "--dsw-alias-label-caption": textTertiary,
    "--dsw-alias-label-dimmed": textQuaternary,
    "--dsw-alias-label-error": err,
    "--dsw-alias-label-primary-foreground": dark ? textPrimary : "#ffffff",
    "--dsw-alias-label-primary-inverted": dark ? m.surface : "#ffffff",
    "--dsw-alias-label-primary-bluish": brand,
    // 语义
    "--dsw-alias-state-error-primary": err,
    "--dsw-alias-state-error-secondary": withAlpha(err, dark ? 0.15 : 0.1),
    "--dsw-alias-state-success-primary": dark ? "#4ade80" : "#16a34a",
    "--dsw-alias-state-success-secondary": withAlpha("#22c55e", dark ? 0.15 : 0.1),
    "--dsw-alias-state-warn-primary": dark ? "#fbbf24" : "#d97706",
    "--dsw-alias-state-warn-secondary": withAlpha("#f59e0b", dark ? 0.15 : 0.1),
    "--dsw-alias-state-warn-label": dark ? "#fbbf24" : "#b45309",
    // Markdown
    "--dsw-alias-markdown-citation": brand,
    "--dsw-alias-markdown-code-block": m.surfaceContainerLow,
    "--dsw-alias-markdown-code-block-banner": m.surfaceContainer,
    "--dsw-alias-markdown-inline-code": withAlpha(brand, dark ? 0.14 : 0.1),
    "--dsw-alias-markdown-code-segment-selected": withAlpha(brand, dark ? 0.25 : 0.16),
    "--dsw-alias-markdown-code-segment-unselected": "transparent",
    "--dsw-alias-markdown-placeholder": textQuaternary,
    "--dsw-alias-markdown-tag": textTertiary,
    // 滚动条
    "--dsw-alias-scrollbar-bg-l1": border2,
    "--dsw-alias-scrollbar-bg-l2": m.surfaceContainer,
    "--dsw-alias-scrollbar-hover-l1": textTertiary,
    "--dsw-alias-scrollbar-hover-l2": border2,
    // 浮层
    "--dsw-alias-toast-bg": m.inverseSurface,
    "--dsw-alias-tooltip-bg": m.inverseSurface,
    "--dsw-hovercard-bg": m.surfaceContainerLow,
    // 特定区域
    "--dsw-specific-sidebar-fill": m.surface,
    "--dsw-specific-sidebar-nav-item-active": active,
    "--dsw-specific-sidebar-nav-item-active-accent": brand,
    "--dsw-specific-sidebar-nav-item-hover": hover,
    "--dsw-specific-bubble": m.surfaceContainerLow,
    "--dsw-specific-bubble-highlight": m.surfaceContainer,
    "--dsw-specific-input-major": m.surfaceContainerLow,
    "--dsw-specific-login-input": m.surfaceContainerLow,
    "--dsw-specific-menu": m.surfaceContainer,
    "--dsw-specific-selector": m.surfaceContainer,
    "--dsw-specific-tip": m.surfaceContainer,
    // 阴影
    "--dsw-shadow-lv1": dark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.08)",
    "--dsw-shadow-lv2": dark ? "0 4px 16px rgba(0,0,0,0.45)" : "0 2px 8px rgba(0,0,0,0.08)",
    "--dsw-shadow-lv3": dark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.1)",
    "--dsw-shadow-lv1-blur": "8px",
    // 自定义：body 渐变（renderBodyGradient 消费）
    "--dshp-ws-body-gradient": dark ? "radial-gradient(1000px 600px at 85% -10%, " + withAlpha(m.tertiary, 0.16) + ", transparent 55%), radial-gradient(900px 560px at 8% 108%, " + withAlpha(m.secondary, 0.13) + ", transparent 58%), linear-gradient(180deg, " + m.surface + ", " + tone(pal.neutral, 4) + ")" : "radial-gradient(1000px 600px at 85% -10%, " + withAlpha(m.tertiary, 0.22) + ", transparent 55%), radial-gradient(900px 560px at 8% 108%, " + withAlpha(m.secondary, 0.18) + ", transparent 58%), linear-gradient(180deg, " + m.surface + ", " + tone(pal.neutral, 96) + ")",
    "--dsw-font-family": '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    "--dsw-font-mono": '"Berkeley Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace'
  };
}
function buildWallpaperTheme(seed) {
  const palettes = buildM3Palettes(seed);
  return {
    seed,
    palettes,
    dark: buildPhotoTokens(palettes, "dark"),
    light: buildPhotoTokens(palettes, "light")
  };
}
function paletteFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.addEventListener("load", () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 48;
        canvas.height = 48;
        const c2d = canvas.getContext("2d", { willReadFrequently: true });
        if (!c2d) throw new Error("canvas 2d \u4E0A\u4E0B\u6587\u4E0D\u53EF\u7528");
        c2d.drawImage(img, 0, 0, 48, 48);
        const data = c2d.getImageData(0, 0, 48, 48).data;
        resolve(extractPalette(data));
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    });
    img.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("\u56FE\u7247\u89E3\u7801\u5931\u8D25"));
    });
    img.src = url;
  });
}

// src/client/official.ts
var OFFICIAL_LIGHT = {
  "--dsw-alias-bg-base": "var(--dsw-static-neutral-bluish-00)",
  "--dsw-alias-bg-layer-1": "var(--dsw-static-neutral-bluish-00)",
  "--dsw-alias-bg-layer-2": "var(--dsw-static-neutral-bluish-00)",
  "--dsw-alias-bg-layer-3": "var(--dsw-static-neutral-bluish-00)",
  "--dsw-alias-bg-mask-1": "#0000003d",
  "--dsw-alias-bg-mask-2": "#0000001f",
  "--dsw-alias-bg-mask-3": "#0000007a",
  "--dsw-alias-bg-mask-drop": "#ffffffb3",
  "--dsw-alias-bg-mask-photo": "#000000e0",
  "--dsw-alias-bg-module-platform": "var(--dsw-static-neutral-bluish-60)",
  "--dsw-alias-bg-multi-select": "var(--dsw-static-neutral-bluish-60)",
  "--dsw-alias-bg-overlay": "var(--dsw-static-neutral-bluish-150)",
  "--dsw-alias-bg-skeleton": "#0000000a",
  "--dsw-alias-border-inverted": "#0000",
  "--dsw-alias-border-inverted2": "#0000",
  "--dsw-alias-border-l1": "#0000000a",
  "--dsw-alias-border-l2": "#0000001a",
  "--dsw-alias-border-l2-darkmode-thin": "#0000001a",
  "--dsw-alias-border-l3": "#0000001f",
  "--dsw-alias-border-l4": "#00000029",
  "--dsw-alias-brand-primary": "var(--dsw-static-neutral-bluish-1000)",
  "--dsw-alias-brand-primary-invert": "var(--dsw-static-neutral-bluish-1000)",
  "--dsw-alias-brand-primary-new-colorprimary-new-color": "#4176e6",
  "--dsw-alias-brand-text": "var(--dsw-static-neutral-bluish-1000)",
  "--dsw-alias-button-contrast-fill": "var(--dsw-static-neutral-bluish-700)",
  "--dsw-alias-button-elevated-fill": "var(--dsw-static-neutral-bluish-00)",
  "--dsw-alias-button-floating-fill": "var(--dsw-static-neutral-bluish-00)",
  "--dsw-alias-button-floating-hover": "var(--dsw-static-neutral-bluish-75)",
  "--dsw-alias-button-ghost-active-border": "var(--dsw-static-neutral-bluish-500)",
  "--dsw-alias-button-ghost-active-fill": "var(--dsw-static-neutral-bluish-100)",
  "--dsw-alias-button-ghost-active-hover": "var(--dsw-static-neutral-bluish-150)",
  "--dsw-alias-button-info-fill": "var(--dsw-static-deepseek-500)",
  "--dsw-alias-button-info-hover": "var(--dsw-static-deepseek-400)",
  "--dsw-alias-button-primary-dimmed": "var(--dsw-static-neutral-bluish-100)",
  "--dsw-alias-button-primary-fill": "var(--dsw-alias-brand-primary)",
  "--dsw-alias-button-primary-hover": "var(--dsw-static-neutral-bluish-750)",
  "--dsw-alias-button-tool-bar-fill": "#54555780",
  "--dsw-alias-button-tool-bar-fill-invisible": "#1f1f1f5c",
  "--dsw-alias-button-tool-bar-hover": "#54555799",
  "--dsw-alias-interactive-bg-active": "#2631481a",
  "--dsw-alias-interactive-bg-hover": "#2631480f",
  "--dsw-alias-interactive-bg-hover-accent": "#26314824",
  "--dsw-alias-interactive-bg-hover-danger": "#ec13130d",
  "--dsw-alias-interactive-bg-hover-solid": "var(--dsw-static-neutral-bluish-75)",
  "--dsw-alias-label-caption": "var(--dsw-static-neutral-bluish-400)",
  "--dsw-alias-label-dimmed": "var(--dsw-static-neutral-bluish-200)",
  "--dsw-alias-label-primary": "var(--dsw-static-neutral-bluish-1000)",
  "--dsw-alias-label-primary-bluish": "var(--dsw-static-blue-900)",
  "--dsw-alias-label-primary-dimmed": "var(--dsw-static-neutral-bluish-950)",
  "--dsw-alias-label-primary-foreground": "var(--dsw-static-neutral-bluish-00)",
  "--dsw-alias-label-primary-inverted": "var(--dsw-static-neutral-bluish-00)",
  "--dsw-alias-label-secondary": "var(--dsw-static-neutral-bluish-700)",
  "--dsw-alias-label-tertiary": "var(--dsw-static-neutral-bluish-600)",
  "--dsw-alias-link": "var(--dsw-static-deepseek-500)",
  "--dsw-alias-markdown-citation": "var(--dsw-static-neutral-bluish-100)",
  "--dsw-alias-markdown-code-block": "var(--dsw-static-neutral-bluish-50)",
  "--dsw-alias-markdown-code-block-banner": "var(--dsw-static-neutral-bluish-50)",
  "--dsw-alias-markdown-code-segment-selected": "var(--dsw-static-neutral-bluish-00)",
  "--dsw-alias-markdown-code-segment-unselected": "var(--dsw-static-neutral-bluish-75)",
  "--dsw-alias-markdown-inline-code": "var(--dsw-static-neutral-50)",
  "--dsw-alias-markdown-placeholder": "var(--dsw-static-neutral-bluish-60)",
  "--dsw-alias-markdown-tag": "var(--dsw-static-neutral-bluish-75)",
  "--dsw-alias-scrollbar-bg-l1": "var(--dsw-static-neutral-200)",
  "--dsw-alias-scrollbar-bg-l2": "var(--dsw-static-neutral-200)",
  "--dsw-alias-scrollbar-hover-l1": "var(--dsw-static-neutral-300)",
  "--dsw-alias-scrollbar-hover-l2": "var(--dsw-static-neutral-300)",
  "--dsw-alias-state-business-primary": "var(--dsw-static-deepseek-500)",
  "--dsw-alias-state-business-tertiary": "var(--dsw-static-deepseek-100)",
  "--dsw-alias-state-error-primary": "var(--dsw-static-red-600)",
  "--dsw-alias-state-error-secondary": "var(--dsw-static-red-400)",
  "--dsw-alias-state-success-primary": "var(--dsw-static-green-500)",
  "--dsw-alias-state-success-secondary": "var(--dsw-static-green-400)",
  "--dsw-alias-state-success-tertiary": "var(--dsw-static-green-100)",
  "--dsw-alias-state-warn-label": "var(--dsw-static-amber-600)",
  "--dsw-alias-state-warn-primary": "var(--dsw-static-amber-500)",
  "--dsw-alias-state-warn-secondary": "var(--dsw-static-amber-400)",
  "--dsw-alias-state-warn-tertiary": "var(--dsw-static-amber-100)",
  "--dsw-alias-toast-bg": "var(--dsw-static-neutral-bluish-800)",
  "--dsw-alias-tooltip-bg": "var(--dsw-static-neutral-bluish-850)",
  "--dsw-specific-bubble": "var(--dsw-static-deepseek-50)",
  "--dsw-specific-bubble-highlight": "var(--dsw-static-deepseek-200)",
  "--dsw-specific-input-major": "var(--dsw-static-neutral-bluish-00)",
  "--dsw-specific-login-input": "var(--dsw-static-neutral-bluish-50)",
  "--dsw-specific-menu": "var(--dsw-alias-bg-layer-3)",
  "--dsw-specific-selector": "var(--dsw-static-neutral-bluish-60)",
  "--dsw-specific-sidebar-fill": "var(--dsw-static-neutral-bluish-50)",
  "--dsw-specific-sidebar-nav-item-active": "var(--dsw-static-neutral-bluish-100)",
  "--dsw-specific-sidebar-nav-item-active-accent": "var(--dsw-static-deepseek-100)",
  "--dsw-specific-sidebar-nav-item-hover": "var(--dsw-static-neutral-bluish-75)",
  "--dsw-specific-tip": "var(--dsw-static-neutral-bluish-60)"
};
var OFFICIAL_DARK = {
  "--dsw-alias-bg-base": "var(--dsw-static-neutral-bluish-950)",
  "--dsw-alias-bg-layer-1": "var(--dsw-static-neutral-bluish-875)",
  "--dsw-alias-bg-layer-2": "var(--dsw-static-neutral-bluish-850)",
  "--dsw-alias-bg-layer-3": "var(--dsw-static-neutral-bluish-800)",
  "--dsw-alias-bg-mask-1": "#00000080",
  "--dsw-alias-bg-mask-2": "#0003",
  "--dsw-alias-bg-mask-3": "#0000007a",
  "--dsw-alias-bg-mask-drop": "#272730b3",
  "--dsw-alias-bg-mask-photo": "#000000e0",
  "--dsw-alias-bg-module-platform": "var(--dsw-static-neutral-bluish-800)",
  "--dsw-alias-bg-multi-select": "var(--dsw-static-neutral-850)",
  "--dsw-alias-bg-overlay": "var(--dsw-static-neutral-bluish-700)",
  "--dsw-alias-bg-skeleton": "#ffffff14",
  "--dsw-alias-border-inverted": "#ffffff0f",
  "--dsw-alias-border-inverted2": "#ffffff14",
  "--dsw-alias-border-l1": "#ffffff0f",
  "--dsw-alias-border-l2": "#ffffff1f",
  "--dsw-alias-border-l2-darkmode-thin": "#ffffff0f",
  "--dsw-alias-border-l3": "#ffffff29",
  "--dsw-alias-border-l4": "#fff3",
  "--dsw-alias-brand-primary": "var(--dsw-static-neutral-bluish-50)",
  "--dsw-alias-brand-primary-invert": "var(--dsw-static-neutral-bluish-50)",
  "--dsw-alias-brand-primary-new-colorprimary-new-color": "var(--dsw-static-deepseek-450)",
  "--dsw-alias-brand-text": "var(--dsw-static-neutral-bluish-50)",
  "--dsw-alias-button-contrast-fill": "var(--dsw-static-neutral-bluish-50)",
  "--dsw-alias-button-elevated-fill": "var(--dsw-static-neutral-bluish-750)",
  "--dsw-alias-button-floating-fill": "var(--dsw-static-neutral-bluish-850)",
  "--dsw-alias-button-floating-hover": "var(--dsw-static-neutral-bluish-800)",
  "--dsw-alias-button-ghost-active-border": "var(--dsw-static-neutral-bluish-600)",
  "--dsw-alias-button-ghost-active-fill": "var(--dsw-static-neutral-bluish-750)",
  "--dsw-alias-button-ghost-active-hover": "var(--dsw-static-neutral-bluish-700)",
  "--dsw-alias-button-info-fill": "var(--dsw-static-deepseek-400)",
  "--dsw-alias-button-info-hover": "var(--dsw-static-deepseek-500)",
  "--dsw-alias-button-primary-dimmed": "var(--dsw-static-neutral-bluish-750)",
  "--dsw-alias-button-primary-fill": "var(--dsw-alias-brand-primary)",
  "--dsw-alias-button-primary-hover": "var(--dsw-static-neutral-bluish-100)",
  "--dsw-alias-button-tool-bar-fill": "#54555780",
  "--dsw-alias-button-tool-bar-fill-invisible": "#1f1f1f5c",
  "--dsw-alias-button-tool-bar-hover": "#54555799",
  "--dsw-alias-interactive-bg-active": "#ffffff24",
  "--dsw-alias-interactive-bg-hover": "#ffffff14",
  "--dsw-alias-interactive-bg-hover-accent": "#ffffff3d",
  "--dsw-alias-interactive-bg-hover-danger": "#f25a5a26",
  "--dsw-alias-interactive-bg-hover-solid": "var(--dsw-static-neutral-bluish-800)",
  "--dsw-alias-label-caption": "var(--dsw-static-neutral-bluish-600)",
  "--dsw-alias-label-dimmed": "var(--dsw-static-neutral-bluish-750)",
  "--dsw-alias-label-primary": "var(--dsw-static-neutral-bluish-50)",
  "--dsw-alias-label-primary-bluish": "var(--dsw-static-neutral-bluish-50)",
  "--dsw-alias-label-primary-dimmed": "var(--dsw-static-neutral-bluish-100)",
  "--dsw-alias-label-primary-foreground": "var(--dsw-static-neutral-bluish-1000)",
  "--dsw-alias-label-primary-inverted": "var(--dsw-static-neutral-bluish-800)",
  "--dsw-alias-label-secondary": "var(--dsw-static-neutral-bluish-300)",
  "--dsw-alias-label-tertiary": "var(--dsw-static-neutral-bluish-400)",
  "--dsw-alias-link": "var(--dsw-static-deepseek-400)",
  "--dsw-alias-markdown-citation": "var(--dsw-static-neutral-bluish-800)",
  "--dsw-alias-markdown-code-block": "var(--dsw-static-neutral-bluish-900)",
  "--dsw-alias-markdown-code-block-banner": "var(--dsw-static-neutral-bluish-850)",
  "--dsw-alias-markdown-code-segment-selected": "var(--dsw-static-neutral-bluish-800)",
  "--dsw-alias-markdown-code-segment-unselected": "var(--dsw-static-neutral-bluish-900)",
  "--dsw-alias-markdown-inline-code": "var(--dsw-static-neutral-800)",
  "--dsw-alias-markdown-placeholder": "var(--dsw-static-neutral-bluish-850)",
  "--dsw-alias-markdown-tag": "var(--dsw-static-neutral-bluish-850)",
  "--dsw-alias-scrollbar-bg-l1": "var(--dsw-static-neutral-700)",
  "--dsw-alias-scrollbar-bg-l2": "var(--dsw-static-neutral-600)",
  "--dsw-alias-scrollbar-hover-l1": "var(--dsw-static-neutral-600)",
  "--dsw-alias-scrollbar-hover-l2": "var(--dsw-static-neutral-550)",
  "--dsw-alias-state-business-primary": "var(--dsw-static-deepseek-400)",
  "--dsw-alias-state-business-tertiary": "var(--dsw-static-deepseek-800)",
  "--dsw-alias-state-error-primary": "var(--dsw-static-red-400)",
  "--dsw-alias-state-error-secondary": "var(--dsw-static-red-400)",
  "--dsw-alias-state-success-primary": "var(--dsw-static-green-500)",
  "--dsw-alias-state-success-secondary": "var(--dsw-static-green-400)",
  "--dsw-alias-state-success-tertiary": "var(--dsw-static-green-900)",
  "--dsw-alias-state-warn-label": "var(--dsw-static-amber-600)",
  "--dsw-alias-state-warn-primary": "var(--dsw-static-amber-500)",
  "--dsw-alias-state-warn-secondary": "var(--dsw-static-amber-400)",
  "--dsw-alias-state-warn-tertiary": "var(--dsw-static-amber-900)",
  "--dsw-alias-toast-bg": "var(--dsw-static-neutral-bluish-750)",
  "--dsw-alias-tooltip-bg": "var(--dsw-static-neutral-bluish-750)",
  "--dsw-specific-bubble": "var(--dsw-static-neutral-bluish-850)",
  "--dsw-specific-bubble-highlight": "var(--dsw-static-neutral-bluish-750)",
  "--dsw-specific-input-major": "var(--dsw-static-neutral-bluish-850)",
  "--dsw-specific-login-input": "var(--dsw-static-neutral-bluish-900)",
  "--dsw-specific-menu": "var(--dsw-alias-bg-layer-3)",
  "--dsw-specific-selector": "var(--dsw-static-neutral-bluish-800)",
  "--dsw-specific-sidebar-fill": "var(--dsw-static-neutral-bluish-900)",
  "--dsw-specific-sidebar-nav-item-active": "var(--dsw-static-neutral-bluish-750)",
  "--dsw-specific-sidebar-nav-item-active-accent": "var(--dsw-static-neutral-bluish-800)",
  "--dsw-specific-sidebar-nav-item-hover": "var(--dsw-static-neutral-bluish-850)",
  "--dsw-specific-tip": "var(--dsw-static-neutral-bluish-800)"
};

// src/client/radius.ts
var CSS_ID = "dshp-web-style-radius-css";
var SURFACES = '[class*="_card"],[class*="_panel"],[class*="_bubble"],[class*="-card"],[class*="-panel"],[class*="-bubble"],button,input,textarea,select';
function applyRadius(radius) {
  const old = document.getElementById(CSS_ID);
  if (old) old.remove();
  const r = Number(radius && radius.global);
  const css2 = [];
  if (Number.isFinite(r)) {
    if (r === 0) {
      css2.push(SURFACES + "{border-radius:0 !important}");
    } else if (r > 0) {
      css2.push(SURFACES + "{border-radius:" + Math.min(24, r) + "px !important}");
    }
  }
  if (css2.length > 0) {
    const style = document.createElement("style");
    style.id = CSS_ID;
    style.textContent = css2.join("\n");
    document.head.appendChild(style);
  }
}

// src/client/state.ts
var state = {
  desiredId: "",
  photoTheme: null,
  desiredRadius: -1,
  overrideDispose: null,
  renderBodyGradient: null
};

// src/client/themes.ts
var THEMES = [
  {
    id: "claude-parchment-light",
    colorScheme: "light",
    label: "Claude \u7F8A\u76AE\u7EB8",
    desc: "\u7F8A\u76AE\u7EB8 #f5f4ed + \u8D64\u9676 #c96442",
    swatch: ["#f5f4ed", "#faf9f5", "#c96442", "#141413"]
  },
  {
    id: "levels-light",
    colorScheme: "light",
    label: "Levels \u7EB8\u611F\u8BC4\u5BA1",
    desc: "\u7C73\u7EB8 #fbf7ef + \u4EE3\u8C22\u7EFF #2f8f46",
    swatch: ["#fbf7ef", "#ffffff", "#2f8f46", "#1f2a24"]
  },
  {
    id: "arc-light",
    colorScheme: "light",
    label: "Arc \u871C\u6843\u73CA\u745A",
    desc: "\u871C\u6843 #fdf3ec + \u73CA\u745A #ff5f5f",
    swatch: ["#fdf3ec", "#ffffff", "#ff5f5f", "#1a1a1f"]
  },
  {
    id: "luxury-dark",
    colorScheme: "dark",
    label: "Luxury \u938F\u91D1\u9ED1",
    desc: "\u66DC\u77F3 #080706 + \u938F\u91D1 #c6a15b",
    swatch: ["#080706", "#151310", "#c6a15b", "#fff8ea"]
  },
  {
    id: "xiaohongshu-light",
    colorScheme: "light",
    label: "\u5C0F\u7EA2\u4E66 \u79CD\u8349\u7EA2",
    desc: "\u7C73\u7070 #f5f5f5 + \u79CD\u8349\u7EA2 #ff2442",
    swatch: ["#f5f5f5", "#ffffff", "#ff2442", "rgba(0, 0, 0, 0.8)"]
  },
  {
    id: "supabase-dark",
    colorScheme: "dark",
    label: "Supabase \u7FE1\u7FE0\u591C",
    desc: "\u58A8\u9ED1 #171717 + \u7FE1\u7FE0\u7EFF #3ecf8e",
    swatch: ["#171717", "#1c1c1c", "#3ecf8e", "#fafafa"]
  },
  {
    id: "sakura-light",
    colorScheme: "light",
    label: "Sakura \u6A31\u7C89",
    desc: "\u6A31\u767D #fff9fa + \u6A31\u7C89 #e75480",
    swatch: ["#fff9fa", "#fbeef2", "#e75480", "#432635"]
  }
];
var BUILTIN_LABELS = {
  light: "\u6D45\u8272\uFF08\u5185\u7F6E\uFF09",
  dark: "\u6DF1\u8272\uFF08\u5185\u7F6E\uFF09"
};
var PHOTO_ID = "photo:custom";

// src/client/apply-theme.ts
var OVERRIDE_SOURCE = "dshp-web-style";
var BODY_GRADIENT_ID = "dshp-web-style-body-gradient";
function findStaticTheme(id) {
  for (const t of THEMES) if (t.id === id) return t;
  return null;
}
function buildPair(t, tokens) {
  const officialSide = t.colorScheme === "dark" ? OFFICIAL_LIGHT : OFFICIAL_DARK;
  const pair = {};
  for (const [name, value] of Object.entries(tokens)) {
    const opposite = name in officialSide ? officialSide[name] : value;
    pair[name] = t.colorScheme === "dark" ? { light: opposite, dark: value } : { dark: opposite, light: value };
  }
  return pair;
}
function buildPhotoPair() {
  const wt = state.photoTheme;
  if (!wt) return null;
  const pair = {};
  for (const [name, value] of Object.entries(wt.dark)) {
    pair[name] = { dark: value, light: wt.light[name] ?? value };
  }
  return pair;
}
function renderBodyGradient(theme) {
  state.renderBodyGradient = () => renderBodyGradient(theme);
  const old = document.getElementById(BODY_GRADIENT_ID);
  if (old) old.remove();
  const active = theme.getTheme();
  if (!active || !active.active || !active.active.tokens) return;
  const grad = active.active.tokens["--dshp-ws-body-gradient"];
  if (!grad) return;
  const style = document.createElement("style");
  style.id = BODY_GRADIENT_ID;
  style.textContent = "body{background:" + grad + " !important}";
  document.head.appendChild(style);
}
function applyThemeChoice(theme, bridge, themeId) {
  try {
    if (state.overrideDispose) {
      state.overrideDispose();
      state.overrideDispose = null;
    }
    if (!themeId) {
      renderBodyGradient(theme);
      return;
    }
    if (themeId === PHOTO_ID) {
      const pair = buildPhotoPair();
      if (!pair) {
        renderBodyGradient(theme);
        return;
      }
      state.overrideDispose = theme.overrideTokens(OVERRIDE_SOURCE, pair);
      renderBodyGradient(theme);
      return;
    }
    const t = findStaticTheme(themeId);
    if (!t) {
      console.warn("[dshp-web-style] \u672A\u77E5\u4E3B\u9898 id\uFF0C\u5DF2\u56DE\u5B98\u65B9: " + themeId);
      state.desiredId = "";
      renderBodyGradient(theme);
      return;
    }
    bridge.themes().then((map) => {
      if (state.desiredId !== themeId) return;
      const tokens = map[themeId];
      if (!tokens) {
        console.error("[dshp-web-style] \u4E3B\u9898\u4E0B\u53D1\u7F3A\u5931: " + themeId);
        return;
      }
      try {
        if (state.overrideDispose) {
          state.overrideDispose();
          state.overrideDispose = null;
        }
        state.overrideDispose = theme.overrideTokens(OVERRIDE_SOURCE, buildPair(t, tokens));
        const pref = theme.getTheme().preference;
        if (pref !== t.colorScheme) theme.setTheme(t.colorScheme);
      } catch (e) {
        console.error("[dshp-web-style] \u4E3B\u9898\u8986\u76D6\u5931\u8D25: " + String(e?.message ?? e));
      }
      renderBodyGradient(theme);
    }).catch((e) => {
      console.error("[dshp-web-style] \u4E3B\u9898 token \u4E0B\u53D1\u5931\u8D25: " + String(e?.message ?? e));
    });
  } catch (e) {
    console.error("[dshp-web-style] \u4E3B\u9898\u8986\u76D6\u5931\u8D25: " + String(e?.message ?? e));
  }
}
function restoreFromHost(theme, bridge) {
  bridge.state().then((reply) => {
    if (!reply || reply.ok !== true) return;
    const saved = typeof reply.themeId === "string" ? reply.themeId : "";
    const pal = reply.photoPalette;
    if (pal && typeof pal.accent === "string") {
      state.photoTheme = buildWallpaperTheme(pal.seed ?? pal.accent);
    }
    state.desiredId = saved;
    if (saved.length > 0) applyThemeChoice(theme, bridge, saved);
    applyRadius(reply.radius);
    state.desiredRadius = reply.radius && typeof reply.radius.global === "number" ? reply.radius.global : -1;
  }).catch((e) => {
    console.log("[dshp-web-style] \u8BFB\u53D6\u6301\u4E45\u5316\u914D\u7F6E\u5931\u8D25: " + String(e?.message ?? e));
  });
}
function disposeOverride() {
  if (state.overrideDispose) {
    try {
      state.overrideDispose();
    } catch {
    }
    state.overrideDispose = null;
  }
}

// src/client/api.ts
var BASE = "/ext/dshp-web-style";
function createBridge() {
  const state2 = async () => {
    const response = await fetch(BASE + "/state", { cache: "no-store" });
    return await response.json();
  };
  let cachedTokens = null;
  const themes = async () => {
    if (cachedTokens) return cachedTokens;
    const response = await fetch(BASE + "/themes", { cache: "no-store" });
    const reply = await response.json();
    if (!reply || reply.ok !== true || !Array.isArray(reply.themes)) {
      throw new Error(reply && reply.error || "\u4E3B\u9898\u76EE\u5F55\u4E0B\u53D1\u5931\u8D25");
    }
    const map = {};
    for (const th of reply.themes) {
      if (th && typeof th.id === "string" && th.tokens && typeof th.tokens === "object") {
        map[th.id] = th.tokens;
      }
    }
    cachedTokens = map;
    return map;
  };
  const saveTheme = async (themeId) => {
    const response = await fetch(BASE + "/theme", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ themeId })
    });
    return await response.json();
  };
  const saveConfig = async (patch) => {
    const response = await fetch(BASE + "/config", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch || {})
    });
    return await response.json();
  };
  return { state: state2, themes, saveTheme, saveConfig };
}

// src/client/GallerySection.tsx
var import_react = require("react");

// src/client/clipboard.ts
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      const p = navigator.clipboard.writeText(text);
      if (p && typeof p.then === "function") return p;
    } catch {
    }
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (ok) resolve();
      else reject(new Error("copy failed"));
    } catch (e) {
      reject(e);
    }
  });
}

// dsh-css-module:dsh-css:src/client/styles.module.css.mjs
var css = "._0K34_a_page{max-width:800px;color:var(--dsw-alias-label-primary);flex-direction:column;gap:8px;display:flex}._0K34_a_topbar{background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;flex-direction:column;gap:6px;padding:8px 10px;display:flex}._0K34_a_release{font:inherit;cursor:pointer;color:var(--dsw-alias-state-business-primary);background:0 0;border:none;padding:0;font-size:12px}._0K34_a_release:hover{text-decoration:underline}._0K34_a_release:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;border-radius:2px}._0K34_a_ctl{flex-wrap:wrap;align-items:center;gap:8px;display:flex}._0K34_a_ctlLabel{color:var(--dsw-alias-label-tertiary);flex:none;font-size:12px}._0K34_a_ctlSep{background:var(--dsw-alias-border-l2);flex:none;width:1px;height:16px}._0K34_a_head{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}._0K34_a_headErr{color:var(--dsw-alias-state-error-primary)}._0K34_a_headOk{color:var(--dsw-alias-state-success-primary)}._0K34_a_list{flex-direction:column;gap:8px;padding-top:8px;display:flex}._0K34_a_now{background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;align-items:center;gap:10px;padding:8px 10px;display:flex}._0K34_a_nowMosaic{border:.5px solid var(--dsw-alias-border-l2);border-radius:7px;flex:none;width:76px;height:30px;display:flex;overflow:hidden}._0K34_a_nowMosaic i{min-width:0;height:100%;display:block}._0K34_a_nowMeta{flex-direction:column;flex:1;gap:0;min-width:0;display:flex}._0K34_a_nowTitle{color:var(--dsw-alias-label-primary);white-space:nowrap;text-overflow:ellipsis;font-size:12px;font-weight:700;line-height:17px;overflow:hidden}._0K34_a_nowSub{color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;font-size:11px;line-height:15px;overflow:hidden}._0K34_a_nowDots{flex:none;align-items:center;gap:5px;display:flex}._0K34_a_nowDots i{border:.5px solid var(--dsw-alias-border-l2);border-radius:50%;width:12px;height:12px;display:block}._0K34_a_toolbar{flex-wrap:wrap;align-items:center;gap:8px;display:flex}._0K34_a_search{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:170px;max-width:100%;height:26px;color:var(--dsw-alias-label-primary);border-radius:13px;outline:none;padding:0 11px;font-size:12px;line-height:26px}._0K34_a_search::placeholder{color:var(--dsw-alias-label-tertiary)}._0K34_a_search:focus{border-color:var(--dsw-alias-brand-primary)}._0K34_a_count{color:var(--dsw-alias-label-tertiary);white-space:nowrap;margin-left:auto;font-size:11px}._0K34_a_wall{background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;flex-direction:column;gap:8px;padding:10px;display:flex}._0K34_a_wallHead{flex-wrap:wrap;align-items:center;gap:8px;display:flex}._0K34_a_wallTitle{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:700;line-height:18px}._0K34_a_seedChip{background:var(--dsw-alias-bg-layer-1);height:22px;color:var(--dsw-alias-label-secondary);border-radius:11px;align-items:center;gap:5px;padding:0 9px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;display:inline-flex}._0K34_a_seedChip i{border:.5px solid var(--dsw-alias-border-l2);border-radius:50%;width:11px;height:11px;display:block}._0K34_a_wallActions{flex-wrap:wrap;align-items:center;gap:6px;margin-left:auto;display:flex}._0K34_a_wallBody{flex-direction:column;gap:6px;display:flex}._0K34_a_toneRow{align-items:center;gap:6px;display:flex}._0K34_a_toneName{width:88px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:14px;overflow:hidden}._0K34_a_toneCells{flex:1;gap:2px;min-width:0;display:flex}._0K34_a_toneCells i{border-radius:4px;flex:1;min-width:0;height:20px;display:block}._0K34_a_roles{flex-direction:column;gap:3px;display:flex}._0K34_a_roleRow{align-items:flex-start;gap:6px;display:flex}._0K34_a_chips{flex-wrap:wrap;flex:1;gap:4px;min-width:0;display:flex}._0K34_a_chip{background:var(--dsw-alias-bg-layer-1);height:20px;color:var(--dsw-alias-label-secondary);white-space:nowrap;border-radius:10px;align-items:center;gap:4px;padding:0 7px;font-size:10px;line-height:20px;display:inline-flex}._0K34_a_chip i{border-radius:3px;flex:none;width:10px;height:10px;display:block}._0K34_a_grid{grid-template-columns:repeat(4,minmax(0,1fr));align-items:stretch;gap:8px;display:grid}@media (width<=720px){._0K34_a_grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (width<=520px){._0K34_a_grid{grid-template-columns:repeat(2,minmax(0,1fr))}._0K34_a_search{width:130px}}._0K34_a_card{box-sizing:border-box;cursor:pointer;text-align:left;font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;flex-direction:column;width:100%;min-width:0;padding:0;transition:border-color .15s,box-shadow .15s,transform .15s;display:flex;overflow:hidden}._0K34_a_card:hover:not(._0K34_a_active){border-color:var(--dsw-alias-border-l4)}._0K34_a_card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}._0K34_a_card._0K34_a_active{background:var(--dsw-alias-bg-module-platform)}._0K34_a_mosaic{flex:none;height:44px;display:flex;position:relative}._0K34_a_mosaic i{min-width:0;height:100%;display:block}._0K34_a_mA{flex:5}._0K34_a_mB{flex:3}._0K34_a_mC{flex:2}._0K34_a_idx{color:#ffffffe0;text-shadow:0 1px 3px #00000073;letter-spacing:.04em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;line-height:12px;position:absolute;top:4px;right:6px}._0K34_a_body{flex-direction:column;gap:1px;min-width:0;padding:7px 9px 8px;display:flex}._0K34_a_tag{white-space:nowrap;text-overflow:ellipsis;font-size:10px;font-weight:600;line-height:14px;overflow:hidden}._0K34_a_title{color:var(--dsw-alias-label-primary);white-space:nowrap;text-overflow:ellipsis;font-size:13px;font-weight:700;line-height:18px;overflow:hidden}._0K34_a_desc{color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;font-size:10px;line-height:14px;overflow:hidden}._0K34_a_foot{align-items:center;gap:6px;margin-top:6px;display:flex}._0K34_a_use{cursor:pointer;border:none;border-radius:11px;flex:none;justify-content:center;align-items:center;height:22px;padding:0 10px;font-size:11px;font-weight:600;line-height:22px;display:inline-flex}._0K34_a_use:hover{filter:brightness(1.08)}._0K34_a_live{white-space:nowrap;align-items:center;gap:4px;font-size:10px;font-weight:500;line-height:14px;display:inline-flex}._0K34_a_live i{background:currentColor;border-radius:50%;flex:none;width:5px;height:5px;display:inline-block}._0K34_a_check{flex:none;margin-left:auto;font-size:11px;font-weight:700}._0K34_a_radiusBtns{flex-wrap:wrap;align-items:center;gap:6px;display:flex}._0K34_a_radiusBtn{box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);height:24px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:12px;align-items:center;gap:6px;padding:0 10px;font-size:11px;line-height:24px;display:inline-flex}._0K34_a_radiusBtn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}._0K34_a_radiusBtn._0K34_a_active{background:var(--dsw-alias-bg-multi-select);box-shadow:inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)}@media (prefers-reduced-motion:reduce){._0K34_a_card{transition:none}}";
var tagId = "@dshp/web-style/src/client/styles.module.css";
if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css="${tagId}"]`) === null) {
  const tag = document.createElement("style");
  tag.setAttribute("data-plugin", "@dshp/web-style");
  tag.setAttribute("data-plugin-css", tagId);
  tag.textContent = css;
  document.head.appendChild(tag);
}
var styles_module_css_default = { "active": "_0K34_a_active", "body": "_0K34_a_body", "card": "_0K34_a_card", "check": "_0K34_a_check", "chip": "_0K34_a_chip", "chips": "_0K34_a_chips", "count": "_0K34_a_count", "ctl": "_0K34_a_ctl", "ctlLabel": "_0K34_a_ctlLabel", "ctlSep": "_0K34_a_ctlSep", "desc": "_0K34_a_desc", "foot": "_0K34_a_foot", "grid": "_0K34_a_grid", "head": "_0K34_a_head", "headErr": "_0K34_a_headErr", "headOk": "_0K34_a_headOk", "idx": "_0K34_a_idx", "list": "_0K34_a_list", "live": "_0K34_a_live", "mA": "_0K34_a_mA", "mB": "_0K34_a_mB", "mC": "_0K34_a_mC", "mosaic": "_0K34_a_mosaic", "now": "_0K34_a_now", "nowDots": "_0K34_a_nowDots", "nowMeta": "_0K34_a_nowMeta", "nowMosaic": "_0K34_a_nowMosaic", "nowSub": "_0K34_a_nowSub", "nowTitle": "_0K34_a_nowTitle", "page": "_0K34_a_page", "radiusBtn": "_0K34_a_radiusBtn", "radiusBtns": "_0K34_a_radiusBtns", "release": "_0K34_a_release", "roleRow": "_0K34_a_roleRow", "roles": "_0K34_a_roles", "search": "_0K34_a_search", "seedChip": "_0K34_a_seedChip", "tag": "_0K34_a_tag", "title": "_0K34_a_title", "toneCells": "_0K34_a_toneCells", "toneName": "_0K34_a_toneName", "toneRow": "_0K34_a_toneRow", "toolbar": "_0K34_a_toolbar", "topbar": "_0K34_a_topbar", "use": "_0K34_a_use", "wall": "_0K34_a_wall", "wallActions": "_0K34_a_wallActions", "wallBody": "_0K34_a_wallBody", "wallHead": "_0K34_a_wallHead", "wallTitle": "_0K34_a_wallTitle" };

// src/client/GallerySection.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function cx(...names) {
  return names.filter((name) => name !== void 0).join(" ");
}
function accentOf(t) {
  if (t && typeof t.accent === "string" && t.accent) return t.accent;
  if (t && Array.isArray(t.swatch) && typeof t.swatch[2] === "string") return t.swatch[2];
  return "#2f81f7";
}
var INK_ON_LIGHT = "#ffffff";
var INK_ON_DARK = "#111111";
function relLuminance(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [n >> 16 & 255, n >> 8 & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function inkOn(fill) {
  const l = relLuminance(fill);
  if (l === null) return INK_ON_LIGHT;
  const lLight = relLuminance(INK_ON_LIGHT);
  const lDark = relLuminance(INK_ON_DARK);
  const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  return ratio(l, lLight) >= ratio(l, lDark) ? INK_ON_LIGHT : INK_ON_DARK;
}
function mosaicOf(t) {
  if (t && t.id === PHOTO_ID && state.photoTheme) {
    const pal = state.photoTheme.palettes;
    return [pal.secondary[60], state.photoTheme.seed, pal.tertiary[60]];
  }
  const sw = t && Array.isArray(t.swatch) ? t.swatch : [];
  return [sw[0] || "#222222", sw[1] || "#444444", accentOf(t)];
}
function GallerySection({ ctx, theme, bridge }) {
  const [, setRevision] = (0, import_react.useState)(-1);
  const [notice, setNotice] = (0, import_react.useState)(null);
  const [radiusCfg, setRadiusCfg] = (0, import_react.useState)(state.desiredRadius);
  const [query, setQuery] = (0, import_react.useState)("");
  const [schemeFilter, setSchemeFilter] = (0, import_react.useState)("all");
  const [photoBusy, setPhotoBusy] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(
    () => ctx.on("theme/change", function(snap2) {
      const s = snap2;
      setRevision(s && typeof s.revision === "number" ? s.revision : 0);
      if (typeof state.renderBodyGradient === "function") state.renderBodyGradient();
    }),
    []
  );
  const snap = theme.getTheme();
  const current = snap && snap.active ? snap.active.id ?? "" : "";
  const resolved = snap && snap.preference === "system" ? current === "dark" ? "dark" : "light" : snap ? snap.preference ?? current : current;
  const label = {};
  for (const t of THEMES) label[t.id] = t.label;
  label[PHOTO_ID] = "\u58C1\u7EB8\u53D6\u8272";
  label["light"] = BUILTIN_LABELS.light;
  label["dark"] = BUILTIN_LABELS.dark;
  const currentLabel = state.desiredId.length > 0 && label[state.desiredId] ? label[state.desiredId] : resolved === "dark" ? BUILTIN_LABELS.dark : resolved === "light" ? BUILTIN_LABELS.light : current;
  const pick = function(t) {
    state.desiredId = t.id;
    applyThemeChoice(theme, bridge, t.id);
    bridge.saveTheme(t.id).then(function(reply) {
      setNotice(
        reply && reply.ok ? null : { err: reply && reply.error || "\u4E3B\u9898\u9009\u62E9\u4FDD\u5B58\u5931\u8D25\uFF08\u91CD\u542F\u540E\u4F1A\u56DE\u5230\u5B98\u65B9\u9ED8\u8BA4\uFF09" }
      );
    }).catch(function(e) {
      setNotice({ err: "\u4E3B\u9898\u9009\u62E9\u4FDD\u5B58\u5931\u8D25\uFF1A" + String(e?.message ?? e) });
    });
  };
  const release = function() {
    state.desiredId = "";
    applyThemeChoice(theme, bridge, "");
    bridge.saveTheme("").then(function(reply) {
      setNotice(
        reply && reply.ok ? { err: null, ok: "\u5DF2\u56DE\u5230\u5B98\u65B9\u9ED8\u8BA4\u914D\u8272\uFF1B\u4EAE/\u6697\u8BF7\u7528\u4E0A\u65B9\u300C\u5916\u89C2\u300D\u884C\u5207\u6362" } : { err: reply && reply.error || "\u6E05\u9664\u5931\u8D25" }
      );
    }).catch(function(e) {
      setNotice({ err: "\u6E05\u9664\u5931\u8D25\uFF1A" + String(e?.message ?? e) });
    });
  };
  const mkCard = (t, active, onPick, idx) => {
    const accent = accentOf(t);
    const mosaic = mosaicOf(t);
    const schemeLabel = t.colorScheme === "dark" ? "\u6DF1\u8272" : "\u6D45\u8272";
    const tagText = t.tag || schemeLabel + " \xB7 " + accent;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: cx(styles_module_css_default.card, active ? styles_module_css_default.active : void 0),
        "aria-pressed": active,
        style: active ? { borderColor: accent, boxShadow: "0 0 0 1px " + accent } : void 0,
        onClick: onPick,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.mosaic, "aria-hidden": true, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: styles_module_css_default.mA, style: { background: mosaic[0] } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: styles_module_css_default.mB, style: { background: mosaic[1] } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: styles_module_css_default.mC, style: { background: accent } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.idx, children: idx || "" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.body, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.tag, style: { color: accent }, title: tagText, children: tagText }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.title, children: t.label }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.desc, title: t.desc, children: t.desc }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.foot, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.use, style: { background: accent, color: inkOn(accent) }, children: active ? "\u4F7F\u7528\u4E2D" : "\u542F\u7528" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.live, style: { color: accent, opacity: active ? 1 : 0.72 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
                active ? "Live" : schemeLabel
              ] }),
              active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.check, style: { color: accent }, children: "\u2713" }) : null
            ] })
          ] })
        ]
      },
      t.id
    );
  };
  const ALL_THEMES = THEMES.map(function(t, i) {
    return { data: t, idx: String(i + 1).padStart(3, "0") };
  });
  const pickPhoto = function(file) {
    if (!file) return;
    setPhotoBusy(true);
    paletteFromFile(file).then(function(palette) {
      const seed = palette.accent;
      const wt = buildWallpaperTheme(seed);
      state.photoTheme = wt;
      state.desiredId = PHOTO_ID;
      applyThemeChoice(theme, bridge, PHOTO_ID);
      const pal = wt.palettes;
      bridge.saveConfig({
        photoPalette: {
          accent: seed,
          companionA: pal.tertiary[60],
          companionB: pal.secondary[60]
        }
      }).then(function(reply) {
        setPhotoBusy(false);
        setNotice(
          reply && reply.ok ? { err: null, ok: "\u58C1\u7EB8 MD3 \u914D\u8272\u5DF2\u751F\u6210\uFF08seed " + seed + "\uFF09\u5E76\u4FDD\u5B58\uFF1B\u4EAE/\u6697\u8DDF\u968F\u300C\u5916\u89C2\u300D\u884C" } : { err: "\u914D\u8272\u5DF2\u751F\u6548\u4F46\u4FDD\u5B58\u5931\u8D25\uFF08\u91CD\u542F\u540E\u4F1A\u4E22\u5931\u53D6\u8272\uFF09" }
        );
      }).catch(function() {
        setPhotoBusy(false);
        setNotice({ err: "\u914D\u8272\u5DF2\u751F\u6548\u4F46\u4FDD\u5B58\u5931\u8D25" });
      });
      bridge.saveTheme(PHOTO_ID).catch(function() {
      });
    }).catch(function(e) {
      setPhotoBusy(false);
      setNotice({ err: "\u53D6\u8272\u5931\u8D25\uFF1A" + String(e?.message ?? e) });
    });
  };
  const photoActive = state.desiredId === PHOTO_ID;
  const enableWallpaper = function() {
    if (!state.photoTheme) {
      setNotice({ err: "\u8FD8\u6CA1\u6709\u58C1\u7EB8\u914D\u8272\uFF0C\u5148\u4E0A\u4F20\u4E00\u5F20\u58C1\u7EB8\u53D6\u8272" });
      return;
    }
    state.desiredId = PHOTO_ID;
    applyThemeChoice(theme, bridge, PHOTO_ID);
    bridge.saveTheme(PHOTO_ID).then(function(reply) {
      setNotice(reply && reply.ok ? null : { err: reply && reply.error || "\u542F\u7528\u5931\u8D25" });
    }).catch(function(e) {
      setNotice({ err: "\u542F\u7528\u5931\u8D25\uFF1A" + String(e?.message ?? e) });
    });
  };
  const clearWallpaper = function() {
    state.photoTheme = null;
    if (state.desiredId === PHOTO_ID) {
      state.desiredId = "";
      applyThemeChoice(theme, bridge, "");
    }
    bridge.saveTheme("").catch(function() {
    });
    bridge.saveConfig({ photoPalette: null }).then(function(reply) {
      setNotice(
        reply && reply.ok ? { err: null, ok: "\u58C1\u7EB8\u914D\u8272\u5DF2\u6E05\u9664\uFF0C\u56DE\u5230\u5B98\u65B9\u9ED8\u8BA4" } : { err: reply && reply.error || "\u6E05\u9664\u5931\u8D25" }
      );
    }).catch(function(e) {
      setNotice({ err: "\u6E05\u9664\u5931\u8D25\uFF1A" + String(e?.message ?? e) });
    });
  };
  const copyM3 = function() {
    const wt = state.photoTheme;
    if (!wt) {
      setNotice({ err: "\u8FD8\u6CA1\u6709\u58C1\u7EB8\u914D\u8272\uFF0C\u5148\u4E0A\u4F20\u4E00\u5F20\u58C1\u7EB8\u53D6\u8272" });
      return;
    }
    copyText(buildM3ExportCss(wt.seed)).then(
      function() {
        setNotice({
          err: null,
          ok: "MD3 \u4EE4\u724C\u5DF2\u590D\u5236\uFF08--md-ref-palette-* \xD7156 + --md-sys-color-*-light/dark \xD774\uFF09"
        });
      },
      function(e) {
        setNotice({ err: "\u590D\u5236\u5931\u8D25\uFF1A" + String(e?.message ?? e) });
      }
    );
  };
  const pickRadius = function(v) {
    state.desiredRadius = v;
    setRadiusCfg(v);
    bridge.saveConfig({ radius: { global: v } }).then(function(reply) {
      if (reply && reply.ok === true) applyRadius(reply.radius);
    }).catch(function() {
    });
  };
  const rdNow = typeof radiusCfg === "number" ? radiusCfg : -1;
  const radiusButtons = [
    ["-1", "\u9ED8\u8BA4"],
    ["0", "\u9510\u89D2"],
    ["12", "\u5706\u6DA6"]
  ].map(function(opt) {
    const value = Number(opt[0]);
    const active = rdNow === value;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: cx(styles_module_css_default.radiusBtn, active ? styles_module_css_default.active : void 0),
        "aria-pressed": active,
        title: opt[0] === "-1" ? "\u8DDF\u968F\u4E3B\u9898" : opt[0] === "0" ? "\u5168\u9510\u89D2" : "\u7EDF\u4E00 12px \u5706\u6DA6",
        onClick: function() {
          pickRadius(value);
        },
        children: opt[1]
      },
      opt[0]
    );
  });
  const topbar = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.topbar, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.ctl, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.ctlLabel, children: "\u5706\u89D2" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_module_css_default.radiusBtns, children: radiusButtons }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.ctlSep }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: styles_module_css_default.release, onClick: release, children: "\u56DE\u5230\u5B98\u65B9" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.head, children: "\u70B9\u51FB\u5361\u7247\u5207\u6362\uFF0C\u81EA\u52A8\u4FDD\u5B58" })
    ] }),
    notice && notice.err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: cx(styles_module_css_default.head, styles_module_css_default.headErr), children: notice.err }) : null,
    notice && notice.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: cx(styles_module_css_default.head, styles_module_css_default.headOk), children: notice.ok }) : null
  ] });
  const photoTheme = state.photoTheme;
  const wallSeed = photoTheme ? photoTheme.seed : null;
  const wallAccent = photoTheme ? resolved === "dark" ? photoTheme.palettes.primary[80] : photoTheme.palettes.primary[40] : "#2f81f7";
  const wallToneRows = photoTheme ? ["primary", "secondary", "tertiary", "neutral", "neutralVariant"].map(function(name) {
    const cells = M3_PREVIEW_TONES.map(function(t) {
      const hex = photoTheme.palettes[name][t];
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: hex }, title: name + t + " " + hex }, t);
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.toneRow, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.toneName, children: name === "neutralVariant" ? "neutral-variant" : name }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.toneCells, children: cells })
    ] }, name);
  }) : null;
  const wallRoleRows = photoTheme ? ["light", "dark"].map(function(sk) {
    const roles = buildM3Scheme(photoTheme.palettes, sk);
    const keys = [
      "primary",
      "onPrimary",
      "primaryContainer",
      "onPrimaryContainer",
      "secondary",
      "secondaryContainer",
      "tertiary",
      "tertiaryContainer",
      "surface",
      "surfaceContainer",
      "surfaceContainerHighest",
      "onSurface",
      "outline",
      "error",
      "errorContainer"
    ];
    const chips = keys.map(function(k) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.chip, title: "--md-sys-color-" + k + "-" + sk + " " + roles[k], children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: roles[k] } }),
        k
      ] }, k);
    });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.roleRow, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.toneName, children: sk === "light" ? "\u6D45\u8272" : "\u6DF1\u8272" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.chips, children: chips })
    ] }, sk);
  }) : null;
  const wallSection = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.wall, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.wallHead, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.wallTitle, children: "\u58C1\u7EB8\u53D6\u8272 \xB7 Material You" }),
      wallSeed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.seedChip, title: "seed " + wallSeed, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: wallSeed } }),
        wallSeed
      ] }) : null,
      photoActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.live, style: { color: wallAccent }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
        "Live"
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.wallActions, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "label",
          {
            className: styles_module_css_default.radiusBtn,
            style: { cursor: photoBusy ? "wait" : "pointer", opacity: photoBusy ? 0.6 : 1 },
            children: [
              photoBusy ? "\u53D6\u8272\u4E2D\u2026" : "\u4E0A\u4F20\u58C1\u7EB8",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "file",
                  accept: ".png,.jpg,.jpeg,.webp",
                  style: { display: "none" },
                  disabled: photoBusy,
                  onChange: function(e) {
                    pickPhoto(e.target.files && e.target.files[0]);
                    e.target.value = "";
                  }
                }
              )
            ]
          }
        ),
        photoTheme && !photoActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: styles_module_css_default.radiusBtn, onClick: enableWallpaper, children: "\u542F\u7528\u914D\u8272" }) : null,
        photoTheme ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: styles_module_css_default.radiusBtn,
            onClick: copyM3,
            title: "\u590D\u5236 MD3 \u4EE4\u724C\uFF08ref \u8C03\u8272\u677F + \u4EAE/\u6697 sys \u8272\u5F69\uFF09",
            children: "\u590D\u5236 MD3"
          }
        ) : null,
        photoTheme ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: styles_module_css_default.release, onClick: clearWallpaper, children: "\u6E05\u9664" }) : null
      ] })
    ] }),
    photoTheme ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.wallBody, children: [
      wallToneRows,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_module_css_default.roles, children: wallRoleRows })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.head, children: "\u4E0A\u4F20\u4E00\u5F20\u58C1\u7EB8\uFF0C\u751F\u6210\u6574\u5957 MD3 \u52A8\u6001\u914D\u8272\uFF085 \u7EC4 ref \u8C03\u8272\u677F \xD7 \u4EAE/\u6697 scheme\uFF09\uFF1B\u672C\u5730\u91C7\u6837\u4E0D\u4E0A\u4F20\u3002" })
  ] });
  const nowTheme = (function() {
    if (state.desiredId === PHOTO_ID) {
      return photoTheme ? {
        id: PHOTO_ID,
        label: "\u58C1\u7EB8\u53D6\u8272",
        desc: "seed " + photoTheme.seed + " \xB7 MD3 \u52A8\u6001\u914D\u8272",
        colorScheme: "dark",
        accent: photoTheme.seed
      } : {
        id: PHOTO_ID,
        label: "\u58C1\u7EB8\u53D6\u8272",
        desc: "\u53D6\u8272\u6570\u636E\u7F3A\u5931\uFF0C\u8BF7\u91CD\u65B0\u4E0A\u4F20\u58C1\u7EB8",
        colorScheme: "dark",
        accent: "#2f81f7"
      };
    }
    return findStaticTheme(state.desiredId);
  })();
  const nowMosaic = nowTheme ? mosaicOf(nowTheme) : ["var(--dsw-alias-bg-layer-1)", "var(--dsw-alias-bg-layer-2)", "var(--dsw-alias-brand-primary)"];
  const nowAccent = nowTheme ? accentOf(nowTheme) : "#2f81f7";
  const nowStrip = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.now, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.nowMosaic, "aria-hidden": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: styles_module_css_default.mA, style: { background: nowMosaic[0] } }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: styles_module_css_default.mB, style: { background: nowMosaic[1] } }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: styles_module_css_default.mC, style: { background: nowAccent } })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.nowMeta, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.nowTitle, children: "\u6B63\u5728\u4F7F\u7528\uFF1A" + currentLabel }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.nowSub, children: nowTheme ? nowTheme.desc + " \xB7 " + nowAccent : "\u5B98\u65B9\u9ED8\u8BA4\u914D\u8272 \xB7 \u8DDF\u968F\u300C\u5916\u89C2\u300D\u4EAE/\u6697" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_module_css_default.nowDots, "aria-hidden": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: nowMosaic[0] } }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: nowMosaic[1] } }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { background: nowAccent } })
    ] })
  ] });
  const q = query.trim().toLowerCase();
  const matchEntry = function(entry) {
    const t = entry.data;
    if (schemeFilter !== "all" && t.colorScheme !== schemeFilter) return false;
    if (!q) return true;
    const hay = (t.label + " " + t.desc + " " + t.id + " " + accentOf(t)).toLowerCase();
    return hay.indexOf(q) !== -1;
  };
  const schemePills = [
    ["all", "\u5168\u90E8"],
    ["dark", "\u6DF1\u8272"],
    ["light", "\u6D45\u8272"]
  ].map(function(opt) {
    const active = schemeFilter === opt[0];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: cx(styles_module_css_default.radiusBtn, active ? styles_module_css_default.active : void 0),
        "aria-pressed": active,
        onClick: function() {
          setSchemeFilter(opt[0]);
        },
        children: opt[1]
      },
      opt[0]
    );
  });
  const visibleEntries = ALL_THEMES.filter(matchEntry);
  const toolbar = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.toolbar, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        className: styles_module_css_default.search,
        type: "search",
        placeholder: "\u641C\u7D22\u4E3B\u9898\u2026",
        value: query,
        onChange: function(e) {
          setQuery(e.target.value);
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_module_css_default.radiusBtns, children: schemePills }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.count, children: visibleEntries.length + " / " + ALL_THEMES.length })
  ] });
  const cards = visibleEntries.map(function(entry) {
    const t = entry.data;
    return mkCard(
      t,
      state.desiredId === t.id,
      function() {
        pick(t);
      },
      entry.idx
    );
  });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.page, children: [
    topbar,
    wallSection,
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_module_css_default.list, children: [
      nowStrip,
      toolbar,
      cards.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_module_css_default.grid, children: cards }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_module_css_default.head, children: "\u65E0\u5339\u914D\u4E3B\u9898\uFF0C\u6362\u4E2A\u5173\u952E\u8BCD\u6216\u5207\u6362\u4EAE/\u6697\u8FC7\u6EE4\u8BD5\u8BD5\u3002" })
    ] })
  ] });
}

// src/client/index.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var SETTINGS_NS = "dshp-web-style";
var SETTINGS_ORDER = 50;
var SETTINGS_LABEL = "\u5916\u89C2\u5B9A\u5236";
var inject = ["slots", "theme"];
function apply(ctx) {
  const slots = ctx.get("slots");
  const theme = ctx.get("theme");
  if (slots === void 0 || theme === void 0) return;
  const bridge = createBridge();
  restoreFromHost(theme, bridge);
  ctx.effect(() => () => disposeOverride(), "dshp-web-style: override teardown");
  try {
    ctx.effect(
      () => slots.inject(
        "settings.section",
        () => slots.register(
          { name: "settings.section", id: SETTINGS_NS, order: SETTINGS_ORDER, label: SETTINGS_LABEL },
          // 槽位只传它自己的 props；ctx / theme / bridge 是 apply 作用域的依赖，由这层薄适配器注入。
          () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(GallerySection, { ctx, theme, bridge })
        )
      ),
      "dshp-web-style: settings section"
    );
  } catch (error) {
    console.error("[dshp-web-style] \u6CE8\u518C\u8BBE\u7F6E\u8282\u5931\u8D25\uFF0C\u5916\u89C2\u5B9A\u5236\u9875\u5C06\u4E0D\u53EF\u7528\uFF1A", error);
  }
}
return module.exports; } });
