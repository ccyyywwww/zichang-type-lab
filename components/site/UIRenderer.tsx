"use client";
import { Button, Switch, Progress, Input, Textarea, Select, Checkbox, Slider, Badge, Card, Alert, Spinner, Skeleton, Accordion, Tabs, ChatMessage, PromptInput, ThinkingIndicator, PromptSuggestions, ReasoningPanel, Conversation, type ConversationMessage } from "../ui";
import { uiTheme, uiItems, type UIOptions } from "../../lib/ui-component-code";
import type { UIEntry } from "./ui-catalog";
export type UIInteraction = { text: string; selection: string; clicks: number; messages?: ConversationMessage[] };
export function UIRenderer({ entry, options, onChange, interaction, onInteraction }: { entry: UIEntry; options: UIOptions; onChange: (change: Partial<UIOptions>) => void; interaction: UIInteraction; onInteraction: (change: Partial<UIInteraction>) => void }) {
  const style = uiTheme(options);
  const items = uiItems(options.items);
  switch (entry.kind) {
    case "button": return <><Button style={style} variant={options.variant} size={options.size} disabled={options.disabled} loading={options.loading} paused={options.paused} onClick={() => onInteraction({ clicks: interaction.clicks + 1 })}>{options.label}</Button><small role="status">{interaction.clicks ? `已点击 ${interaction.clicks} 次` : "点击试试"}</small></>;
    case "switch": return <label className="ui-switch-label" style={{ color: options.foreground, fontSize: options.fontSize }}><Switch style={style} checked={options.checked} disabled={options.disabled} onChange={event => onChange({ checked: event.target.checked })} />{options.label}</label>;
    case "checkbox": return <label className="ui-switch-label" style={{ color: options.foreground, fontSize: options.fontSize }}><Checkbox style={style} checked={options.checked} disabled={options.disabled} onChange={event => onChange({ checked: event.target.checked })} />{options.label}</label>;
    case "progress": return <Progress style={style} value={options.value} showValue={options.showValue} aria-label={options.label} />;
    case "input": return <Input style={style} value={interaction.text} onChange={event => onInteraction({ text: event.target.value })} type={options.inputType} placeholder={options.placeholder} aria-label={options.label} disabled={options.disabled} />;
    case "textarea": return <Textarea style={style} value={interaction.text} onChange={event => onInteraction({ text: event.target.value })} rows={options.rows} placeholder={options.placeholder} aria-label={options.label} disabled={options.disabled} />;
    case "select": return <Select style={style} value={interaction.selection} options={items.map((label, index) => ({ value: String(index), label }))} onChange={event => onInteraction({ selection: event.target.value })} aria-label={options.label} disabled={options.disabled} />;
    case "slider": return <><Slider style={style} step={options.step} value={options.value} onChange={event => onChange({ value: Number(event.target.value) })} aria-label={options.label} disabled={options.disabled} /><output>{options.value}</output></>;
    case "badge": return <Badge style={style} tone={options.tone === "info" ? "accent" : options.tone}>{options.label}</Badge>;
    case "card": return <Card style={style} heading={options.label} description={options.description} elevated={options.elevated} />;
    case "alert": return <Alert style={style} heading={options.label} description={options.description} tone={options.tone === "accent" ? "info" : options.tone} />;
    case "spinner": return <Spinner style={style} label={options.label} paused={options.paused} />;
    case "skeleton": return <Skeleton style={style} lines={options.lines} label={options.label} paused={options.paused} />;
    case "accordion": return <Accordion style={style} heading={options.label} open={options.open} onToggle={event => { if (event.currentTarget.open !== options.open) onChange({ open: event.currentTarget.open }); }}>{options.description}</Accordion>;
    case "tabs": return <Tabs style={style} items={items.map(label => ({ label, content: `${label}：${options.description}` }))} aria-label={options.label} />;
    case "chat-message": return <ChatMessage style={style} speaker={options.speaker} author={options.label} content={options.description} showAvatar={options.showAvatar} />;
    case "prompt-input": return <><PromptInput style={style} value={interaction.text} onValueChange={text => onInteraction({ text })} onSubmit={selection => onInteraction({ selection })} label={options.label} placeholder={options.placeholder} disabled={options.disabled} busy={options.loading} /><small role="status">{interaction.selection !== "0" ? `已提交：${interaction.selection}` : "等待输入"}</small></>;
    case "thinking-indicator": return <ThinkingIndicator style={style} label={options.label} paused={options.paused} />;
    case "prompt-suggestions": return <><PromptSuggestions style={style} suggestions={items} label={options.label} disabled={options.disabled} onSelect={selection => onInteraction({ selection })} /><small role="status">{interaction.selection !== "0" ? `已选择：${interaction.selection}` : "选择一个问题"}</small></>;
    case "reasoning-panel": return <ReasoningPanel style={style} label={options.label} content={options.description} busy={options.loading} open={options.open} onToggle={event => { if (event.currentTarget.open !== options.open) onChange({ open: event.currentTarget.open }); }} />;
    case "conversation": return <Conversation style={style} title={options.label} welcome={options.description} reply={options.description} placeholder={options.placeholder} disabled={options.disabled} messages={interaction.messages} onMessagesChange={messages => onInteraction({ messages })} />;
  }
}
