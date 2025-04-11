import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [explanation, setExplanation] = useState("");
  const [debuggingResults, setDebuggingResults] = useState("");
  const [simplification, setSimplification] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugging, setDebugging] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ✅ Backend URL from .env file
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const apiCall = async (endpoint, dataSetter, errorMsg) => {
    setLoading(true);
    try {
      const res = await axios.post("https://ai-code-explainer-backend.onrender.com/explain", {
        code,
        language,
      });
      dataSetter(res.data[Object.keys(res.data)[0]]);
    } catch {
      dataSetter(errorMsg);
    }
    setLoading(false);
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return alert("Speech not supported.");
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(speech);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const MarkdownBlock = ({ title, content, bg = "light", text = "dark" }) =>
    content && (
      <motion.div
        className={`mt-4 text-start bg-${bg} text-${text} p-3 rounded`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>{title}</h2>
        <ReactMarkdown
          components={{
            code({ inline, className, children, ...props }) {
              return !inline ? (
                <SyntaxHighlighter style={materialDark} language={language} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>{children}</code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </motion.div>
    );

  return (
    <motion.div className="container text-center mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <motion.h1 className="mb-4" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
        💡 AI Code Explainer & Debugger 🛠️
      </motion.h1>

      {/* Language Selector */}
      <div className="mb-3">
        <label className="form-label fw-bold">Select Language:</label>
        <select className="form-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value=".c">C</option>
        </select>
      </div>

      {/* Code Input */}
      <textarea
        rows="6"
        className="form-control"
        placeholder="Enter your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ fontSize: "16px" }}
      />

      {/* Buttons */}
      <div className="mt-3 d-flex flex-wrap justify-content-center gap-2">
        <motion.button className="btn btn-primary" onClick={() => apiCall("explain", setExplanation, "Error fetching explanation.")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          🚀 Explain Code
        </motion.button>

        <motion.button className="btn btn-warning" onClick={() => apiCall("debug", setDebuggingResults, "Error analyzing code.")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          🛠 Debug Code
        </motion.button>

        <motion.button className="btn btn-info" onClick={() => apiCall("simplify", setSimplification, "Error simplifying code.")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          🔄 Simplify Code
        </motion.button>

        {explanation && !isSpeaking && (
          <motion.button className="btn btn-success" onClick={() => speakText(explanation)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            🎤 Play Explanation
          </motion.button>
        )}

        {isSpeaking && (
          <motion.button className="btn btn-danger" onClick={stopSpeech} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            ⏹ Stop
          </motion.button>
        )}
      </div>

      {/* Spinner */}
      {loading && (
        <motion.div className="spinner-border text-primary mt-3" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} />
      )}

      {/* Result Blocks */}
      <MarkdownBlock title="📝 Explanation:" content={explanation} />
      <MarkdownBlock title="🐞 Debugging Report:" content={debuggingResults} bg="warning" text="dark" />
      <MarkdownBlock title="🧠 Simplified Code & Explanation:" content={simplification} bg="info" text="white" />
    </motion.div>
  );
}

export default App;
