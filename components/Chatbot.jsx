"use client";
import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Halo 👋 Ada yang bisa dibantu soal makanan atau fitness?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();

      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Terjadi kesalahan." }]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Bubble */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#20c997,#247ba0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 28,
          cursor: "pointer",
          boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
          zIndex: 9999,
          transition: "all .3s ease",
        }}
      >
        💬
      </div>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 110,
            right: 28,
            width: 360,
            height: 520,
            borderRadius: 24,
            overflow: "hidden",
            backdropFilter: "blur(16px)",
            background: "rgba(255,255,255,0.75)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
            animation: "fadeUp .25s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg,#20c997,#247ba0)",
              color: "white",
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 15,
            }}
          >
            <div>
              Asisten SimpleFit
              <div style={{ fontSize: 11, opacity: 0.85 }}>Online • Siap bantu</div>
            </div>
            <span style={{ cursor: "pointer" }} onClick={() => setOpen(false)}>✕</span>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              background: "transparent",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: 18,
                    fontSize: 14,
                    lineHeight: 1.4,
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg,#247ba0,#1a5a7a)"
                        : "white",
                    color: msg.role === "user" ? "white" : "#1e293b",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ fontSize: 12, color: "#64748b" }}>
                AI sedang mengetik...
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              padding: 12,
              borderTop: "1px solid #e2e8f0",
              background: "rgba(255,255,255,0.9)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Tanya soal makanan / fitness..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 14,
                padding: "10px 12px",
                borderRadius: 12,
                background: "#f1f5f9",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: 8,
                border: "none",
                borderRadius: 12,
                padding: "0 16px",
                background: "#247ba0",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Kirim
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
