"use client";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState(null);
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState(null);

  const MODEL_NAME = "gemini-1.0-pro-001";

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY);
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = await genAI
          .getGenerativeModel({
            model: MODEL_NAME,
          })
          .startChat({
            generationConfig,
            safetySettings,
            history: messages.map((msg) => ({
              text: msg.text,
              role: msg.role,
            })),
          });
        setChat(newChat);
      } catch (error) {
        setError("Failed to initialize chat, please try again");
      }
    };
    initChat();
  }, []);

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: "user",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");
      if (chat) {
        const result = await chat.sendMessage(userInput);
        const botMessage = {
          text: await result.response.text(),
          role: "bot",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      setError("Failed to send message. Please try again");
    }
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const getThemeColors = () => {
    switch (theme) {
      case "light":
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-gray-800",
        };
      case "dark":
        return {
          primary: "bg-gray-900",
          secondary: "bg-gray-800",
          accent: "bg-yellow-500",
          text: "text-gray-100",
        };
      default:
        return {
          primary: "bg-white",
          secondary: "bg-gray-100",
          accent: "bg-blue-500",
          text: "text-gray-800",
        };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const { primary, secondary, accent, text } = getThemeColors();

  return (
    <div className={`flex flex-col h-screen transition-all duration-500 ${primary}`}>
      <header className={`p-4 ${secondary} flex justify-between items-center shadow-md`}>
        <h1 className={`text-3xl font-bold tracking-wide ${text}`}>AIChattt</h1>
        <div className="flex items-center space-x-4">
          <label htmlFor="theme" className={`text-lg ${text}`}>
            Theme
          </label>
          <select
            id="theme"
            value={theme}
            onChange={handleThemeChange}
            className={`p-2 rounded-md border focus:ring-2 focus:ring-${accent}`}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </header>

      
      <main className={`flex-1 overflow-y-auto p-6 ${primary} transition-all duration-500`}>
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex transition-transform duration-300 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${
                  msg.role === "user" ? `${accent} text-white` : `${secondary} ${text}`
                } p-4 rounded-2xl max-w-xs shadow-lg break-words`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs mt-1 opacity-75">{msg.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {error && <div className="text-red-500 text-sm p-4">{error}</div>}

      <footer className={`p-4 ${secondary} shadow-inner flex items-center space-x-4`}>
        <input
          type="text"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className={`flex-1 p-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-${accent} transition-all duration-500`}
          style={{ color: text.includes("text-gray") ? "#000" : "#fff" }}
        />
        <button
          onClick={handleSendMessage}
          className={`p-3 ${accent} text-white rounded-full hover:bg-opacity-80 focus:outline-none transition-all duration-500`}
        >
          Send
        </button>
      </footer>
    </div>
  );
}
