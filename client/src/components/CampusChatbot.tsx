import { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function CampusChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi! I'm Campus AI. I can help you with hall tickets, exams, seating, events, and study support. How can I assist you today?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function sendMessage() {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    role: "student"
                })
            });

            const data = await res.json();

            setMessages(prev => [
                ...prev,
                { role: "assistant", content: data.reply }
            ]);
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "I can help with hall tickets, exams, seating, events, and study support. How can I assist you today?"
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-2xl flex items-center justify-center hover:shadow-purple-500/50 transition-shadow"
                        aria-label="Open Campus AI Chat"
                    >
                        <Sparkles className="w-7 h-7" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-6 right-6 z-50 w-96 h-[600px] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl bg-slate-900/90 border border-slate-700/50"
                        style={{
                            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))"
                        }}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            Campus AI
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        </h3>
                                        <p className="text-xs text-slate-400">Always here to help</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800/50 rounded-lg"
                                    aria-label="Close chat"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="h-[calc(600px-140px)] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${msg.role === "user"
                                                ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-sm"
                                                : "bg-slate-800/50 backdrop-blur-sm text-slate-100 border border-slate-700/50 rounded-bl-sm"
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-3 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about exams, hall tickets..."
                                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading}
                                    className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                    aria-label="Send message"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Powered by Gemini AI
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
