import { Fragment, isValidElement, type ReactNode } from "react";
import { HighlightText } from "@/components/text-effects/highlight-text";
import { GradientText } from "@/components/text-effects/gradient-text";
import { OutlineText } from "@/components/text-effects/outline-text";
import { UnderlineText } from "@/components/text-effects/underline-text";
import { SlideText } from "@/components/text-effects/slide-text";
import { BlurText } from "@/components/text-effects/blur-text";
import { ScaleText } from "@/components/text-effects/scale-text";
import { ShimmerText } from "@/components/text-effects/shimmer-text";
import { WaveText } from "@/components/text-effects/wave-text";
import highlightSource from "@/components/text-effects/highlight-text/HighlightText.tsx?raw";
import highlightTypes from "@/components/text-effects/highlight-text/types.ts?raw";
import highlightCss from "@/components/text-effects/highlight-text/highlight-text.css?raw";
import gradientSource from "@/components/text-effects/gradient-text/GradientText.tsx?raw";
import gradientCss from "@/components/text-effects/gradient-text/gradient-text.css?raw";
import outlineSource from "@/components/text-effects/outline-text/OutlineText.tsx?raw";
import outlineCss from "@/components/text-effects/outline-text/outline-text.css?raw";
import underlineSource from "@/components/text-effects/underline-text/UnderlineText.tsx?raw";
import underlineCss from "@/components/text-effects/underline-text/underline-text.css?raw";
import slideSource from "@/components/text-effects/slide-text/SlideText.tsx?raw";
import slideCss from "@/components/text-effects/slide-text/slide-text.css?raw";
import blurSource from "@/components/text-effects/blur-text/BlurText.tsx?raw";
import blurCss from "@/components/text-effects/blur-text/blur-text.css?raw";
import scaleSource from "@/components/text-effects/scale-text/ScaleText.tsx?raw";
import scaleCss from "@/components/text-effects/scale-text/scale-text.css?raw";
import typewriterSource from "@/components/text-effects/typewriter-text/TypewriterText.tsx?raw";
import typewriterCss from "@/components/text-effects/typewriter-text/typewriter-text.css?raw";
import shimmerSource from "@/components/text-effects/shimmer-text/ShimmerText.tsx?raw";
import shimmerCss from "@/components/text-effects/shimmer-text/shimmer-text.css?raw";
import waveSource from "@/components/text-effects/wave-text/WaveText.tsx?raw";
import waveCss from "@/components/text-effects/wave-text/wave-text.css?raw";
import segmentSource from "@/components/text-effects/core/segment-text.ts?raw";

export type CopyEffectId = "highlight" | "gradient" | "outline" | "underline" | "slide" | "blur" | "scale" | "typewriter" | "shimmer" | "wave";
type CopyDefinition = { name: string; source: string; css: string; component?: unknown; dependencies?: Array<{ path: string; content: string }> };
const segmentDependency = { path: "components/text-effects/core/segment-text.ts", content: segmentSource };
export const copyDefinitions: Record<CopyEffectId, CopyDefinition> = {
  highlight: { name: "HighlightText", source: highlightSource, css: highlightCss, component: HighlightText, dependencies: [{ path: "components/text-effects/highlight-text/types.ts", content: highlightTypes }] },
  gradient: { name: "GradientText", source: gradientSource, css: gradientCss, component: GradientText },
  outline: { name: "OutlineText", source: outlineSource, css: outlineCss, component: OutlineText },
  underline: { name: "UnderlineText", source: underlineSource, css: underlineCss, component: UnderlineText },
  slide: { name: "SlideText", source: slideSource, css: slideCss, component: SlideText, dependencies: [segmentDependency] },
  blur: { name: "BlurText", source: blurSource, css: blurCss, component: BlurText, dependencies: [segmentDependency] },
  scale: { name: "ScaleText", source: scaleSource, css: scaleCss, component: ScaleText, dependencies: [segmentDependency] },
  typewriter: { name: "TypewriterText", source: typewriterSource, css: typewriterCss, dependencies: [segmentDependency] },
  shimmer: { name: "ShimmerText", source: shimmerSource, css: shimmerCss, component: ShimmerText },
  wave: { name: "WaveText", source: waveSource, css: waveCss, component: WaveText, dependencies: [segmentDependency] },
};
export const escapeCodeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
// Stateless effects return only host elements, fragments and text. Use their
// actual output to avoid a separate HTML implementation of props and splitting.
function serializeHostElement(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return escapeCodeHtml(String(node));
  if (Array.isArray(node)) return node.map(serializeHostElement).join("");
  if (!isValidElement<Record<string, unknown>>(node)) throw new Error("Unsupported effect output");
  if (node.type === Fragment) return serializeHostElement(node.props.children as ReactNode);
  if (typeof node.type !== "string") throw new Error("Only stateless host effects support HTML + CSS");
  const attributes = Object.entries(node.props).filter(([key, value]) => key !== "children" && key !== "key" && value != null).map(([key, value]) => {
    if (key === "style") {
      const inline = Object.entries(value as Record<string, string | number>).filter(([, item]) => item != null).map(([property, item]) => {
        const name = property.startsWith("--") ? property : property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/^ms-/, "-ms-");
        const units = typeof item === "number" && !property.startsWith("--") && !["opacity", "fontWeight", "lineHeight", "zIndex", "order", "flexGrow", "flexShrink"].includes(property) ? "px" : "";
        return `${name}:${item}${units}`;
      }).join(";");
      return `style="${escapeCodeHtml(inline)}"`;
    }
    const attribute = key === "className" ? "class" : key === "tabIndex" ? "tabindex" : key;
    return `${attribute}="${escapeCodeHtml(String(value))}"`;
  }).join(" ");
  return `<${node.type}${attributes ? ` ${attributes}` : ""}>${serializeHostElement(node.props.children as ReactNode)}</${node.type}>`;
}
export function getCopyEffectCode(effect: CopyEffectId, text: string, options: Record<string, unknown>, fontSize: number) {
  const definition = copyDefinitions[effect];
  const directory = `components/text-effects/${effect}-text`;
  const props = Object.entries(options).map(([key, value]) => `      ${key}={${JSON.stringify(value)}}`).join("\n");
  const react = `import { ${definition.name} } from "./${definition.name}";\nimport "./${effect}-text.css";\n\nexport default function Example() {\n  return (\n    <${definition.name}\n${props}\n      style={{ fontSize: ${fontSize} }}\n    >\n      {${JSON.stringify(text)}}\n    </${definition.name}>\n  );\n}`;
  const files = [
    { path: `${directory}/${definition.name}.tsx`, content: definition.source },
    { path: `${directory}/${effect}-text.css`, content: definition.css },
    ...(definition.dependencies ?? []),
    { path: `${directory}/Example.tsx`, content: react },
  ];
  const source = "// 按以下路径分别保存文件，保留目录结构。\n\n" + files.map(file => `// ===== 保存为 ${file.path} =====\n${file.content}`).join("\n\n");
  const htmlAvailable = Boolean(definition.component);
  const component = definition.component as (props: Record<string, unknown>) => ReactNode;
  const html = htmlAvailable ? `${serializeHostElement(component({ ...options, children: text, style: { fontSize } }))}\n\n<style>\n${definition.css}\n</style>` : "打字机包含运行时状态和计时逻辑，请使用 React 用法或完整源码；纯 HTML + CSS 无法复现。";
  return { react, source, html, htmlAvailable, files };
}
