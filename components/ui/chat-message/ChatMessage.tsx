import type { HTMLAttributes } from "react";
export type ChatMessageProps = HTMLAttributes<HTMLElement> & { speaker?: "user" | "assistant"; author?: string; content?: string; showAvatar?: boolean };
export function ChatMessage({ speaker = "assistant", author, content = "你好，我可以帮你整理想法、解释代码和规划项目。", showAvatar = true, className = "", ...props }: ChatMessageProps) {
  const name = author ?? (speaker === "assistant" ? "AI 助手" : "你");
  return <article {...props} className={`zc-chat-message zc-chat-message--${speaker} ${className}`} aria-label={`${name}的消息`}>
    {showAvatar && <span className="zc-chat-message-avatar" aria-hidden="true">{speaker === "assistant" ? "✦" : "我"}</span>}
    <div className="zc-chat-message-body"><span className="zc-chat-message-author">{name}</span><p>{content}</p></div>
  </article>;
}
