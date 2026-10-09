import glitchSource from "@/components/text-effects/glitch-text/GlitchText.tsx?raw";
import glitchCss from "@/components/text-effects/glitch-text/glitch-text.css?raw";
import magnetSource from "@/components/text-effects/magnet-text/MagnetText.tsx?raw";
import magnetCss from "@/components/text-effects/magnet-text/magnet-text.css?raw";
import { getGlitchTextStyle } from "@/components/text-effects/glitch-text";
import { getMagnetTextStyle, splitMagnetText } from "@/components/text-effects/magnet-text";

export type InteractionEffectId = "glitch" | "magnet";
export type InteractionOptions = Record<string, string | number | boolean>;
const sources = {
  glitch: { name: "GlitchText", folder: "glitch-text", source: glitchSource, css: glitchCss },
  magnet: { name: "MagnetText", folder: "magnet-text", source: magnetSource, css: magnetCss },
};
const escapeHtml = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
export function getInteractionEffectCode(effect: InteractionEffectId, text: string, options: InteractionOptions, fontSize: number) {
  const { name, folder, source, css } = sources[effect];
  const props = Object.entries(options).map(([key, value]) => `      ${key}={${JSON.stringify(value)}}`).join("\n");
  const react = `import { ${name} } from "./${name}";\nimport "./${folder}.css";\n\nexport default function Example() {\n  return (\n    <${name}\n${props}\n      style={{ fontSize: ${fontSize} }}\n    >\n      {${JSON.stringify(text)}}\n    </${name}>\n  );\n}`;
  const fullSource = `// 保存为 ${name}.tsx\n${source}\n\n/* 保存为 ${folder}.css */\n${css}\n\n// 保存为 Example.tsx（与以上文件放在同一目录）\n${react}`;
  const characters = splitMagnetText(text);
  const variables = effect === "glitch" ? getGlitchTextStyle(options) : getMagnetTextStyle(options, characters.length);
  const inline = Object.entries(variables).map(([key, value]) => `${key}:${value}`).join(";") + `;font-size:${fontSize}px`;
  const attributes = `data-trigger="${escapeHtml(String(options.trigger ?? "hover"))}" data-active="${options.active ? "true" : "false"}"${options.trigger !== "always" ? ' tabindex="0"' : ""}`;
  const content = effect === "glitch" ? escapeHtml(text) : `<span class="zc-magnet-readable">${escapeHtml(text)}</span>` + characters.map((character, index) => `<span class="zc-magnet-character" aria-hidden="true" style="--zc-magnet-i:${index}">${escapeHtml(character)}</span>`).join("");
  const html = `<span class="zc-${folder}${options.paused ? " is-paused" : ""}" ${attributes} style="${escapeHtml(inline)}">${content}</span>\n\n<style>\n${css}\n</style>`;
  return { react, source: fullSource, html };
}
