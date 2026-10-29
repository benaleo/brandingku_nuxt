import type { DiscussionSubject } from "~/types/discussion.type";

export type WidgetDiscussion = { subjectType: DiscussionSubject; subjectId: number; label: string };

// Shared open state for the floating live chat, so any page can open it with a topic.
export const useChatWidget = () => {
  const open = useState("chat-widget-open", () => false);
  // shown in the input once the visitor has finished the name/contact steps
  const pendingTopic = useState("chat-widget-topic", () => "");
  // a page with a discussion (an order) sets it; the floating button then opens that thread
  // instead of the bot and admin live chat. The page clears it when it unmounts.
  const discussion = useState<WidgetDiscussion | null>("chat-widget-discussion", () => null);

  const openChat = (topic?: string) => {
    if (topic) pendingTopic.value = topic;
    open.value = true;
  };

  return { open, pendingTopic, discussion, openChat };
};
