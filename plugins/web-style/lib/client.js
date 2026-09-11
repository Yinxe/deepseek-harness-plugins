(function () {
  'use strict';

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
    const active = m.surfaceContainerHigh;
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
    "--dsw-alias-bg-mask-photo": "#000000e0",
    "--dsw-alias-bg-mask-drop": "#ffffffb3",
    "--dsw-alias-bg-module-platform": "var(--dsw-static-neutral-bluish-60)",
    "--dsw-alias-bg-multi-select": "var(--dsw-static-neutral-bluish-60)",
    "--dsw-alias-bg-overlay": "var(--dsw-static-neutral-bluish-150)",
    "--dsw-alias-bg-skeleton": "#0000000a",
    "--dsw-alias-border-inverted2": "#0000",
    "--dsw-alias-border-inverted": "#0000",
    "--dsw-alias-border-l1": "#0000000a",
    "--dsw-alias-border-l2-darkmode-thin": "#0000001a",
    "--dsw-alias-border-l2": "#0000001a",
    "--dsw-alias-border-l3": "#0000001f",
    "--dsw-alias-border-l4": "#00000029",
    "--dsw-alias-brand-primary-invert": "var(--dsw-static-neutral-bluish-1000)",
    "--dsw-alias-brand-primary": "var(--dsw-static-neutral-bluish-1000)",
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
    "--dsw-alias-button-tool-bar-fill-invisible": "#1f1f1f5c",
    "--dsw-alias-button-tool-bar-fill": "#54555780",
    "--dsw-alias-button-tool-bar-hover": "#54555799",
    "--dsw-alias-interactive-bg-active": "#2631481a",
    "--dsw-alias-interactive-bg-hover-accent": "#26314824",
    "--dsw-alias-interactive-bg-hover-danger": "#ec13130d",
    "--dsw-alias-interactive-bg-hover-solid": "var(--dsw-static-neutral-bluish-75)",
    "--dsw-alias-interactive-bg-hover": "#2631480f",
    "--dsw-alias-label-caption": "var(--dsw-static-neutral-bluish-400)",
    "--dsw-alias-label-dimmed": "var(--dsw-static-neutral-bluish-200)",
    "--dsw-alias-label-primary-bluish": "var(--dsw-static-blue-900)",
    "--dsw-alias-label-primary-dimmed": "var(--dsw-static-neutral-bluish-950)",
    "--dsw-alias-label-primary-foreground": "var(--dsw-static-neutral-bluish-00)",
    "--dsw-alias-label-primary-inverted": "var(--dsw-static-neutral-bluish-00)",
    "--dsw-alias-label-primary": "var(--dsw-static-neutral-bluish-1000)",
    "--dsw-alias-label-secondary": "var(--dsw-static-neutral-bluish-700)",
    "--dsw-alias-label-tertiary": "var(--dsw-static-neutral-bluish-600)",
    "--dsw-alias-markdown-citation": "var(--dsw-static-neutral-bluish-100)",
    "--dsw-alias-markdown-code-block-banner": "var(--dsw-static-neutral-bluish-50)",
    "--dsw-alias-markdown-code-block": "var(--dsw-static-neutral-bluish-50)",
    "--dsw-alias-markdown-code-segment-selected": "var(--dsw-static-neutral-bluish-00)",
    "--dsw-alias-markdown-code-segment-unselected": "var(--dsw-static-neutral-bluish-75)",
    "--dsw-alias-markdown-inline-code": "var(--dsw-static-neutral-bluish-100)",
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
    "--dsw-specific-bubble-highlight": "var(--dsw-static-deepseek-200)",
    "--dsw-specific-bubble": "var(--dsw-static-deepseek-50)",
    "--dsw-specific-input-major": "var(--dsw-static-neutral-bluish-00)",
    "--dsw-specific-login-input": "var(--dsw-static-neutral-bluish-50)",
    "--dsw-specific-menu": "var(--dsw-alias-bg-layer-3)",
    "--dsw-specific-selector": "var(--dsw-static-neutral-bluish-60)",
    "--dsw-specific-sidebar-fill": "var(--dsw-static-neutral-bluish-50)",
    "--dsw-specific-sidebar-nav-item-active-accent": "var(--dsw-static-deepseek-100)",
    "--dsw-specific-sidebar-nav-item-active": "var(--dsw-static-neutral-bluish-100)",
    "--dsw-specific-sidebar-nav-item-hover": "var(--dsw-static-neutral-bluish-75)",
    "--dsw-specific-tip": "var(--dsw-static-neutral-bluish-60)"
  };
  var OFFICIAL_DARK = {
    "--dsw-alias-bg-base": "var(--dsw-static-neutral-bluish-950)",
    "--dsw-alias-bg-layer-1": "var(--dsw-static-neutral-bluish-900)",
    "--dsw-alias-bg-layer-2": "var(--dsw-static-neutral-bluish-850)",
    "--dsw-alias-bg-layer-3": "var(--dsw-static-neutral-bluish-800)",
    "--dsw-alias-bg-mask-1": "#ffffff1a",
    "--dsw-alias-bg-mask-2": "#ffffff0f",
    "--dsw-alias-bg-mask-3": "#ffffff4d",
    "--dsw-alias-bg-mask-photo": "#000000e0",
    "--dsw-alias-bg-mask-drop": "#ffffff33",
    "--dsw-alias-bg-module-platform": "var(--dsw-static-neutral-bluish-900)",
    "--dsw-alias-bg-multi-select": "var(--dsw-static-neutral-bluish-850)",
    "--dsw-alias-bg-overlay": "var(--dsw-static-neutral-bluish-850)",
    "--dsw-alias-bg-skeleton": "#ffffff0d",
    "--dsw-alias-border-inverted2": "#0000",
    "--dsw-alias-border-inverted": "#0000",
    "--dsw-alias-border-l1": "#ffffff12",
    "--dsw-alias-border-l2-darkmode-thin": "#ffffff14",
    "--dsw-alias-border-l2": "#ffffff1f",
    "--dsw-alias-border-l3": "#ffffff29",
    "--dsw-alias-border-l4": "#ffffff33",
    "--dsw-alias-brand-primary-invert": "var(--dsw-static-neutral-bluish-00)",
    "--dsw-alias-brand-primary": "var(--dsw-static-deepseek-400)",
    "--dsw-alias-brand-text": "var(--dsw-static-deepseek-400)",
    "--dsw-alias-button-contrast-fill": "var(--dsw-static-neutral-bluish-100)",
    "--dsw-alias-button-elevated-fill": "var(--dsw-static-neutral-bluish-900)",
    "--dsw-alias-button-floating-fill": "var(--dsw-static-neutral-bluish-850)",
    "--dsw-alias-button-floating-hover": "var(--dsw-static-neutral-bluish-800)",
    "--dsw-alias-button-ghost-active-border": "var(--dsw-static-neutral-bluish-600)",
    "--dsw-alias-button-ghost-active-fill": "var(--dsw-static-neutral-bluish-850)",
    "--dsw-alias-button-ghost-active-hover": "var(--dsw-static-neutral-bluish-800)",
    "--dsw-alias-button-info-fill": "var(--dsw-static-deepseek-400)",
    "--dsw-alias-button-info-hover": "var(--dsw-static-deepseek-300)",
    "--dsw-alias-button-primary-dimmed": "var(--dsw-static-deepseek-600)",
    "--dsw-alias-button-primary-fill": "var(--dsw-alias-brand-primary)",
    "--dsw-alias-button-primary-hover": "var(--dsw-static-deepseek-450)",
    "--dsw-alias-button-tool-bar-fill-invisible": "#54555799",
    "--dsw-alias-button-tool-bar-fill": "#54555780",
    "--dsw-alias-button-tool-bar-hover": "#54555799",
    "--dsw-alias-interactive-bg-active": "#5686fe29",
    "--dsw-alias-interactive-bg-hover-accent": "#5686fe33",
    "--dsw-alias-interactive-bg-hover-danger": "#f25a5a33",
    "--dsw-alias-interactive-bg-hover-solid": "var(--dsw-static-neutral-bluish-800)",
    "--dsw-alias-interactive-bg-hover": "#5686fe1f",
    "--dsw-alias-label-caption": "var(--dsw-static-neutral-bluish-500)",
    "--dsw-alias-label-dimmed": "var(--dsw-static-neutral-bluish-600)",
    "--dsw-alias-label-primary-bluish": "var(--dsw-static-blue-100)",
    "--dsw-alias-label-primary-dimmed": "var(--dsw-static-neutral-bluish-50)",
    "--dsw-alias-label-primary-foreground": "var(--dsw-static-neutral-bluish-950)",
    "--dsw-alias-label-primary-inverted": "var(--dsw-static-neutral-bluish-00)",
    "--dsw-alias-label-primary": "var(--dsw-static-neutral-bluish-00)",
    "--dsw-alias-label-secondary": "var(--dsw-static-neutral-bluish-100)",
    "--dsw-alias-label-tertiary": "var(--dsw-static-neutral-bluish-600)",
    "--dsw-alias-markdown-citation": "var(--dsw-static-deepseek-400)",
    "--dsw-alias-markdown-code-block-banner": "var(--dsw-static-neutral-bluish-900)",
    "--dsw-alias-markdown-code-block": "var(--dsw-static-neutral-bluish-900)",
    "--dsw-alias-markdown-code-segment-selected": "var(--dsw-static-neutral-bluish-50)",
    "--dsw-alias-markdown-code-segment-unselected": "var(--dsw-static-neutral-bluish-700)",
    "--dsw-alias-markdown-inline-code": "var(--dsw-static-neutral-bluish-800)",
    "--dsw-alias-markdown-placeholder": "var(--dsw-static-neutral-bluish-700)",
    "--dsw-alias-markdown-tag": "var(--dsw-static-neutral-bluish-700)",
    "--dsw-alias-scrollbar-bg-l1": "var(--dsw-static-neutral-400)",
    "--dsw-alias-scrollbar-bg-l2": "var(--dsw-static-neutral-500)",
    "--dsw-alias-scrollbar-hover-l1": "var(--dsw-static-neutral-500)",
    "--dsw-alias-scrollbar-hover-l2": "var(--dsw-static-neutral-600)",
    "--dsw-alias-state-business-primary": "var(--dsw-static-deepseek-400)",
    "--dsw-alias-state-business-tertiary": "var(--dsw-static-deepseek-100)",
    "--dsw-alias-state-error-primary": "var(--dsw-static-red-400)",
    "--dsw-alias-state-error-secondary": "var(--dsw-static-red-400)",
    "--dsw-alias-state-success-primary": "var(--dsw-static-green-400)",
    "--dsw-alias-state-success-secondary": "var(--dsw-static-green-400)",
    "--dsw-alias-state-success-tertiary": "var(--dsw-static-green-100)",
    "--dsw-alias-state-warn-label": "var(--dsw-static-amber-400)",
    "--dsw-alias-state-warn-primary": "var(--dsw-static-amber-400)",
    "--dsw-alias-state-warn-secondary": "var(--dsw-static-amber-400)",
    "--dsw-alias-state-warn-tertiary": "var(--dsw-static-amber-100)",
    "--dsw-alias-toast-bg": "var(--dsw-static-neutral-bluish-800)",
    "--dsw-alias-tooltip-bg": "var(--dsw-static-neutral-bluish-850)",
    "--dsw-specific-bubble-highlight": "var(--dsw-static-deepseek-700)",
    "--dsw-specific-bubble": "var(--dsw-static-deepseek-800)",
    "--dsw-specific-input-major": "var(--dsw-static-neutral-bluish-900)",
    "--dsw-specific-login-input": "var(--dsw-static-neutral-bluish-850)",
    "--dsw-specific-menu": "var(--dsw-alias-bg-layer-3)",
    "--dsw-specific-selector": "var(--dsw-static-neutral-bluish-850)",
    "--dsw-specific-sidebar-fill": "var(--dsw-static-neutral-bluish-900)",
    "--dsw-specific-sidebar-nav-item-active-accent": "var(--dsw-static-deepseek-700)",
    "--dsw-specific-sidebar-nav-item-active": "var(--dsw-static-neutral-bluish-800)",
    "--dsw-specific-sidebar-nav-item-hover": "var(--dsw-static-neutral-bluish-850)",
    "--dsw-specific-tip": "var(--dsw-static-neutral-bluish-700)"
  };

  // src/client/radius.ts
  var CSS_ID = "dshp-web-style-radius-css";
  var SURFACES = '[class*="_card"],[class*="_panel"],[class*="_bubble"],[class*="-card"],[class*="-panel"],[class*="-bubble"],button,input,textarea,select';
  function applyRadius(radius) {
    const old = document.getElementById(CSS_ID);
    if (old) old.remove();
    const r = Number(radius && radius.global);
    const css = [];
    if (Number.isFinite(r)) {
      if (r === 0) {
        css.push(SURFACES + "{border-radius:0 !important}");
      } else if (r > 0) {
        css.push(SURFACES + "{border-radius:" + Math.min(24, r) + "px !important}");
      }
    }
    if (css.length > 0) {
      const style = document.createElement("style");
      style.id = CSS_ID;
      style.textContent = css.join("\n");
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
      id: "opencode-terminal-dark",
      colorScheme: "dark",
      label: "OpenCode \u66B1\u591C\u7EC8\u7AEF",
      desc: "\u6696\u9ED1 #201d1d + Apple \u84DD\uFF0C\u5168\u7AD9 mono",
      swatch: ["#201d1d", "#302c2c", "#007aff", "#30d158"]
    },
    {
      id: "opencode-terminal-light",
      colorScheme: "light",
      label: "OpenCode \u7EB8\u611F\u7EC8\u7AEF",
      desc: "\u6696\u767D #fdfcfc + \u6696\u7070\u5C42\u6B21",
      swatch: ["#fdfcfc", "#f1eeee", "#201d1d", "#007aff"]
    },
    {
      id: "github-dark",
      colorScheme: "dark",
      label: "GitHub \u6697\u8272 Primer",
      desc: "#0d1117 + Primer \u84DD #2f81f7",
      swatch: ["#0d1117", "#161b22", "#2f81f7", "#3fb950"]
    },
    {
      id: "github-light",
      colorScheme: "light",
      label: "GitHub \u4EAE\u8272 Primer",
      desc: "\u7EAF\u767D + #0969da + \u7EFF\u8272\u6309\u94AE",
      swatch: ["#ffffff", "#f6f8fa", "#0969da", "#1f883d"]
    },
    {
      id: "linear-dark",
      colorScheme: "dark",
      label: "Linear \u6697\u591C\u65E0\u5F69",
      desc: "\u8FD1\u9ED1 #08090a + Indigo #5e6ad2",
      swatch: ["#08090a", "#191a1b", "#5e6ad2", "#f7f8f8"]
    },
    {
      id: "notion-light",
      colorScheme: "light",
      label: "Notion \u6696\u767D\u6781\u7B80",
      desc: "\u7EAF\u767D + \u6696\u7070 + Notion \u84DD",
      swatch: ["#ffffff", "#f6f5f4", "#31302e", "#0075de"]
    },
    {
      id: "claude-parchment-light",
      colorScheme: "light",
      label: "Claude \u7F8A\u76AE\u7EB8",
      desc: "\u7F8A\u76AE\u7EB8 #f5f4ed + \u8D64\u9676 #c96442",
      swatch: ["#f5f4ed", "#faf9f5", "#c96442", "#141413"]
    },
    {
      id: "nvidia-dark",
      colorScheme: "dark",
      label: "NVIDIA \u786C\u6838\u7EFF",
      desc: "\u7EAF\u9ED1 #000 + \u4FE1\u53F7\u7EFF #76b900",
      swatch: ["#000000", "#1a1a1a", "#76b900", "#ffffff"]
    },
    {
      id: "replicate-light",
      colorScheme: "light",
      label: "Replicate \u5F00\u53D1\u8005\u7EA2",
      desc: "\u7EAF\u767D #ffffff + \u54C1\u724C\u7EA2 #ea2804",
      swatch: ["#ffffff", "#f8f8f8", "#ea2804", "#202020"]
    },
    {
      id: "cisco-dark",
      colorScheme: "dark",
      label: "Cisco \u4FE1\u4EFB\u84DD",
      desc: "\u85CF\u9752 #0f1720 + \u4FE1\u53F7\u84DD #049fd9",
      swatch: ["#0f1720", "#1b2530", "#049fd9", "#ffffff"]
    },
    {
      id: "neobrutalism-light",
      colorScheme: "light",
      label: "Neobrutalism \u7C97\u91CE\u62FC\u8D34",
      desc: "\u5976\u6CB9 #fff4cf + \u6A58\u7EA2 #d24b1f",
      swatch: ["#fff4cf", "#fffaf0", "#d24b1f", "#2a1810"]
    },
    {
      id: "mission-control-dark",
      colorScheme: "dark",
      label: "Mission Control \u6DF1\u7A7A",
      desc: "\u6DF1\u7A7A #090b12 + \u6307\u6325\u84DD #60a5fa",
      swatch: ["#090b12", "#121722", "#60a5fa", "#f8fafc"]
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
      id: "skeumorphism-light",
      colorScheme: "light",
      label: "Skeumorphism \u62DF\u7269\u9676\u571F",
      desc: "\u9676\u571F #f7eee6 + \u9676\u91C9 #b46a46",
      swatch: ["#f7eee6", "#fff8f1", "#b46a46", "#2b211c"]
    },
    {
      id: "wechat-light",
      colorScheme: "light",
      label: "WeChat \u5FAE\u4FE1\u7EFF",
      desc: "\u6D45\u7070 #ededed + \u5FAE\u4FE1\u7EFF #07c160",
      swatch: ["#ededed", "#f7f7f7", "#07c160", "#1a1a1a"]
    },
    {
      id: "xiaohongshu-light",
      colorScheme: "light",
      label: "\u5C0F\u7EA2\u4E66 \u79CD\u8349\u7EA2",
      desc: "\u7C73\u7070 #f5f5f5 + \u79CD\u8349\u7EA2 #ff2442",
      swatch: ["#f5f5f5", "#ffffff", "#ff2442", "rgba(0, 0, 0, 0.8)"]
    },
    {
      id: "discord-dark",
      colorScheme: "dark",
      label: "Discord Blurple\u591C",
      desc: "\u6DF1\u7070 #313338 + Blurple #5865f2",
      swatch: ["#313338", "#2b2d31", "#5865f2", "#dbdee1"]
    },
    {
      id: "supabase-dark",
      colorScheme: "dark",
      label: "Supabase \u7FE1\u7FE0\u591C",
      desc: "\u58A8\u9ED1 #171717 + \u7FE1\u7FE0\u7EFF #3ecf8e",
      swatch: ["#171717", "#1c1c1c", "#3ecf8e", "#fafafa"]
    },
    {
      id: "nebula-dark",
      colorScheme: "dark",
      label: "Nebula \u661F\u4E91\u7D2B",
      desc: "\u7D2B\u9ED1 #0d0a1a + \u9713\u7D2B #8b5cf6",
      swatch: ["#0d0a1a", "#161230", "#8b5cf6", "#f1edfd"]
    },
    {
      id: "sakura-light",
      colorScheme: "light",
      label: "Sakura \u6A31\u7C89",
      desc: "\u6A31\u767D #fff9fa + \u6A31\u7C89 #e75480",
      swatch: ["#fff9fa", "#fbeef2", "#e75480", "#432635"]
    },
    {
      id: "tide-dark",
      colorScheme: "dark",
      label: "Tide \u6F6E\u6C50\u9752",
      desc: "\u6DF1\u9752 #062a2c + \u6F6E\u6C50 #2dd4bf",
      swatch: ["#062a2c", "#0b3538", "#2dd4bf", "#eafaf8"]
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

  // src/client/GallerySection.ts
  function accentOf(t) {
    if (t && typeof t.accent === "string" && t.accent) return t.accent;
    if (t && Array.isArray(t.swatch) && typeof t.swatch[2] === "string") return t.swatch[2];
    return "#2f81f7";
  }
  function mosaicOf(t) {
    if (t && t.id === PHOTO_ID && state.photoTheme) {
      const pal = state.photoTheme.palettes;
      return [pal.secondary[60], state.photoTheme.seed, pal.tertiary[60]];
    }
    const sw = t && Array.isArray(t.swatch) ? t.swatch : [];
    return [sw[0] || "#222222", sw[1] || "#444444", accentOf(t)];
  }
  function createGallery(React, ctx, theme, bridge) {
    function ThemeGallery() {
      const [, setRevision] = React.useState(-1);
      const [notice, setNotice] = React.useState(null);
      const [radiusCfg, setRadiusCfg] = React.useState(state.desiredRadius);
      const [query, setQuery] = React.useState("");
      const [schemeFilter, setSchemeFilter] = React.useState("all");
      const [photoBusy, setPhotoBusy] = React.useState(false);
      React.useEffect(function() {
        return ctx.on("theme/change", function(snap2) {
          const s = snap2;
          setRevision(s && typeof s.revision === "number" ? s.revision : 0);
          if (typeof state.renderBodyGradient === "function") state.renderBodyGradient();
        });
      }, []);
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
        return React.createElement(
          "button",
          {
            key: t.id,
            type: "button",
            className: active ? "tg-card tg-active" : "tg-card",
            "aria-pressed": active,
            style: active ? { borderColor: accent, boxShadow: "0 0 0 1px " + accent } : null,
            onClick: onPick
          },
          React.createElement(
            "span",
            { className: "tg-mosaic", "aria-hidden": true },
            React.createElement("i", { className: "tg-mA", style: { background: mosaic[0] } }),
            React.createElement("i", { className: "tg-mB", style: { background: mosaic[1] } }),
            React.createElement("i", { className: "tg-mC", style: { background: accent } }),
            React.createElement("span", { className: "tg-idx" }, idx || "")
          ),
          React.createElement(
            "span",
            { className: "tg-body" },
            React.createElement(
              "span",
              { className: "tg-tag", style: { color: accent }, title: tagText },
              tagText
            ),
            React.createElement("span", { className: "tg-title" }, t.label),
            React.createElement("span", { className: "tg-desc", title: t.desc }, t.desc),
            React.createElement(
              "span",
              { className: "tg-foot" },
              React.createElement(
                "span",
                { className: "tg-use", style: { background: accent } },
                active ? "\u4F7F\u7528\u4E2D" : "\u542F\u7528"
              ),
              React.createElement(
                "span",
                { className: "tg-live", style: { color: accent, opacity: active ? 1 : 0.72 } },
                React.createElement("i", null),
                active ? "Live" : schemeLabel
              ),
              active ? React.createElement("span", { className: "tg-check", style: { color: accent } }, "\u2713") : null
            )
          )
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
        return React.createElement(
          "button",
          {
            key: opt[0],
            type: "button",
            className: active ? "tg-radiusBtn tg-active" : "tg-radiusBtn",
            "aria-pressed": active,
            title: opt[0] === "-1" ? "\u8DDF\u968F\u4E3B\u9898" : opt[0] === "0" ? "\u5168\u9510\u89D2" : "\u7EDF\u4E00 12px \u5706\u6DA6",
            onClick: function() {
              pickRadius(value);
            }
          },
          opt[1]
        );
      });
      const topbar = React.createElement(
        "div",
        { className: "tg-topbar" },
        React.createElement(
          "div",
          { className: "tg-ctl" },
          React.createElement("span", { className: "tg-ctlLabel" }, "\u5706\u89D2"),
          React.createElement("div", { className: "tg-radiusBtns" }, radiusButtons),
          React.createElement("span", { className: "tg-ctlSep" }),
          React.createElement(
            "button",
            { type: "button", className: "tg-release", onClick: release },
            "\u56DE\u5230\u5B98\u65B9"
          ),
          React.createElement("span", { className: "tg-head" }, "\u70B9\u51FB\u5361\u7247\u5207\u6362\uFF0C\u81EA\u52A8\u4FDD\u5B58")
        ),
        notice && notice.err ? React.createElement("p", { className: "tg-head tg-headErr" }, notice.err) : null,
        notice && notice.ok ? React.createElement("p", { className: "tg-head tg-headOk" }, notice.ok) : null
      );
      const photoTheme = state.photoTheme;
      const wallSeed = photoTheme ? photoTheme.seed : null;
      const wallAccent = photoTheme ? resolved === "dark" ? photoTheme.palettes.primary[80] : photoTheme.palettes.primary[40] : "#2f81f7";
      const wallToneRows = photoTheme ? ["primary", "secondary", "tertiary", "neutral", "neutralVariant"].map(
        function(name) {
          const cells = M3_PREVIEW_TONES.map(function(t) {
            const hex = photoTheme.palettes[name][t];
            return React.createElement("i", {
              key: t,
              style: { background: hex },
              title: name + t + " " + hex
            });
          });
          return React.createElement(
            "div",
            { key: name, className: "tg-toneRow" },
            React.createElement(
              "span",
              { className: "tg-toneName" },
              name === "neutralVariant" ? "neutral-variant" : name
            ),
            React.createElement("span", { className: "tg-toneCells" }, cells)
          );
        }
      ) : null;
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
          return React.createElement(
            "span",
            { key: k, className: "tg-chip", title: "--md-sys-color-" + k + "-" + sk + " " + roles[k] },
            React.createElement("i", { style: { background: roles[k] } }),
            k
          );
        });
        return React.createElement(
          "div",
          { key: sk, className: "tg-roleRow" },
          React.createElement("span", { className: "tg-toneName" }, sk === "light" ? "\u6D45\u8272" : "\u6DF1\u8272"),
          React.createElement("span", { className: "tg-chips" }, chips)
        );
      }) : null;
      const wallSection = React.createElement(
        "div",
        { className: "tg-wall" },
        React.createElement(
          "div",
          { className: "tg-wallHead" },
          React.createElement("span", { className: "tg-wallTitle" }, "\u58C1\u7EB8\u53D6\u8272 \xB7 Material You"),
          wallSeed ? React.createElement(
            "span",
            { className: "tg-seedChip", title: "seed " + wallSeed },
            React.createElement("i", { style: { background: wallSeed } }),
            wallSeed
          ) : null,
          photoActive ? React.createElement(
            "span",
            { className: "tg-live", style: { color: wallAccent } },
            React.createElement("i", null),
            "Live"
          ) : null,
          React.createElement(
            "span",
            { className: "tg-wallActions" },
            React.createElement(
              "label",
              {
                className: "tg-radiusBtn",
                style: { cursor: photoBusy ? "wait" : "pointer", opacity: photoBusy ? 0.6 : 1 }
              },
              photoBusy ? "\u53D6\u8272\u4E2D\u2026" : "\u4E0A\u4F20\u58C1\u7EB8",
              React.createElement("input", {
                type: "file",
                accept: ".png,.jpg,.jpeg,.webp",
                style: { display: "none" },
                disabled: photoBusy,
                onChange: function(e) {
                  pickPhoto(e.target.files && e.target.files[0]);
                  e.target.value = "";
                }
              })
            ),
            photoTheme && !photoActive ? React.createElement(
              "button",
              { type: "button", className: "tg-radiusBtn", onClick: enableWallpaper },
              "\u542F\u7528\u914D\u8272"
            ) : null,
            photoTheme ? React.createElement(
              "button",
              {
                type: "button",
                className: "tg-radiusBtn",
                onClick: copyM3,
                title: "\u590D\u5236 MD3 \u4EE4\u724C\uFF08ref \u8C03\u8272\u677F + \u4EAE/\u6697 sys \u8272\u5F69\uFF09"
              },
              "\u590D\u5236 MD3"
            ) : null,
            photoTheme ? React.createElement(
              "button",
              { type: "button", className: "tg-release", onClick: clearWallpaper },
              "\u6E05\u9664"
            ) : null
          )
        ),
        photoTheme ? React.createElement(
          "div",
          { className: "tg-wallBody" },
          wallToneRows,
          React.createElement("div", { className: "tg-roles" }, wallRoleRows)
        ) : React.createElement(
          "span",
          { className: "tg-head" },
          "\u4E0A\u4F20\u4E00\u5F20\u58C1\u7EB8\uFF0C\u751F\u6210\u6574\u5957 MD3 \u52A8\u6001\u914D\u8272\uFF085 \u7EC4 ref \u8C03\u8272\u677F \xD7 \u4EAE/\u6697 scheme\uFF09\uFF1B\u672C\u5730\u91C7\u6837\u4E0D\u4E0A\u4F20\u3002"
        )
      );
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
      const nowStrip = React.createElement(
        "div",
        { className: "tg-now" },
        React.createElement(
          "span",
          { className: "tg-nowMosaic", "aria-hidden": true },
          React.createElement("i", { className: "tg-mA", style: { background: nowMosaic[0] } }),
          React.createElement("i", { className: "tg-mB", style: { background: nowMosaic[1] } }),
          React.createElement("i", { className: "tg-mC", style: { background: nowAccent } })
        ),
        React.createElement(
          "span",
          { className: "tg-nowMeta" },
          React.createElement("span", { className: "tg-nowTitle" }, "\u6B63\u5728\u4F7F\u7528\uFF1A" + currentLabel),
          React.createElement(
            "span",
            { className: "tg-nowSub" },
            nowTheme ? nowTheme.desc + " \xB7 " + nowAccent : "\u5B98\u65B9\u9ED8\u8BA4\u914D\u8272 \xB7 \u8DDF\u968F\u300C\u5916\u89C2\u300D\u4EAE/\u6697"
          )
        ),
        React.createElement(
          "span",
          { className: "tg-nowDots", "aria-hidden": true },
          React.createElement("i", { style: { background: nowMosaic[0] } }),
          React.createElement("i", { style: { background: nowMosaic[1] } }),
          React.createElement("i", { style: { background: nowAccent } })
        )
      );
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
        return React.createElement(
          "button",
          {
            key: opt[0],
            type: "button",
            className: active ? "tg-radiusBtn tg-active" : "tg-radiusBtn",
            "aria-pressed": active,
            onClick: function() {
              setSchemeFilter(opt[0]);
            }
          },
          opt[1]
        );
      });
      const visibleEntries = ALL_THEMES.filter(matchEntry);
      const toolbar = React.createElement(
        "div",
        { className: "tg-toolbar" },
        React.createElement("input", {
          className: "tg-search",
          type: "search",
          placeholder: "\u641C\u7D22\u4E3B\u9898\u2026",
          value: query,
          onChange: function(e) {
            setQuery(e.target.value);
          }
        }),
        React.createElement("div", { className: "tg-radiusBtns" }, schemePills),
        React.createElement(
          "span",
          { className: "tg-count" },
          visibleEntries.length + " / " + ALL_THEMES.length
        )
      );
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
      return React.createElement(
        "div",
        { className: "tg-page" },
        topbar,
        wallSection,
        React.createElement(
          "div",
          { className: "tg-list" },
          nowStrip,
          toolbar,
          cards.length > 0 ? React.createElement("div", { className: "tg-grid" }, cards) : React.createElement(
            "span",
            { className: "tg-head" },
            "\u65E0\u5339\u914D\u4E3B\u9898\uFF0C\u6362\u4E2A\u5173\u952E\u8BCD\u6216\u5207\u6362\u4EAE/\u6697\u8FC7\u6EE4\u8BD5\u8BD5\u3002"
          )
        )
      );
    }
    return ThemeGallery;
  }

  // src/client/styles.ts
  var CSS = `.tg-page{max-width:800px;display:flex;flex-direction:column;gap:8px;color:var(--dsw-alias-label-primary)}
/* \u9876\u90E8\u7B80\u5355\u914D\u7F6E\u533A\uFF1A\u72B6\u6001 + \u5706\u89D2 + \u5FEB\u6377\u64CD\u4F5C\uFF0C\u4E00\u5F20\u5C0F\u9762\u677F\u6536\u62E2 */
.tg-topbar{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-radius:12px;background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2)}
.tg-status{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.tg-status b{color:var(--dsw-alias-label-primary);font-weight:600}
.tg-release{border:none;background:none;padding:0;font:inherit;font-size:12px;cursor:pointer;color:var(--dsw-alias-state-business-primary)}
.tg-release:hover{text-decoration:underline}
.tg-release:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;border-radius:2px}
.tg-ctl{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-ctlLabel{font-size:12px;color:var(--dsw-alias-label-tertiary);flex:none}
.tg-ctlSep{width:1px;height:16px;background:var(--dsw-alias-border-l2);flex:none}
.tg-head{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}
.tg-headErr{color:var(--dsw-alias-state-error-primary)}
.tg-headOk{color:var(--dsw-alias-state-success-primary)}
/* \u4E3B\u9898\u8272\u5217\u8868\uFF08\u6700\u540E\u4E00\u9879\uFF09\uFF1A\u65E0\u5206\u7EC4\uFF0Cgrid \u5BC6\u94FA\u9ED8\u8BA4 4 \u5217\u81EA\u9002\u5E94 */
.tg-list{display:flex;flex-direction:column;gap:8px;padding-top:8px}
.tg-now{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2)}
.tg-nowMosaic{display:flex;width:76px;height:30px;border-radius:7px;overflow:hidden;flex:none;border:.5px solid var(--dsw-alias-border-l2)}
.tg-nowMosaic i{display:block;height:100%;min-width:0}
.tg-nowMeta{display:flex;flex-direction:column;gap:0;min-width:0;flex:1}
.tg-nowTitle{font-size:12px;font-weight:700;line-height:17px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-nowSub{font-size:11px;line-height:15px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-nowDots{display:flex;gap:5px;align-items:center;flex:none}
.tg-nowDots i{width:12px;height:12px;border-radius:50%;border:.5px solid var(--dsw-alias-border-l2);display:block}
.tg-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-search{box-sizing:border-box;height:26px;width:170px;max-width:100%;padding:0 11px;border-radius:13px;border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;line-height:26px;outline:none}
.tg-search::placeholder{color:var(--dsw-alias-label-quaternary)}
.tg-search:focus{border-color:var(--dsw-alias-brand-primary)}
.tg-count{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
/* \u58C1\u7EB8\u53D6\u8272\u72EC\u7ACB\u914D\u7F6E\u533A\uFF08MD3 \u6574\u5957\u914D\u8272\u9884\u89C8 + \u64CD\u4F5C\uFF09 */
.tg-wall{display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:12px;background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2)}
.tg-wallHead{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tg-wallTitle{font-size:12px;font-weight:700;line-height:18px;color:var(--dsw-alias-label-primary)}
.tg-seedChip{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 9px;border-radius:11px;background:var(--dsw-alias-bg-layer-1);font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dsw-alias-label-secondary)}
.tg-seedChip i{width:11px;height:11px;border-radius:50%;display:block;border:.5px solid var(--dsw-alias-border-l2)}
.tg-wallActions{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.tg-wallBody{display:flex;flex-direction:column;gap:6px}
.tg-toneRow{display:flex;align-items:center;gap:6px}
.tg-toneName{width:88px;flex:none;font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-toneCells{display:flex;flex:1;gap:2px;min-width:0}
.tg-toneCells i{flex:1;height:20px;border-radius:4px;min-width:0;display:block}
.tg-roles{display:flex;flex-direction:column;gap:3px}
.tg-roleRow{display:flex;align-items:flex-start;gap:6px}
.tg-chips{display:flex;flex:1;gap:4px;flex-wrap:wrap;min-width:0}
.tg-chip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 7px;border-radius:10px;background:var(--dsw-alias-bg-layer-1);font-size:10px;line-height:20px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.tg-chip i{width:10px;height:10px;border-radius:3px;display:block;flex:none}
.tg-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;align-items:stretch}
@media (max-width:720px){.tg-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:520px){.tg-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tg-search{width:130px}}
/* \u622A\u56FE\u5F0F\u4E3B\u9898\u5361\xB7\u5C0F\u5C3A\u5BF8\uFF1A\u9876\u90E8\u62FC\u63A5\u8272\u5757 + \u7F16\u53F7 + \u6807\u7B7E\u6807\u9898\u63CF\u8FF0 + \u5E95\u90E8\u80F6\u56CA\u6309\u94AE + Live \u6001\uFF08grid \u5B50\u9879\uFF09 */
.tg-card{box-sizing:border-box;display:flex;flex-direction:column;padding:0;overflow:hidden;cursor:pointer;text-align:left;border-radius:12px;font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-module-platform);border:.5px solid var(--dsw-alias-border-l2);min-width:0;width:100%;transition:border-color .15s,box-shadow .15s,transform .15s}
.tg-card:hover:not(.tg-active){border-color:var(--dsw-alias-border-l4)}
.tg-card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.tg-card.tg-active{background:var(--dsw-alias-bg-module-platform)}
.tg-mosaic{position:relative;display:flex;height:44px;flex:none}
.tg-mosaic i{display:block;height:100%;min-width:0}
.tg-mA{flex:5}
.tg-mB{flex:3}
.tg-mC{flex:2}
.tg-idx{position:absolute;top:4px;right:6px;font-size:9px;line-height:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:rgba(255,255,255,.88);text-shadow:0 1px 3px rgba(0,0,0,.45);letter-spacing:.04em}
.tg-body{display:flex;flex-direction:column;gap:1px;padding:7px 9px 8px;min-width:0}
.tg-tag{font-size:10px;font-weight:600;line-height:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-title{font-size:13px;font-weight:700;line-height:18px;color:var(--dsw-alias-label-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-desc{font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tg-foot{display:flex;align-items:center;gap:6px;margin-top:6px}
.tg-use{display:inline-flex;align-items:center;justify-content:center;height:22px;padding:0 10px;border:none;border-radius:11px;font-size:11px;font-weight:600;line-height:22px;color:#fff;cursor:pointer;flex:none}
.tg-use:hover{filter:brightness(1.08)}
.tg-live{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:500;line-height:14px;white-space:nowrap}
.tg-live i{width:5px;height:5px;border-radius:50%;background:currentColor;display:inline-block;flex:none}
.tg-check{margin-left:auto;font-size:11px;font-weight:700;flex:none}
/* \u7D27\u51D1\u80F6\u56CA\u6309\u94AE\uFF08\u5706\u89D2\u6863 + \u4E0A\u4F20\u53D6\u8272\u5171\u7528\u5C0F\u5C3A\u5BF8\uFF09 */
.tg-radiusBtns{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.tg-radiusBtn{box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);height:24px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:12px;align-items:center;gap:6px;padding:0 10px;font-size:11px;line-height:24px;display:inline-flex}
.tg-radiusBtn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.tg-radiusBtn.tg-active{background:var(--dsw-alias-bg-multi-select);box-shadow:inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)}
@media (prefers-reduced-motion:reduce){.tg-card{transition:none}}`;

  // src/client/index.ts
  var PLUGIN_ID = "@dshp/web-style";
  function register() {
    const loader = typeof window !== "undefined" ? window.__ModuleLoader__ : void 0;
    if (!loader || typeof loader.load !== "function") return;
    loader.load({
      id: PLUGIN_ID,
      factory: (require2) => {
        const moduleShim = { exports: {} };
        const exportsShim = moduleShim.exports;
        Object.defineProperty(exportsShim, Symbol.toStringTag, { value: "Module" });
        const React = require2("react");
        const exportsObj = exportsShim;
        exportsObj.inject = ["slots", "theme"];
        exportsObj.apply = function apply(ctx) {
          const slots = ctx.get("slots");
          const theme = ctx.get("theme");
          if (slots === void 0 || theme === void 0) return;
          const style = document.createElement("style");
          style.setAttribute("data-plugin-css", "dshp-web-style/gallery.css");
          style.textContent = CSS;
          document.head.appendChild(style);
          ctx.effect(() => () => style.remove(), "dshp-web-style: section styles");
          const bridge = createBridge();
          restoreFromHost(theme, bridge);
          ctx.effect(() => () => disposeOverride(), "dshp-web-style: override teardown");
          const Gallery = createGallery(React, ctx, theme, bridge);
          ctx.effect(
            () => slots.inject(
              "settings.section",
              () => slots.register(
                { name: "settings.section", id: "dshp-web-style", order: 50, label: "\u5916\u89C2\u5B9A\u5236" },
                Gallery
              )
            ),
            "dshp-web-style: settings section"
          );
        };
        return moduleShim.exports;
      }
    });
  }
  register();

})();
