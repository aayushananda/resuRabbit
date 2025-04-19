"use client";

import React, { useState, FormEvent } from "react";

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
    const input = (e.currentTarget.elements.namedItem("chat-input") as HTMLInputElement);
    const userMessage = input.value.trim();
    if (userMessage) {
      handleSendMessage(userMessage);
      input.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full sm:w-screen h-[560px] bg-transparent text-white sm:p-3">
      <div className="flex flex-col w-full md:w-2/3 lg:w-full bg-transparent rounded-lg h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <img
                  src="/Logo.png"
                  alt="Bot"
                  className="w-8 h-8 rounded-full mr-3"
                />
              )}
              <div
                className={`max-w-xs md:max-w-sm p-3 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && (
                <img
                  src="/Profile.png"
                  alt="User"
                  className="w-8 h-8 rounded-full ml-3"
                />
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center">
              <img
                src="/Logo.png"
                alt="Bot"
                className="w-8 h-8 rounded-full mr-3"
              />
              <div className="bg-gray-700 text-gray-300 p-3 rounded-lg">
                Typing...
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center p-4 bg-gray-900 rounded-2xl"
        >
          <input
            name="chat-input"
            type="text"
            placeholder="Generate Suggestions For Resume"
            className="flex-1 px-2 sm:px-4 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Search;