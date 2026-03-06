import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertCircle, Loader2, User } from 'lucide-react';
import { FinnAvatar } from '../FinnAvatar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface FinnMessageListProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  userName: string;
  scrollRef: React.RefObject<HTMLDivElement>;
  formatTime: (ts: number) => string;
}

/**
 * Scrollable chat message list for the Finn chat interface.
 * Extracted from Insights.tsx (TD-S3-003).
 */
export const FinnMessageList: React.FC<FinnMessageListProps> = ({
  messages,
  loading,
  error,
  userName,
  scrollRef,
  formatTime,
}) => {
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar scroll-smooth"
      data-testid="finn-message-list"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
        >
          <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border shadow-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {msg.role === 'user' ? <User size={20} /> : <FinnAvatar mode="advisor" size="sm" />}
            </div>
            <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div
                className={`p-6 rounded-[1.5rem] shadow-2xl relative ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-blue max-w-none prose-p:leading-relaxed prose-p:text-gray-300 prose-headings:font-serif prose-headings:text-white prose-headings:mb-4 prose-table:border prose-table:border-white/10 prose-th:bg-white/5 prose-td:border-white/10 prose-li:text-gray-300 prose-strong:text-blue-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                )}
              </div>
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-2 block">
                {formatTime(msg.timestamp)} • {msg.role === 'user' ? userName || 'Você' : 'Finn'}
              </span>
            </div>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start animate-fade-in">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
              <FinnAvatar mode="advisor" size="sm" />
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-[1.5rem] rounded-tl-none shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#1B85E3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#1B85E3] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 bg-[#1B85E3] rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
                <span className="text-xs text-gray-500 font-medium">Finn está analisando...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs flex items-center gap-3 mx-auto max-w-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};
