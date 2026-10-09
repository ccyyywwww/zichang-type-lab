"use client";
import { useState, useId, type HTMLAttributes } from "react";
export type ConversationMessage = { id: string; speaker: "user" | "assistant"; content: string };
export type ConversationProps = HTMLAttributes<HTMLElement> & { title?: string; welcome?: string; placeholder?: string; reply?: string; disabled?: boolean; initialMessages?: ConversationMessage[]; messages?: ConversationMessage[]; onMessagesChange?: (messages: ConversationMessage[]) => void; onSend?: (message: string) => void };
export function Conversation({ title = "AI 助手", welcome = "你好，我可以帮你整理想法。", placeholder = "输入问题…", reply = "已收到你的消息。这是一条本地演示回复。", disabled = false, initialMessages = [], messages: controlledMessages, onMessagesChange, onSend, className = "", ...props }: ConversationProps) {
  const [internalMessages, setMessages] = useState(initialMessages);
  const messages = controlledMessages ?? internalMessages;
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const instance = useId();
  const send = () => { const text = draft.trim(); if (!text || disabled) return; const id = `${instance}-${messages.length}`; const next: ConversationMessage[] = [...messages, { id: `${id}-user`, speaker: "user", content: text }, ...(!onSend ? [{ id: `${id}-assistant`, speaker: "assistant" as const, content: reply }] : [])]; setMessages(next); onMessagesChange?.(next); setDraft(""); setNotice(onSend ? "消息已提交" : "已添加本地演示回复"); onSend?.(text); };
  return <section {...props} className={`zc-conversation ${className}`} aria-label={title}>
    <header><strong>{title}</strong><span>{onSend ? "对话" : "本地交互演示"}</span></header>
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- A labelled scroll region needs keyboard focus to scroll its history. */}
    <div className="zc-conversation-messages" role="region" aria-label="对话记录" tabIndex={0}>{!messages.length && <p className="zc-conversation-welcome">{welcome}</p>}{messages.map(message => <div className={`zc-conversation-message zc-conversation-message--${message.speaker}`} key={message.id}><span>{message.speaker === "assistant" ? title : "你"}</span><p>{message.content}</p></div>)}</div>
    <form onSubmit={event => { event.preventDefault(); send(); }}><textarea aria-label="消息内容" rows={2} placeholder={placeholder} value={draft} disabled={disabled} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }} /><button type="submit" disabled={disabled || !draft.trim()}>发送 ↗</button></form><span className="zc-conversation-notice" role="status">{notice}</span>
  </section>;
}
