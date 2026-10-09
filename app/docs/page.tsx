import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { effectCatalog, SlideText, TextEffect } from "@/components/text-effects";
import { uiCatalog, componentCategories } from "@/components/site/ui-catalog";

export const metadata: Metadata = {
  title: "使用文档 — 字场 ZICHANG",
  description: "字场动态文字组件的安装、API 与效果清单。",
};

const apiProps = [
  ["children", "string", "—", "需要展示的文字内容"],
  ["effect", "EffectId", "—", "48 种预设效果之一"],
  ["as", "ElementType", '"span"', "输出的语义 HTML 标签"],
  ["duration", "number", "1.8", "动画时长，单位为秒"],
  ["delay", "number", "0", "动画开始前的等待时间"],
  ["paused", "boolean", "false", "暂停当前效果"],
  ["className", "string", '""', "添加自定义样式类"],
  ["style", "CSSProperties", "—", "添加行内样式"],
];

export default function DocsPage() {
  return (
    <main className="docs-page">
      <header className="site-header docs-header">
        <Link href="/" className="brand" aria-label="返回字场首页">
          <span className="brand-mark">字</span>
          <span>字场 <b>ZICHANG</b></span>
        </Link>
        <span className="docs-header-title">DOCUMENTATION / 01</span>
        <Link className="back-link" href="/">← 返回组件库</Link>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <span>开始使用</span>
          <a href="#intro">介绍</a>
          <a href="#install">安装</a>
          <a href="#usage">基本用法</a>
          <a href="#standalone">独立组件</a>
          <span>组件</span>
          <a href="#ui-components">按钮、表单与反馈</a>
          <a href="#ai-components">AI 对话组件</a>
          <a href="#api">TextEffect API</a>
          <a href="#catalog">效果清单</a>
          <a href="#accessibility">无障碍</a>
        </aside>

        <article className="docs-content">
          <section id="intro" className="docs-hero">
            <span className="eyebrow">GETTING STARTED</span>
            <h1>把文字变成<br /><TextEffect effect="gradient">会呼吸的界面。</TextEffect></h1>
            <p>字场按文字、按钮、表单、导航、展示、反馈与 AI 组织组件。文字类提供统一的 <code>TextEffect</code> API；通用组件独立实现，支持真实交互、自定义外观与完整源码复制。</p>
            <div className="docs-status"><i /> 当前版本 <b>0.1.0</b><span>{effectCatalog.length + uiCatalog.length} 个组件示例 · {componentCategories.length - 1} 类</span><span>本地开发版</span></div>
            <figure className="docs-showcase docs-showcase-hero">
              <a href="/docs/images/zichang-hero.png" target="_blank" rel="noreferrer"><Image src="/docs/images/zichang-hero.png" alt="字场首页：动态标题、轨道光线、粒子与组件库入口" width={1440} height={900} priority /></a>
              <figcaption>首页 · 动效现场与组件目录入口</figcaption>
            </figure>
            <div className="docs-visual-grid">
              <figure className="docs-showcase">
                <a href="/docs/images/component-gallery.png" target="_blank" rel="noreferrer"><Image src="/docs/images/component-gallery.png" alt="按钮组件分类的真实交互预览目录" width={1440} height={900} /></a>
                <figcaption>组件目录 · 预览与分类筛选</figcaption>
              </figure>
              <figure className="docs-showcase">
                <a href="/docs/images/ai-workbench.png" target="_blank" rel="noreferrer"><Image src="/docs/images/ai-workbench.png" alt="AI 对话框的实时预览、自定义参数和代码" width={1440} height={900} /></a>
                <figcaption>参数工作台 · 预览与源码</figcaption>
              </figure>
            </div>
            <div className="docs-workflow"><h2>从挑选到复制，四步完成</h2><Image src="/docs/images/component-workflow.svg" alt="挑选组件、调整参数、实时预览、复制源码" width={1280} height={400} /></div>
          </section>

          <section className="docs-section" id="ui-components">
            <h2>通用组件与自定义</h2>
            <p>通用目录提供 18 种按钮样式及 20 个表单、导航、展示、反馈和 AI 组件示例。样式、尺寸、角色、输入类型与语义色使用中英双语选项，生成代码保留英文 API 值。新增玻璃、斜纹、虚线、极简线条、聚光和复古按钮。打开“参数与源码”，调节主题色、表面色、圆角、字号、间距及专属参数。设置通过 CSS 变量写入生成示例；输入内容、勾选和数值变化也会同步到代码。复制完整源码时按文件注释保存 TSX、CSS 和 Example.tsx。所有组件支持 style 与 className，无需本站全局样式。</p>
            <p>按钮可调加载、禁用、动画速度；输入框可调类型与占位提示；选择器与标签页可编辑选项；卡片支持投影；提示支持语义色；骨架屏支持行数与条高。标签页具备方向键、Home / End、面板关联和独立 ID，折叠面板使用原生 details / summary。静态提示默认不自动播报。</p>
            <div className="code-sample"><pre><code>{`import { Button } from "./components/ui/button/Button";
import "./components/ui/button/button.css";
<Button variant="solid">保存</Button>
<Button variant="shiny" size="large">立即升级</Button>

import { Switch } from "./components/ui/switch/Switch";
import "./components/ui/switch/switch.css";
<label><Switch defaultChecked name="notifications" />启用通知</label>
<Switch disabled aria-label="不可用开关" />

import { Progress } from "./components/ui/progress/Progress";
import "./components/ui/progress/progress.css";
<Progress value={68} aria-label="同步进度" />
<Progress value={30} max={50} showValue={false} aria-label="下载进度" />`}</code></pre></div>
            <div className="table-wrap"><table><thead><tr><th>组件</th><th>分类</th><th>说明</th></tr></thead><tbody>{uiCatalog.map(entry => <tr key={entry.id}><td>{entry.name} / {entry.en}</td><td>{entry.category}</td><td>{entry.description}</td></tr>)}</tbody></table></div>
            <p>目录与交互范围参考 <a href="https://ui.wzx.wang/">wui</a> 和 <a href="https://ui.shadcn.com/docs/components">shadcn/ui</a>，本站组件以 React 与原生 HTML/CSS 独立实现，不需要安装参考站组件包。</p>
          </section>
          <section className="docs-section" id="ai-components">
            <h2>AI 对话组件</h2>
            <p>AI 分类提供完整对话框、聊天气泡、消息输入框、思考状态、建议提示词和过程摘要。每项都支持固定预览、自定义样式与独立源码。对话框可发送本地消息和固定示例回复；onSend 与受控消息接口可由应用接入实际服务。本站不会请求 AI 服务。</p>
            <p>消息输入支持 Enter 发送、Shift+Enter 换行和输入法保护。气泡按纯文本显示，思考动画支持暂停及减少动画；过程摘要展示调用方提供的内容。</p>
            <div className="code-sample"><pre><code>{`import { Conversation } from "./components/ui/conversation/Conversation";
import "./components/ui/conversation/conversation.css";
<Conversation title="AI 助手" welcome="告诉我你想解决什么问题。" />

import { ChatMessage } from "./components/ui/chat-message/ChatMessage";
import "./components/ui/chat-message/chat-message.css";
<ChatMessage speaker="user" content="帮我整理项目计划。" />
<ChatMessage speaker="assistant" author="规划助手" content="我们可以先确定目标和优先级。" />`}</code></pre></div>
            <p>组件范围参考 <a href="https://elements.ai-sdk.dev/components/conversation">AI Elements</a>，本站以 React 与 CSS 独立实现。</p>
          </section>
          <section className="docs-section" id="interaction-effects">
            <h2>信号故障与字距磁吸</h2>
            <p>打开对应卡片调节专属参数。默认悬停或 Tab 聚焦时触发；触屏可使用“锁定效果”或选择“持续显示”。暂停互动恢复静态文字，重置会恢复专属默认值。完整源码包含实际组件、CSS 和示例，无需本站路径或样式。</p>
            <div className="code-sample"><pre><code>{`import { GlitchText } from "./GlitchText";
import "./glitch-text.css";
<GlitchText offset={4} jitter={2} skew={3}>信号接入 SIGNAL 2026</GlitchText>
<GlitchText trigger="always" primaryColor="#ffd166" duration={1.2}>持续错位</GlitchText>

import { MagnetText } from "./MagnetText";
import "./magnet-text.css";
<MagnetText restSpacing={0.16} activeSpacing={-0.08}>中文 ABC 👨‍👩‍👧‍👦</MagnetText>
<MagnetText trigger="always" restSpacing={0} activeSpacing={0.3} lift={8}>舒展标题</MagnetText>`}</code></pre></div>
            <p>共有 API：children、as、color、trigger（hover / always）、active（默认 false）、paused（默认 false）、duration（0.2–8 秒）、delay（0–3 秒）、tabIndex、className、style。hover 默认可按 Tab 聚焦；嵌入可聚焦按钮时设置 tabIndex=-1，并由父元素传入 active。</p>
            <p>GlitchText：primaryColor / secondaryColor 控制左右色差；offset 默认 4px（0–16px）、jitter 默认 2px（0–8px）、skew 默认 3°（0–12°）、duration 默认 0.6 秒。系统减少动态效果时保留静态色差。</p>
            <p>MagnetText：restSpacing 默认 0.16em、activeSpacing 默认 -0.08em（均为 -0.1–0.5em）；activeColor 控制触发颜色；lift 默认 0px（0–16px）；duration 默认 0.4 秒。占位按较大字距预留，变换不会挤动相邻内容。减少动态效果时保留初始字距、关闭过渡，仅改变颜色。</p>
            <p>磁吸适合单行短标题，长文本需要容器预留空间或横向滚动。Intl.Segmenter 保留中文、组合字符和完整 emoji；旧浏览器回退到 Unicode 码点，复杂 emoji 需 Segmenter polyfill。完整文本独立提供给辅助技术，视觉字符不会被逐字朗读。HTML + CSS 输出包含当前文本的静态分段，修改文本后请重新生成。两个效果均无计时器。</p>
          </section>

          <section className="docs-section" id="basic-effects">
            <h2>霓虹、彩虹与长投影</h2>
            <p>在效果库打开对应卡片，可调节专属参数并复制 React 用法、完整 TSX + CSS 或 HTML + CSS。完整源码按文件标注拆分到同一目录，无需本站样式或路径别名。</p>
            <div className="code-sample"><pre><code>{`import { NeonText } from "./NeonText";
import "./neon-text.css";
<NeonText glowColor="#46e6d4" glowRadius={32}>字场 ZICHANG 2026 ✨</NeonText>
<NeonText animated={false} intensity={0.5}>静态灯牌</NeonText>

import { RainbowText } from "./RainbowText";
import "./rainbow-text.css";
<RainbowText direction="right" duration={3}>彩虹流体 🌈</RainbowText>
<RainbowText animated={false} angle={135}>静态色带</RainbowText>

import { LongShadowText } from "./LongShadowText";
import "./long-shadow-text.css";
<LongShadowText angle={45} length={24}>海报标题</LongShadowText>
<LongShadowText angle={135} length={48} shadowColor="#fa5b91">另一束光</LongShadowText>`}</code></pre></div>
            <p>三者均支持 children、as、className、style。霓虹支持 color、glowColor、glowRadius（0–64px）、intensity（0–2）；彩虹支持 color1–color4、angle（0–360°）、spread（100–500%）、direction。两者支持 animated、duration（秒）、delay（秒）与 paused，并跟随系统减少动态效果偏好。长投影支持 color、shadowColor、angle 与 length（0–80px），是静态效果。</p>
            <p>霓虹适合深色背景；彩虹需要现代浏览器的文字背景裁剪支持，不支持时显示第一种颜色；长投影最多生成 80 层硬边阴影，请为它预留边距。文字保持完整，不拆分中文或 emoji。</p>
          </section>

          <section id="install" className="docs-section">
            <span className="docs-number">01</span>
            <h2>安装</h2>
            <p>当前阶段直接从项目内导入组件。Registry 接口已经预留，公开发布后可切换为单命令安装。</p>
            <div className="code-sample">
              <div><span>项目内导入</span><button aria-label="复制功能将在公开版开放">COPY</button></div>
              <pre><code>{`import { TextEffect } from "@/components/text-effects";`}</code></pre>
            </div>
          </section>

          <section id="usage" className="docs-section">
            <span className="docs-number">02</span>
            <h2>基本用法</h2>
            <p>只需指定效果名和文本。时长、延迟、语义标签等能力按需加入。</p>
            <div className="docs-demo">
              <TextEffect as="h3" effect="slide" duration={1.4}>让文字动起来</TextEffect>
            </div>
            <div className="code-sample">
              <div><span>TSX</span><span>TEXT EFFECT</span></div>
              <pre><code>{`<TextEffect as="h2" effect="slide" duration={1.4}>
  让文字动起来
</TextEffect>`}</code></pre>
            </div>
          </section>

          <section id="standalone" className="docs-section">
            <span className="docs-number">03</span>
            <h2>复制独立组件</h2>
            <p>需要精细调整时，直接使用独立组件。它们只有 React、共享字符切分工具和各自 CSS，不依赖展示站。</p>
            <div className="docs-demo"><SlideText direction="left" distance={48} stagger={0.08}>四向滑入，自由调节</SlideText></div>
            <div className="code-sample"><div><span>TSX</span><span>SLIDE TEXT</span></div><pre><code>{`import { SlideText } from "@/components/text-effects";
import "@/components/text-effects/slide-text/slide-text.css";

<SlideText direction="left" distance={48} stagger={0.08} duration={0.7}>
  四向滑入，自由调节
</SlideText>`}</code></pre></div>
            <p>同类独立组件还有 <code>BlurText</code> 和 <code>ScaleText</code>。在首页打开对应卡片，可调参数并复制 React、完整源码或 HTML + CSS。</p>
            <p>现有 15 个独立组件的完整源码直接读取实际文件。按注释分别保存 TSX、CSS 和示例，保留目录结构；高亮需要 types.ts，滑入、模糊、缩放、波浪和打字机需要 core/segment-text.ts。示例使用相对导入，不依赖本站路径别名。</p>
            <p>打字机支持输入/删除速度、停留时间、开始延迟、光标和循环开关；按完整 emoji 输入和删除，预留全文宽度，暂停或减少动态效果时显示全文，后台和卸载时清理计时器。它需要 React 状态，不提供纯 HTML + CSS。</p>
            <p>本地 Registry 包含通用 text-effect、15 个独立条目及 text-effects 聚合条目。运行 npm run build:distribution 可在 outputs/distribution 生成含源码及安装目标的 JSON、源码 ZIP 和 SHA-256 清单；运行 npm run check:bundles 可生成按需导入体积报告。尚未提供公共安装地址，真实 shadcn CLI 安装仍待验证。</p>
          </section>

          <section id="api" className="docs-section">
            <span className="docs-number">04</span>
            <h2>TextEffect API</h2>
            <p>所有效果共享同一份属性定义，切换效果不需要改变组件结构。</p>
            <div className="api-table-wrap">
              <table className="api-table">
                <thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead>
                <tbody>{apiProps.map(([name, type, value, description]) => <tr key={name}><td><code>{name}</code></td><td>{type}</td><td>{value}</td><td>{description}</td></tr>)}</tbody>
              </table>
            </div>
          </section>

          <section id="catalog" className="docs-section">
            <span className="docs-number">05</span>
            <h2>效果清单</h2>
            <p>同一个组件覆盖全部预设；每项都可继续组合字号、颜色和布局样式。</p>
            <div className="docs-effect-list">
              {effectCatalog.map((effect, index) => (
                <div key={effect.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p><b>{effect.name}</b><small>{effect.id}</small></p>
                  <div><TextEffect effect={effect.id} duration={2.2}>字场</TextEffect></div>
                  <code>{`effect="${effect.id}"`}</code>
                </div>
              ))}
            </div>
          </section>

          <section id="accessibility" className="docs-section docs-last">
            <span className="docs-number">06</span>
            <h2>无障碍与中文支持</h2>
            <div className="docs-callout">
              <b>默认就是可读的。</b>
              <p>逐字效果的视觉字符会对辅助技术隐藏，同时在外层保留完整文本标签。字符切分优先使用 <code>Intl.Segmenter</code>，避免拆坏 emoji 和组合字符。</p>
            </div>
            <p>当系统启用“减少动态效果”时，动画将缩短至近乎即时。页面级的“暂停动画”同样会传递给每个实例。</p>
          </section>
        </article>
      </div>
    </main>
  );
}
