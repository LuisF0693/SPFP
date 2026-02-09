// AIOS Virtual Office - Agent Chat Modal Component
import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import type { AgentState, AgentId } from '../types';
import { DEPARTMENT_COLORS } from '../data/agents';
import { ChatMessage, type ChatMessageData } from './ChatMessage';
import { useVirtualOfficeStore } from '../store/virtualOfficeStore';

interface AgentChatModalProps {
  agent: AgentState;
  isOpen: boolean;
  onClose: () => void;
}

// Mock responses based on agent persona
const MOCK_RESPONSES: Record<AgentId, string[]> = {
  dex: [
    "I'll analyze the code structure and suggest some improvements. Let me check the implementation patterns we're using...",
    "Based on my analysis, I recommend using TypeScript interfaces for better type safety. Want me to show you an example?",
    "The code looks good! I found a few opportunities for optimization in the component lifecycle.",
    "I can help with that implementation. Which approach would you prefer - hooks or class components?",
    "Let me refactor that for you. I'll use modern React patterns with proper error handling."
  ],
  quinn: [
    "I'll create comprehensive test cases for this feature. Let me outline the test scenarios...",
    "I noticed some edge cases that need testing. Should I write unit tests or integration tests first?",
    "The test coverage looks good, but we should add more edge case validation.",
    "I recommend using React Testing Library for this component. Want me to set up the test structure?",
    "Let me run the test suite and report any failures. This might take a moment..."
  ],
  morgan: [
    "Let me review the requirements and create a detailed implementation plan.",
    "I'll prioritize the backlog items based on business value and technical dependencies.",
    "The sprint goal looks achievable. I'll coordinate with the team on the timeline.",
    "I've drafted the user stories. Would you like me to add acceptance criteria?",
    "Let me schedule a planning session to discuss the roadmap priorities."
  ],
  sophie: [
    "I'll define the product vision and ensure alignment with user needs.",
    "Based on user research, I recommend focusing on these key features first...",
    "Let me clarify the acceptance criteria for this feature. The user value is clear.",
    "I'll create a product brief that outlines the strategic goals and success metrics.",
    "The feature aligns well with our product strategy. Let me define the scope."
  ],
  max: [
    "I'll facilitate the sprint planning and help remove any blockers.",
    "Let me update the Kanban board and track our team velocity.",
    "I noticed some process improvements we could make. Want me to share my suggestions?",
    "The daily standup is scheduled. I'll ensure everyone stays on track.",
    "Let me run a quick retrospective to gather feedback from the team."
  ],
  aria: [
    "I'll design a scalable architecture that meets our performance requirements.",
    "Let me create a system diagram showing the component interactions.",
    "Based on the requirements, I recommend a microservices approach for flexibility.",
    "I'll document the API contracts and ensure consistency across services.",
    "The architecture review is complete. Here are my recommendations for improvement..."
  ],
  nova: [
    "I'll set up the data pipeline with proper ETL transformations.",
    "Let me analyze the data schema and suggest optimizations for query performance.",
    "The database migration is ready. I'll handle the data integrity checks.",
    "I recommend using a columnar storage format for better analytics performance.",
    "Let me configure the data warehouse and set up the refresh schedules."
  ],
  luna: [
    "I'll create a user-centered design that focuses on accessibility and usability.",
    "Let me sketch some wireframes to visualize the user flow.",
    "The design system is ready. I'll ensure consistent UI patterns across components.",
    "Based on user testing, I recommend these UX improvements...",
    "I'll create high-fidelity mockups with the glassmorphism design language."
  ],
  atlas: [
    "I'll analyze the data and generate insights for decision making.",
    "Let me create a dashboard with key metrics and KPIs.",
    "The analysis reveals some interesting patterns. Want me to share the report?",
    "I recommend tracking these metrics to measure feature success.",
    "Let me run a cohort analysis to understand user behavior trends."
  ],
  gage: [
    "I'll configure the CI/CD pipeline for automated deployments.",
    "Let me check the server health and optimize the infrastructure.",
    "The deployment is ready. I'll handle the rollout with zero downtime.",
    "I recommend containerizing this service for better scalability.",
    "Let me set up monitoring and alerting for the production environment."
  ],
  orion: [
    "I'm coordinating the team to ensure efficient collaboration.",
    "Let me orchestrate the workflow and assign tasks to the right agents.",
    "The system is running smoothly. All agents are performing their roles effectively.",
    "I'll ensure the project stays on track and deadlines are met.",
    "Let me analyze the team performance and suggest process improvements."
  ]
};

// Get random response for agent
function getRandomResponse(agentId: AgentId): string {
  const responses = MOCK_RESPONSES[agentId] || MOCK_RESPONSES.orion;
  return responses[Math.floor(Math.random() * responses.length)];
}

export function AgentChatModal({
  agent,
  isOpen,
  onClose
}: AgentChatModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get store methods and state
  const { messages, addChatMessage, mockMode } = useVirtualOfficeStore((state) => ({
    messages: state.chatMessages[agent.id] || [],
    addChatMessage: state.addChatMessage,
    mockMode: state.mockMode
  }));

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isTyping) return;

    // Add user message
    addChatMessage(agent.id, {
      content: trimmedMessage,
      isUser: true
    });

    setInputValue('');
    setIsTyping(true);

    // In mock mode, simulate agent response
    if (mockMode) {
      const delay = 1000 + Math.random() * 1500; // 1-2.5s delay
      setTimeout(() => {
        addChatMessage(agent.id, {
          content: getRandomResponse(agent.id),
          isUser: false
        });
        setIsTyping(false);
      }, delay);
    } else {
      // TODO: Real AIOS integration
      // For now, still use mock
      const delay = 1000 + Math.random() * 1500;
      setTimeout(() => {
        addChatMessage(agent.id, {
          content: getRandomResponse(agent.id),
          isUser: false
        });
        setIsTyping(false);
      }, delay);
    }
  }, [inputValue, isTyping, agent.id, addChatMessage, mockMode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage, isTyping]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const colors = DEPARTMENT_COLORS[agent.department];

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-modal-title"
    >
      <div
        className="w-full max-w-lg h-[70vh] flex flex-col bg-gray-900/95 backdrop-blur-lg rounded-2xl
          border border-gray-700/50 shadow-2xl
          animate-scale-in overflow-hidden"
        style={{
          boxShadow: `0 0 40px ${colors.glow}, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 p-4 border-b border-gray-700/50 flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}10)`
          }}
        >
          {/* Agent Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl
              shadow-lg flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 20px ${colors.glow}`
            }}
          >
            {agent.emoji}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h2 id="chat-modal-title" className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat with {agent.name}
            </h2>
            <p className="text-sm text-gray-400 truncate">
              {agent.role}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start a conversation with {agent.name}</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  agentEmoji={agent.emoji}
                  agentName={msg.isUser ? undefined : agent.name}
                />
              ))}
            </>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-400 animate-fade-in">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700
                flex items-center justify-center text-sm">
                {agent.emoji}
              </div>
              <div className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gray-700/50">
                <span className="text-xs">{agent.name} is typing</span>
                <span className="flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700/50 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agent.name}...`}
              disabled={isTyping}
              className="flex-1 px-4 py-3 rounded-xl
                bg-gray-800/50 border border-gray-700/50
                text-white placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:border-gray-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-3 rounded-xl font-medium text-white
                flex items-center justify-center gap-2
                transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 4px 20px ${colors.glow}`
              }}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}

export default AgentChatModal;
