import neonSource from "@/components/text-effects/neon-text/NeonText.tsx?raw";
import neonCss from "@/components/text-effects/neon-text/neon-text.css?raw";
import rainbowSource from "@/components/text-effects/rainbow-text/RainbowText.tsx?raw";
import rainbowCss from "@/components/text-effects/rainbow-text/rainbow-text.css?raw";
import shadowSource from "@/components/text-effects/long-shadow-text/LongShadowText.tsx?raw";
import shadowCss from "@/components/text-effects/long-shadow-text/long-shadow-text.css?raw";
import { getLongShadow } from "@/components/text-effects/long-shadow-text";

export type BasicEffectId = "neon" | "rainbow" | "longshadow";
export type BasicOptions = Record<string, string | number | boolean>;
export const basicSources = {
  neon: { name: "NeonText", folder: "neon-text", source: neonSource, css: neonCss },
  rainbow: { name: "RainbowText", folder: "rainbow-text", source: rainbowSource, css: rainbowCss },
  longshadow: { name: "LongShadowText", folder: "long-shadow-text", source: shadowSource, css: shadowCss },
};
const escapeHtml = (text: string) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function getBasicEffectCode(effect: BasicEffectId, text: string, options: BasicOptions, fontSize: number) {
  const { name, folder, source, css } = basicSources[effect];
  const props = Object.entries(options).map(([key, value]) => `  ${key}={${JSON.stringify(value)}}`).join("\n");
  const example = `<${name}\n${props}\n  style={{ fontSize: ${fontSize} }}\n>\n  {${JSON.stringify(text)}}\n</${name}>`;
  const react = `import { ${name} } from "./${name}";\nimport "./${folder}.css";\n\nexport default function Example() {\n  return (\n${example.split("\n").map(line => `    ${line}`).join("\n")}\n  );\n}`;
  const fullSource = `// 保存为 ${name}.tsx\n${source}\n\n/* 保存为 ${folder}.css */\n${css}\n\n// 保存为 Example.tsx（与以上文件放在同一目录）\n${react}`;
  const variables: Record<string, string> = { "font-size": `${fontSize}px` };
  let className = `zc-${folder}`;
  let attribute = "";
  if (effect === "longshadow") {
    variables.color = String(options.color);
    variables["text-shadow"] = getLongShadow(Number(options.angle), Number(options.length), String(options.shadowColor));
  } else {
    if (options.animated) className += " is-animated";
    if (options.paused) className += " is-paused";
    const prefix = `--zc-${effect}-`;
    variables[`${prefix}duration`] = `${options.duration}s`;
    variables[`${prefix}delay`] = `${options.delay}s`;
    if (effect === "neon") {
      variables[`${prefix}color`] = String(options.color);
      variables[`${prefix}glow`] = String(options.glowColor);
      variables[`${prefix}radius`] = `${Number(options.glowRadius) * Number(options.intensity)}px`;
    } else {
      for (let i = 1; i <= 4; i++) variables[`${prefix}${i}`] = String(options[`color${i}`]);
      variables[`${prefix}angle`] = `${options.angle}deg`;
      variables[`${prefix}spread`] = `${options.spread}%`;
      attribute = ` data-direction="${escapeHtml(String(options.direction))}"`;
    }
  }
  const inline = Object.entries(variables).map(([key, value]) => `${key}:${value}`).join(";");
  const html = `<span class="${className}"${attribute} style="${escapeHtml(inline)}">${escapeHtml(text)}</span>\n\n<style>\n${css}\n</style>`;
  return { react, source: fullSource, html };
}
