"use client";

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Conversation } from "@/types";
import { apiClient } from "@/utils/apiClient";
import { useSocket } from "@/context/SocketContext";

type Tab = { id: string; label: string; icon?: React.ReactNode; href: string };

export function Sidebar({ tabs }: { tabs: Tab[] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { socket } = useSocket();

  const refreshConversations = async () => {
    try {
      const data = await apiClient.get<Conversation[]>('/conversation');
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    }
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  // Refresh conversations when pathname changes (e.g., navigating to a new conversation)
  useEffect(() => {
    // Small delay to ensure backend has processed the conversation
    const timer = setTimeout(() => {
      refreshConversations();
    }, 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Listen for socket events to refresh conversations
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = (data: any) => {
      console.log('Received conversation updated event:', data);
      refreshConversations();
    };

    const handleConversationMessage = (data: any) => {
      console.log('Received conversation message event:', data);
      refreshConversations();
    };

    socket.on('conversations.updated', handleConversationUpdated);
    socket.on('conversations.message', handleConversationMessage);

    return () => {
      socket.off('conversations.updated', handleConversationUpdated);
      socket.off('conversations.message', handleConversationMessage);
    };
  }, [socket]);

  // Listen for custom event to refresh conversations
  useEffect(() => {
    const handleConversationUpdated = (event: CustomEvent) => {
      console.log('Received conversation-updated custom event:', event.detail);
      // Small delay to ensure backend has processed the title update
      setTimeout(() => {
        refreshConversations();
      }, 300);
    };

    window.addEventListener('conversation-updated', handleConversationUpdated as EventListener);

    return () => {
      window.removeEventListener('conversation-updated', handleConversationUpdated as EventListener);
    };
  }, []);

  return (
    <aside 
      className={`h-full transition-all duration-500 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      } max-h-screen overflow-hidden relative`}
    >
      {/* Glassmorphic Background */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl border-r border-white/10"></div>
      
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header with Logo and Toggle */}
        <div className="h-16 flex items-center px-4 justify-between border-b border-white/10">
          {!isCollapsed && (
            <div className="flex items-center gap-2 font-bold text-xl text-white animate-fadeIn">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Copilot
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="cursor-pointer p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-110 hover:shadow-lg group"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={18} className="text-gray-300 group-hover:text-white transition-colors" />
            ) : (
              <ChevronLeft size={18} className="text-gray-300 group-hover:text-white transition-colors" />
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-2">
          <div className={`text-xs font-semibold text-gray-400 mb-3 ${isCollapsed ? 'text-center' : 'px-3'}`}>
            {!isCollapsed && 'NAVIGATION'}
          </div>
          {tabs.map((t) => {
            const isActive = pathname === t.href;
            return (
              <Link
                key={t.id}
                href={t.href}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-gray-700 to-gray-600 text-white shadow-lg"
                    : "hover:bg-white/10 text-gray-300 hover:text-white",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
                title={isCollapsed ? t.label : undefined}
              >
                {/* Active Indicator Bar */}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full animate-slideInLeft"></div>
                )}
                
                {/* Icon with Hover Animation */}
                <span className={clsx(
                  "transition-transform duration-300",
                  !isCollapsed && "group-hover:scale-110 group-hover:rotate-6"
                )}>
                  {t.icon}
                </span>
                
                {/* Label with Fade */}
                {!isCollapsed && (
                  <span className="cursor-pointer transition-all duration-300 group-hover:translate-x-1">
                    {t.label}
                  </span>
                )}

                {/* Hover Shimmer Effect */}
                {!isActive && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Conversations Section */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className={`text-xs font-semibold text-gray-400 mb-3 mt-6 flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'px-3'}`}>
            {!isCollapsed && (
              <>
                <MessageSquare size={14} />
                <span>RECENT CHATS</span>
                <span className="ml-auto px-2 py-0.5 bg-white/10 rounded-full text-[10px]">
                  {conversations.length}
                </span>
              </>
            )}
            {isCollapsed && <MessageSquare size={14} />}
          </div>
          
          <div className="space-y-2">
            {conversations.length === 0 && !isCollapsed && (
              <div className="text-center py-8 text-gray-500 text-sm">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            )}
            
            {conversations.map((t, index) => {
              const isActive = pathname === `/chat/${t.id}`;
              return (
                <Link
                  key={t.id}
                  href={`/chat/${t.id}`}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 relative group overflow-hidden",
                    isActive
                      ? "bg-white/10 text-white border border-white/20 shadow-lg"
                      : "hover:bg-white/5 text-gray-400 hover:text-gray-200 border border-transparent",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                  title={isCollapsed ? t.title : undefined}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Chat Bubble Icon */}
                  {isCollapsed && (
                    <div className={clsx(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      isActive ? "bg-white" : "bg-gray-600 group-hover:bg-gray-400"
                    )}></div>
                  )}
                  
                  {/* Conversation Title */}
                  {!isCollapsed && (
                    <span className="flex-1 truncate transition-all duration-300 group-hover:translate-x-1">
                      {t.title}
                    </span>
                  )}

                  {/* Active Pulse Animation */}
                  {isActive && (
                    <div className="absolute right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateY(-50%) scaleY(0);
          }
          to {
            transform: translateY(-50%) scaleY(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.3s ease-out;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </aside>
  );
}
