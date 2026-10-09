import type { Metadata } from "next";
import "./globals.css";
import "@/components/ui/chat-message/chat-message.css";
import "@/components/ui/prompt-input/prompt-input.css";
import "@/components/ui/thinking-indicator/thinking-indicator.css";
import "@/components/ui/prompt-suggestions/prompt-suggestions.css";
import "@/components/ui/reasoning-panel/reasoning-panel.css";
import "@/components/ui/conversation/conversation.css";
import "@/components/ui/tabs/tabs.css";
import "@/components/ui/accordion/accordion.css";
import "@/components/ui/skeleton/skeleton.css";
import "@/components/ui/spinner/spinner.css";
import "@/components/ui/alert/alert.css";
import "@/components/ui/card/card.css";
import "@/components/ui/badge/badge.css";
import "@/components/ui/slider/slider.css";
import "@/components/ui/checkbox/checkbox.css";
import "@/components/ui/select/select.css";
import "@/components/ui/textarea/textarea.css";
import "@/components/ui/input/input.css";
import "@/components/ui/button/button.css";
import "@/components/ui/switch/switch.css";
import "@/components/ui/progress/progress.css";
import "@/components/text-effects/glitch-text/glitch-text.css";
import "@/components/text-effects/magnet-text/magnet-text.css";
import "@/components/text-effects/neon-text/neon-text.css";
import "@/components/text-effects/rainbow-text/rainbow-text.css";
import "@/components/text-effects/long-shadow-text/long-shadow-text.css";
import "@/components/text-effects/text-effects.css";
import "@/components/text-effects/highlight-text/highlight-text.css";
import "@/components/text-effects/gradient-text/gradient-text.css";
import "@/components/text-effects/outline-text/outline-text.css";
import "@/components/text-effects/underline-text/underline-text.css";
import "@/components/text-effects/slide-text/slide-text.css";
import "@/components/text-effects/blur-text/blur-text.css";
import "@/components/text-effects/scale-text/scale-text.css";
import "@/components/text-effects/typewriter-text/typewriter-text.css";
import "@/components/text-effects/shimmer-text/shimmer-text.css";
import "@/components/text-effects/wave-text/wave-text.css";

export const metadata: Metadata = {
  title: "字场 ZICHANG — 交互组件库",
  description: "为中文界面而生的文字、按钮、表单与反馈组件库，支持真实预览、参数调节与完整源码复制。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
