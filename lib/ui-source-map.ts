// Actual component files used by the copy workbench.
import chatMessageSource from "../components/ui/chat-message/ChatMessage.tsx?raw";
import chatMessageCSS from "../components/ui/chat-message/chat-message.css?raw";
import promptInputSource from "../components/ui/prompt-input/PromptInput.tsx?raw";
import promptInputCSS from "../components/ui/prompt-input/prompt-input.css?raw";
import thinkingSource from "../components/ui/thinking-indicator/ThinkingIndicator.tsx?raw";
import thinkingCSS from "../components/ui/thinking-indicator/thinking-indicator.css?raw";
import suggestionsSource from "../components/ui/prompt-suggestions/PromptSuggestions.tsx?raw";
import suggestionsCSS from "../components/ui/prompt-suggestions/prompt-suggestions.css?raw";
import reasoningSource from "../components/ui/reasoning-panel/ReasoningPanel.tsx?raw";
import reasoningCSS from "../components/ui/reasoning-panel/reasoning-panel.css?raw";
import conversationSource from "../components/ui/conversation/Conversation.tsx?raw";
import conversationCSS from "../components/ui/conversation/conversation.css?raw";
import buttonSource from "../components/ui/button/Button.tsx?raw";
import buttonCSS from "../components/ui/button/button.css?raw";
import switchSource from "../components/ui/switch/Switch.tsx?raw";
import switchCSS from "../components/ui/switch/switch.css?raw";
import progressSource from "../components/ui/progress/Progress.tsx?raw";
import progressCSS from "../components/ui/progress/progress.css?raw";
import inputSource from "../components/ui/input/Input.tsx?raw";
import inputCSS from "../components/ui/input/input.css?raw";
import textareaSource from "../components/ui/textarea/Textarea.tsx?raw";
import textareaCSS from "../components/ui/textarea/textarea.css?raw";
import selectSource from "../components/ui/select/Select.tsx?raw";
import selectCSS from "../components/ui/select/select.css?raw";
import checkboxSource from "../components/ui/checkbox/Checkbox.tsx?raw";
import checkboxCSS from "../components/ui/checkbox/checkbox.css?raw";
import sliderSource from "../components/ui/slider/Slider.tsx?raw";
import sliderCSS from "../components/ui/slider/slider.css?raw";
import badgeSource from "../components/ui/badge/Badge.tsx?raw";
import badgeCSS from "../components/ui/badge/badge.css?raw";
import cardSource from "../components/ui/card/Card.tsx?raw";
import cardCSS from "../components/ui/card/card.css?raw";
import alertSource from "../components/ui/alert/Alert.tsx?raw";
import alertCSS from "../components/ui/alert/alert.css?raw";
import spinnerSource from "../components/ui/spinner/Spinner.tsx?raw";
import spinnerCSS from "../components/ui/spinner/spinner.css?raw";
import skeletonSource from "../components/ui/skeleton/Skeleton.tsx?raw";
import skeletonCSS from "../components/ui/skeleton/skeleton.css?raw";
import accordionSource from "../components/ui/accordion/Accordion.tsx?raw";
import accordionCSS from "../components/ui/accordion/accordion.css?raw";
import tabsSource from "../components/ui/tabs/Tabs.tsx?raw";
import tabsCSS from "../components/ui/tabs/tabs.css?raw";
export const uiSources = {
  "chat-message": { name: "ChatMessage", source: chatMessageSource, css: chatMessageCSS },
  "prompt-input": { name: "PromptInput", source: promptInputSource, css: promptInputCSS },
  "thinking-indicator": { name: "ThinkingIndicator", source: thinkingSource, css: thinkingCSS },
  "prompt-suggestions": { name: "PromptSuggestions", source: suggestionsSource, css: suggestionsCSS },
  "reasoning-panel": { name: "ReasoningPanel", source: reasoningSource, css: reasoningCSS },
  conversation: { name: "Conversation", source: conversationSource, css: conversationCSS },
  button: { name: "Button", source: buttonSource, css: buttonCSS },
  switch: { name: "Switch", source: switchSource, css: switchCSS },
  progress: { name: "Progress", source: progressSource, css: progressCSS },
  input: { name: "Input", source: inputSource, css: inputCSS },
  textarea: { name: "Textarea", source: textareaSource, css: textareaCSS },
  select: { name: "Select", source: selectSource, css: selectCSS },
  checkbox: { name: "Checkbox", source: checkboxSource, css: checkboxCSS },
  slider: { name: "Slider", source: sliderSource, css: sliderCSS },
  badge: { name: "Badge", source: badgeSource, css: badgeCSS },
  card: { name: "Card", source: cardSource, css: cardCSS },
  alert: { name: "Alert", source: alertSource, css: alertCSS },
  spinner: { name: "Spinner", source: spinnerSource, css: spinnerCSS },
  skeleton: { name: "Skeleton", source: skeletonSource, css: skeletonCSS },
  accordion: { name: "Accordion", source: accordionSource, css: accordionCSS },
  tabs: { name: "Tabs", source: tabsSource, css: tabsCSS },
};
