"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePageMotion } from "@/components/site/usePageMotion";
import { MotionScenery, MotionRibbon } from "@/components/site/MotionScenery";
import { componentCategories, uiCatalog, type ComponentCategory, type UIEntry } from "@/components/site/ui-catalog";
import { UIPreview, UIWorkbench } from "@/components/site/UIWorkbench";
import { effectCatalog, effectCategories, TextEffect, type EffectDefinition } from "@/components/text-effects";
import { HighlightWorkbench } from "@/components/site/HighlightWorkbench";
import { VisualEffectWorkbench, type VisualEffectId } from "@/components/site/VisualEffectWorkbench";
import { EntranceEffectWorkbench, type EntranceEffectId } from "@/components/site/EntranceEffectWorkbench";
import { LoopEffectWorkbench, type LoopEffectId } from "@/components/site/LoopEffectWorkbench";
import { BasicEffectWorkbench, type BasicEffectId } from "@/components/site/BasicEffectWorkbench";
import { NeonText, RainbowText, LongShadowText } from "@/components/text-effects";
import { GlitchText, MagnetText } from "@/components/text-effects";
import { InteractionEffectWorkbench, type InteractionEffectId } from "@/components/site/InteractionEffectWorkbench";

const interactionWorkbenchEffects = new Set(["glitch", "magnet"]);

const basicWorkbenchEffects = new Set(["neon", "rainbow", "longshadow"]);

const visualWorkbenchEffects = new Set(["gradient", "outline", "underline"]);
const entranceWorkbenchEffects = new Set(["slide", "blur", "scale"]);
const loopWorkbenchEffects = new Set(["typewriter", "shimmer", "wave"]);
const categoryLabels = { "全部": "全部效果", "基础": "外观样式", "进入": "出现动画", "循环": "持续动画", "互动": "鼠标互动" } as const;
const categoryHelp = { "基础": "直接显示", "进入": "打开时播放", "循环": "自动重复", "互动": "鼠标移入" } as const;

function EffectCard({ effect, index, text, size, speed, paused, replayKey, onSelect }: {
  effect: EffectDefinition;
  index: number;
  text: string;
  size: number;
  speed: number;
  paused: boolean;
  replayKey: number;
  onSelect: () => void;
}) {
  const [cardReplayKey, setCardReplayKey] = useState(0);
  const [cardActive, setCardActive] = useState(false);
  return (
    <article className={`effect-card ${effect.category === "互动" ? "is-interactive" : ""}`} style={{ "--speed": `${speed}s` } as React.CSSProperties}>
      <div className="card-topline">
        <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
        <div className="card-badges"><span className={`usage-badge usage-${effect.category}`}>{categoryHelp[effect.category]}</span>{effect.badge && <span className="mini-badge">{effect.badge}</span>}</div>
      </div>
      <button className={`effect-preview ${paused ? "is-paused" : ""}`} onClick={onSelect} onPointerEnter={() => setCardActive(true)} onPointerLeave={() => setCardActive(false)} onFocus={() => setCardActive(true)} onBlur={() => setCardActive(false)} aria-label={`打开${effect.name}参数`}>
        <span key={`${replayKey}-${cardReplayKey}`} style={{ fontSize: `${size}px` }}>
          {effect.id === "glitch" ? <GlitchText duration={speed} paused={paused} active={cardActive} tabIndex={-1}>{text}</GlitchText> : effect.id === "magnet" ? <MagnetText duration={speed} paused={paused} active={cardActive} tabIndex={-1}>{text}</MagnetText> : effect.id === "neon" ? <NeonText duration={speed} paused={paused}>{text}</NeonText> : effect.id === "rainbow" ? <RainbowText duration={speed} paused={paused}>{text}</RainbowText> : effect.id === "longshadow" ? <LongShadowText>{text}</LongShadowText> : <TextEffect effect={effect.id} duration={speed} paused={paused}>{text}</TextEffect>}
        </span>
      </button>
      <div className="card-meta">
        <div>
          <h3>{effect.name}</h3>
          <p>{effect.en}</p>
        </div>
        {effect.category === "进入" ? <button className="replay-mini" onClick={() => setCardReplayKey((key) => key + 1)} aria-label={`重播${effect.name}`}>↻ 重播</button> : <button className="arrow-button" onClick={onSelect} aria-label={`查看${effect.name}`}>↗</button>}
      </div>
      <p className="card-description">{effect.description}</p>
    </article>
  );
}

export default function Home() {
  const [family, setFamily] = useState<ComponentCategory>("全部");
  const [selectedUI, setSelectedUI] = useState<UIEntry | null>(null);
  const [category, setCategory] = useState<(typeof effectCategories)[number]>("全部");
  const [query, setQuery] = useState("");
  const [previewText, setPreviewText] = useState("让文字动起来");
  const [size, setSize] = useState(36);
  const [speed, setSpeed] = useState(1.8);
  const [paused, setPaused] = useState(false);
  const [dark, setDark] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [selected, setSelected] = useState<EffectDefinition | null>(null);
  const [copied, setCopied] = useState(false);
  const pageRef = useRef<HTMLElement>(null);
  usePageMotion(pageRef, `${family}:${category}:${query}`, paused);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && (setSelected(null), setSelectedUI(null));
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const visibleEffects = useMemo(() => effectCatalog.filter((effect) => {
    const categoryMatch = category === "全部" || effect.category === category;
    const q = query.trim().toLowerCase();
    return (family === "全部" || family === "文字") && categoryMatch && (!q || `${effect.name} ${effect.en} ${effect.description}`.toLowerCase().includes(q));
  }), [category, query, family]);
  const visibleUI = uiCatalog.filter(entry => (family === "全部" || family === entry.category) && (!query.trim() || `${entry.name} ${entry.en} ${entry.description}`.toLowerCase().includes(query.trim().toLowerCase())));

  const copyCode = async () => {
    if (!selected) return;
    const code = `<TextEffect effect="${selected.id}" duration={${speed}}>${previewText}</TextEffect>`;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main ref={pageRef} className={paused ? "page-motion-root motion-paused" : "page-motion-root"}>
      <div className="page-scroll-progress" aria-hidden="true" />
      <header className="site-header">
        <a href="#top" className="brand" aria-label="字场首页">
          <span className="brand-mark">字</span>
          <span>字场 <b>ZICHANG</b></span>
        </a>
        <nav aria-label="主导航">
          <a href="#effects">组件库</a>
          <a href="#about">设计原则</a>
          <a href="/docs">使用文档</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? "切换浅色主题" : "切换深色主题"}>{dark ? "☼" : "☾"}</button>
          <a className="primary-button small" href="#effects">开始探索</a>
        </div>
      </header>

      <section className="hero" id="top">
        <MotionScenery />
        <div className="hero-kicker"><span /> 为中文界面而生的交互组件库</div>
        <h1>
          <span>让每一个界面</span>
          <span className="hero-gradient">都有自己的表达。</span>
        </h1>
        <p className="hero-copy">文字、按钮、表单与反馈，真实预览，按需取用。调好参数，复制源码，把组件留在自己的项目里。</p>
        <div className="hero-actions">
          <a className="primary-button" href="#effects">浏览全部组件 <span>↓</span></a>
          <button className="ghost-button" onClick={() => setPaused(!paused)}>{paused ? "播放动画" : "暂停动画"} <span>{paused ? "▶" : "Ⅱ"}</span></button>
        </div>
        <div className="hero-specimen" aria-hidden="true">
          <span className="specimen-label">LIVE TYPE SPECIMEN / 01</span>
          <div className="orbit-word">形<span>意</span></div>
          <div className="vertical-note">大小 · 颜色 · 节奏 · 表达</div>
          <div className="hero-stats"><b>{effectCatalog.length + uiCatalog.length}</b> 种示例 · <b>{componentCategories.length - 1}</b> 个分类 <i /> <b>0</b> 图片依赖</div>
        </div>
      </section>

      <MotionRibbon />
      <section className="library-section" id="effects">
        <div className="section-heading">
          <div>
            <span className="eyebrow">COMPONENT LIBRARY</span>
            <h2>从文字到交互，按需取用。</h2>
          </div>
          <p>选择组件分类；直接体验交互，打开参数面板复制完整源码。</p>
        </div>

        <div className="toolbar">
          <div className="category-tabs" role="tablist" aria-label="组件分类">
            {componentCategories.map(item => <button key={item} role="tab" aria-selected={family === item} className={family === item ? "active" : ""} onClick={() => { setFamily(item); setCategory("全部"); }}>{item === "全部" ? "全部组件" : item}<sup>{item === "全部" ? effectCatalog.length + uiCatalog.length : item === "文字" ? effectCatalog.length : uiCatalog.filter(entry => entry.category === item).length}</sup></button>)}
          </div>
          <label className="search-box">
            <span>⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索组件..." aria-label="搜索组件" />
            <kbd>⌘ K</kbd>
          </label>
        </div>

        {family === "文字" && <div className="category-tabs text-subcategories" role="tablist" aria-label="文字效果筛选">{effectCategories.map(item => <button key={item} role="tab" aria-selected={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{categoryLabels[item]}</button>)}</div>}
        {(family === "全部" || family === "文字") && <div className="playground-bar">
          <label className="text-control"><span>预览文字</span><input value={previewText} maxLength={18} onChange={(event) => setPreviewText(event.target.value || " ")} /></label>
          <label className="range-control"><span>字号 <b>{size}px</b></span><input type="range" min="24" max="64" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label>
          <label className="range-control"><span>节奏 <b>{speed.toFixed(1)}s</b></span><input type="range" min="0.2" max="8" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
          <button className="replay-button" onClick={() => setReplayKey((key) => key + 1)}>↻ 重播全部</button>
        </div>

        }

        <div className="effect-grid">
          {visibleUI.map(entry => <article className="effect-card" key={entry.id}><div className="card-topline"><span className="mini-badge">{entry.category}</span><span className="mini-badge">可交互</span></div><div className="ui-card-preview"><UIPreview entry={entry} paused={paused} /></div><div className="card-meta"><div><h3>{entry.name}</h3><p>{entry.en}</p></div><button className="arrow-button" onClick={() => setSelectedUI(entry)} aria-label={`查看${entry.name}参数`}>↗</button></div><p className="card-description">{entry.description}</p><button className="ui-configure" onClick={() => setSelectedUI(entry)}>参数与源码 →</button></article>)}
          {visibleEffects.map((effect, index) => <EffectCard key={effect.id} effect={effect} index={index} text={previewText} size={size} speed={speed} paused={paused} replayKey={replayKey} onSelect={() => setSelected(effect)} />)}
        </div>
        {visibleEffects.length + visibleUI.length === 0 && <div className="empty-state">没有找到匹配组件，换个关键词试试。</div>}
      </section>

      <section className="principles" id="about">
        <div><span className="eyebrow">BUILT WITH CARE</span><h2>好动效，不该牺牲阅读。</h2></div>
        <div className="principle-grid">
          <article><b>01</b><h3>中文友好</h3><p>按真实字符分段，中文、标点和 emoji 都不会被拆坏。</p></article>
          <article><b>02</b><h3>尊重偏好</h3><p>自动响应减少动画设置，也允许用户随时暂停。</p></article>
          <article><b>03</b><h3>源码可控</h3><p>复制到项目里自由调整，不被封闭的样式系统绑住。</p></article>
        </div>
      </section>

      <footer>
        <div className="brand"><span className="brand-mark">字</span><span>字场 <b>ZICHANG</b></span></div>
        <p>为有表达的界面，设计恰到好处的交互。</p>
        <span>本地预览版 · 2026</span>
      </footer>

      {selectedUI && <div className="drawer-backdrop"><aside className="detail-drawer is-workbench" role="dialog" aria-modal="true" aria-labelledby="ui-drawer-title"><button className="drawer-close" onClick={() => setSelectedUI(null)} aria-label="关闭">×</button><span className="eyebrow">{selectedUI.category} / {selectedUI.en}</span><h2 id="ui-drawer-title">{selectedUI.name}</h2><p>{selectedUI.description}</p><UIWorkbench key={selectedUI.id} entry={selectedUI} paused={paused} /><div className="drawer-note"><b>原生语义与键盘操作</b><span>CSS 支持减少动画偏好。完整源码独立于本站样式。</span></div></aside></div>}
      {selected && (
        <div className="drawer-backdrop">
          <aside className={`detail-drawer ${selected.id === "highlight" || interactionWorkbenchEffects.has(selected.id) || basicWorkbenchEffects.has(selected.id) || visualWorkbenchEffects.has(selected.id) || entranceWorkbenchEffects.has(selected.id) || loopWorkbenchEffects.has(selected.id) ? "is-workbench" : ""}`} role="dialog" aria-modal="true" aria-labelledby="drawer-title">
            <button className="drawer-close" onClick={() => setSelected(null)} aria-label="关闭">×</button>
            <span className="eyebrow">{selected.category} / {selected.en}</span>
            <h2 id="drawer-title">{selected.name}</h2>
            <p>{selected.description}</p>
            {interactionWorkbenchEffects.has(selected.id) ? (
              <InteractionEffectWorkbench key={selected.id} effect={selected.id as InteractionEffectId} text={previewText} onTextChange={setPreviewText} fontSize={size} onFontSizeChange={setSize} duration={speed} onDurationChange={setSpeed} paused={paused} />
            ) : basicWorkbenchEffects.has(selected.id) ? (
              <BasicEffectWorkbench key={selected.id} effect={selected.id as BasicEffectId} text={previewText} onTextChange={setPreviewText} fontSize={size} onFontSizeChange={setSize} duration={speed} onDurationChange={setSpeed} paused={paused} />
            ) : selected.id === "highlight" ? (
              <HighlightWorkbench
                text={previewText}
                onTextChange={setPreviewText}
                fontSize={size}
                onFontSizeChange={setSize}
                duration={speed}
                onDurationChange={setSpeed}
                paused={paused}
              />
            ) : visualWorkbenchEffects.has(selected.id) ? (
              <VisualEffectWorkbench
                key={selected.id}
                effect={selected.id as VisualEffectId}
                text={previewText}
                onTextChange={setPreviewText}
                fontSize={size}
                onFontSizeChange={setSize}
                duration={speed}
                onDurationChange={setSpeed}
                paused={paused}
              />
            ) : entranceWorkbenchEffects.has(selected.id) ? (
              <EntranceEffectWorkbench
                key={selected.id}
                effect={selected.id as EntranceEffectId}
                text={previewText}
                onTextChange={setPreviewText}
                fontSize={size}
                onFontSizeChange={setSize}
                duration={speed}
                onDurationChange={setSpeed}
                paused={paused}
              />
            ) : loopWorkbenchEffects.has(selected.id) ? (
              <LoopEffectWorkbench key={selected.id} effect={selected.id as LoopEffectId} text={previewText} onTextChange={setPreviewText} fontSize={size} onFontSizeChange={setSize} duration={speed} onDurationChange={setSpeed} paused={paused} />
            ) : (
              <>
                <div className={`drawer-preview ${paused ? "is-paused" : ""}`} style={{ "--speed": `${speed}s`, fontSize: `${Math.min(size + 12, 72)}px` } as React.CSSProperties}>
                  <TextEffect effect={selected.id} duration={speed} paused={paused}>{previewText}</TextEffect>
                </div>
                <div className="drawer-controls">
                  <label><span>预览文字</span><input value={previewText} onChange={(event) => setPreviewText(event.target.value)} /></label>
                  <label><span>字号 <b>{size}px</b></span><input type="range" min="24" max="64" value={size} onChange={(event) => setSize(Number(event.target.value))} /></label>
                  <label><span>动画时长 <b>{speed.toFixed(1)}s</b></span><input type="range" min="0.2" max="8" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
                </div>
                <div className="code-box"><div><span>JSX</span><button onClick={copyCode}>{copied ? "已复制 ✓" : "复制代码"}</button></div><code>{`<TextEffect effect="${selected.id}" duration={${speed}}>${previewText}</TextEffect>`}</code></div>
              </>
            )}
            <div className="drawer-note"><b>无障碍已考虑</b><span>支持系统“减少动态效果”偏好，文本仍可被屏幕阅读器完整读取。</span></div>
          </aside>
        </div>
      )}
    </main>
  );
}
