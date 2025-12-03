import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Send, LogOut, Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutAsync } from "../../store/Auth/authSlice";

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL || "http://localhost:3000";

const formatTime = (ts) => {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ChatPage = () => {
  const { userId, isAuthenticated, token , username} = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log(username);

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) navigate("/");
  }, [isAuthenticated, userId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(SOCKET_SERVER_URL, {
      auth: { token },
    });

    const socket = socketRef.current;

    socket.on("connect", () => setIsConnected(true));

    socket.on("online users", (list) => setOnlineUsers(list));

    socket.on("public message", (msg) => {
      setMessages((prev) => [
        ...prev,
        { ...msg, isMine: msg.senderId === userId },
      ]);
    });

    socket.on("disconnect", () => setIsConnected(false));

    return () => socket.disconnect();
  }, [isAuthenticated]);

  useEffect(() => scrollToBottom(), [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || !isConnected) return;

    const msg = {
      text,
      senderId: userId,
      timestamp: Date.now(),
    };

    socketRef.current.emit("public message", msg);
    setMessages((prev) => [...prev, { ...msg, isMine: true }]);
    setInputValue("");
  };

  const logout = () => {
    dispatch(logoutAsync());
    socketRef.current?.disconnect();
    navigate("/");
  };

  if (!isAuthenticated)
    return <div className="text-center p-20">Redirecting…</div>;

  return (
    <div className="min-h-screen bg-[#e8ebf0] flex flex-col font-sans">
      {/* HEADER - Telegram Style */}
      <header className="bg-white shadow-sm py-3 px-5 flex justify-between items-center border-b">
        <h1 className="text-xl font-semibold text-[#2a70e0] flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" /> Chat
        </h1>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          <LogOut className="inline-block mr-1 w-4 h-4" /> Logout
        </button>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* CHAT SECTION */}
        <div className="flex flex-col flex-grow bg-[#f4f7fb] relative">
          <ul className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
            {messages.map((m, i) => (
              <li
                key={i}
                className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl shadow-md relative ${
                    m.isMine
                      ? "bg-[#2a70e0] text-white rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none"
                  }`}
                >
                  {!m.isMine && (
                    <p className="text-xs font-bold opacity-80 mb-1">
                      {m.username}
                    </p>
                  )}

                  <p className="leading-snug whitespace-pre-line">{m.text}</p>

                  {/* Timestamp */}
                  <p
                    className={`text-[10px] mt-1 flex items-center gap-1 opacity-70 ${
                      m.isMine ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(m.timestamp)}
                  </p>
                </div>
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>

          {/* INPUT AREA */}
          <form
            onSubmit={sendMessage}
            className="p-4 bg-white flex items-center gap-3 border-t shadow-sm"
          >
            <input
              type="text"
              placeholder="Message..."
              className="flex-grow px-4 py-2 bg-gray-100 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#2a70e0] outline-none"
              disabled={!isConnected}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <button
              type="submit"
              disabled={!isConnected || !inputValue.trim()}
              className="bg-[#2a70e0] p-3 rounded-full text-white hover:bg-[#1f5ac1] transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* SIDEBAR ONLINE USERS */}
        <aside className="w-64 bg-white border-l p-4 hidden md:block">
          <h3 className="text-lg font-bold flex items-center text-[#2a70e0]">
            <Users className="w-5 h-5 mr-2" /> Online ({onlineUsers.length})
          </h3>

          <ul className="mt-4 space-y-2">
            {onlineUsers.map((u) => (
              <li
                key={u.id}
                className={`p-2 rounded-md text-sm font-medium shadow-sm ${
                  u.id === userId
                    ? "bg-[#d8e7ff] text-[#2a70e0]"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {u.username}
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
};

export default ChatPage;
