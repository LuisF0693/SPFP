// AIOS Virtual Office - Chat Message Component
import { memo } from 'react';

export interface ChatMessageData {
  id: string;
  agentId: string;
  content: string;
  isUser: boolean;
  timestamp: number;
}

interface ChatMessageProps {
  message: ChatMessageData;
  agentEmoji?: string;
  agentName?: string;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  agentEmoji,
  agentName
}: ChatMessageProps) {
  const { content, isUser, timestamp } = message;

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-3 animate-fade-in">
        <div className="max-w-[80%]">
          <div
            className="px-4 py-2.5 rounded-2xl rounded-br-md
              bg-blue-600 text-white shadow-lg"
          >
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          </div>
          <p className="text-[10px] text-gray-500 text-right mt-1 mr-1">
            {formatTime(timestamp)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3 animate-fade-in">
      <div className="flex gap-2 max-w-[80%]">
        {/* Agent Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700
          flex items-center justify-center text-sm shadow-lg">
          {agentEmoji || '🤖'}
        </div>

        <div className="flex-1">
          {agentName && (
            <p className="text-[10px] text-gray-500 mb-1 ml-1">{agentName}</p>
          )}
          <div
            className="px-4 py-2.5 rounded-2xl rounded-bl-md
              bg-gray-700/80 text-gray-100 shadow-lg backdrop-blur-sm"
          >
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
          </div>
          <p className="text-[10px] text-gray-500 mt-1 ml-1">
            {formatTime(timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
});

export default ChatMessage;
