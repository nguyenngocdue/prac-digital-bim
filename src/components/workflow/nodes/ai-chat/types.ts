export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type AIChatNoteNodeProps = {
  id: string;
  data: {
    label?: string;
    messages?: Message[];
  };
  selected?: boolean;
};

export type ModelSelectorProps = {
  selectedModel: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (model: string) => void;
};
