"use client";

import React, { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const Search: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = async (query: string) => {
    if (!query.trim()) return;

    addMessage({ sender: "user", text: query });
    setIsTyping(true);

    try {
      const res = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data: { content: string } = await res.json();
      addMessage({ sender: "bot", text: data.content });
    } catch (err) {
      console.error("Client Error:", err);
      addMessage({
        sender: "bot",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("chat-input") as HTMLInputElement;
    const userMessage = input.value.trim();
    if (userMessage) {
      handleSendMessage(userMessage);
      input.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full h-[560px] bg-[#C599E5]/20 text-black sm:p-4 rounded-xl shadow-md">
      <div className="flex flex-col w-full h-full overflow-hidden bg-white rounded-xl">
        {/* Messages */}
        <div className="flex flex-col h-full overflow-y-auto p-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-sm p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-[#7C3AED] text-white"
                      : "bg-[#F3F4F6] text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 0.8,
              }}
              className="flex items-center"
            >
              <div className="bg-[#F3F4F6] text-gray-800 p-3 rounded-lg">
                Typing...
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center p-4 border-t bg-[#F9FAFB]"
        >
          <input
            name="chat-input"
            type="text"
            placeholder="Generate Suggestions For Resume"
            className="flex-1 px-4 py-2 rounded-l-md border border-gray-300 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 text-sm"
          >
            Send
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default Search;
