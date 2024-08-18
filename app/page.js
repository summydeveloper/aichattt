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

  const SYSTEM_PROMPT = `
    You are an AI assistant for RecFoodAI, a platform dedicated to recommending low-budget, healthy meals for Nigerian university students. Your goal is to provide meal suggestions that are nutritious, affordable, and tailored to the preferences and dietary needs of students.

    When interacting with users, keep the following guidelines in mind:
    1. **Cultural Relevance:** Suggest meals that are familiar and culturally appropriate for Nigerian students. Include local ingredients and traditional dishes where possible.
    2. **Affordability:** Prioritize meal options that are budget-friendly, considering the typical financial constraints of students.
    3. **Nutritional Value:** Ensure the meal suggestions are balanced and provide essential nutrients. Avoid overly processed foods and focus on whole, nutritious ingredients.
    4. **Simplicity:** Provide recipes that are easy to prepare, with minimal ingredients and steps. Keep in mind the limited cooking equipment and time that students might have.
    5. **Variety:** Offer a range of meal options to cater to different dietary preferences, including vegetarian and non-vegetarian options.

    For each user interaction:
    - Ask clarifying questions if the user’s request is vague.
    - Provide clear and concise recipe instructions.
    - Suggest alternatives or substitutions for ingredients when necessary.
    - Offer tips for making the meal preparation easier or more affordable.

    Example Response:
    1. **User Request:** "I need a cheap and healthy dinner idea."
    2. **Example Response:** "How about trying a Nigerian-style vegetable soup with yam? It’s affordable, nutritious, and packed with vitamins. You’ll need yam, spinach, tomatoes, onions, and a bit of oil. Boil the yam, then blend the vegetables to make a rich soup. Serve it hot for a satisfying meal."

    Remember, your aim is to be a helpful and resourceful assistant, ensuring that students can easily find healthy and affordable meal options that fit their lifestyle and preferences.
  `;

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
      const systemPromptMessage = {
        text: SYSTEM_PROMPT,
        role: "system",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");

      if (chat) {
        const result = await chat.sendMessage(`${SYSTEM_PROMPT}\n${userInput}`);
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
    <div className={`flex flex-col h-screen ${primary}`}>
      <header className={`p-4 ${secondary} flex justify-between items-center shadow-md`}>
        <h1 className={`text-3xl font-semibold ${text}`}>RecFoodAI</h1>
        <div className="flex items-center space-x-4">
          <label htmlFor="theme" className={`text-lg ${text}`}>
            Theme
          </label>
          <select
            id="theme"
            value={theme}
            onChange={handleThemeChange}
            className={`p-2 rounded-md border ${text}`}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </header>

      <main className={`flex-1 overflow-y-auto p-6 ${primary}`}>
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${
                  msg.role === "user" ? `${accent} text-white` : `${secondary} ${text}`
                } p-4 rounded-lg max-w-xs shadow-lg`}
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
          className={`flex-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-${accent}`}
          style={{ color: text.includes("text-gray") ? "#000" : "#fff" }}
        />
        <button
          onClick={handleSendMessage}
          className={`p-3 ${accent} text-white rounded-lg hover:bg-opacity-80 focus:outline-none`}
        >
          Send
        </button>
      </footer>
    </div>
  );
}
