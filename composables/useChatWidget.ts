// Shared open state for the floating live chat, so any page can open it with a topic.
export const useChatWidget = () => {
  const open = useState("chat-widget-open", () => false);
  // shown in the input once the visitor has finished the name/contact steps
  const pendingTopic = useState("chat-widget-topic", () => "");

  const openChat = (topic?: string) => {
    if (topic) pendingTopic.value = topic;
    open.value = true;
  };

  return { open, pendingTopic, openChat };
};
