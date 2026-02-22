import { useState, useRef, useEffect } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router";
import { ChatMessage, Ticket, BackendTicket } from "../types";
import { sendChatMessage, fetchTicket, fetchChatHistory } from "../api";
import { mapBackendTicket } from "../mapper";
import {
  ArrowLeft, Send, Mic, MicOff, Camera, X, RefreshCw, ThumbsUp, ThumbsDown
} from "lucide-react";
import { motion } from "motion/react";
import { ErrorState } from "../ErrorHandling/ErrorState";

// Extended interface to handle local feedback state
interface FixityMessage extends ChatMessage {
  feedback?: 'good' | 'bad' | null;
}

export function ChatInterface() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stepId = searchParams.get("step");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<FixityMessage[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'viewing' | 'preview'>('viewing');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!ticketId) return;
    setMessages([]);
    setLoading(true);
    setError(null);

    try {
      const data: BackendTicket = await fetchTicket(ticketId);
      const mappedTicket = mapBackendTicket(data);
      setTicket(mappedTicket);

      const stepIdx = stepId !== null ? parseInt(stepId) : undefined;
      const historyData = await fetchChatHistory(ticketId, stepIdx);

      const greetingMessage: FixityMessage = {
        id: 'greeting-1',
        role: 'assistant',
        content: "Hi, I'm fixity, you AI assistant. How can I help you?",
        timestamp: new Date().toISOString()
      };

      if (historyData.history && historyData.history.length > 0) {
        const mappedMessages: FixityMessage[] = historyData.history.map((m: any, idx: number) => ({
          id: `history-${idx}`,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }));
        setMessages([greetingMessage, ...mappedMessages]);
      } else {
        setMessages([greetingMessage]);
      }
    } catch (err: any) {
      console.error("Failed to fetch ticket or history:", err);
      setError("The AI Copilot is currently offline. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ticketId, stepId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Web Speech API setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startCamera = async () => {
    try {
      // FACING_MODE environment ensures rear camera on phones
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
        setCameraMode('viewing');
      }
    } catch (error) {
      alert("Camera Error: Ensure you are using HTTPS (e.g., via Ngrok) to access the camera on mobile.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvas.toDataURL("image/jpeg"));
      setCameraMode('preview');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setShowCamera(false);
    setCapturedImage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCapturedImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !capturedImage) return;

    const userMessage: FixityMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input || "📷 [Photo attached]",
      timestamp: new Date().toISOString(),
      image: capturedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const hasImage = !!capturedImage;
    const messageText = input;
    setInput("");
    setCapturedImage(null);
    setIsTyping(true);

    try {
      const finalMessage = hasImage ? `[Image attached]: ${messageText}` : messageText;
      const stepIdx = stepId !== null ? parseInt(stepId) : undefined;
      const response = await sendChatMessage(finalMessage, ticketId || "UNKNOWN", stepIdx);

      const aiResponse: FixityMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error(error);
      const errorResponse: FixityMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I am having trouble connecting to the network right now.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = (messageId: string, type: 'good' | 'bad') => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, feedback: type } : msg
    ));
    console.log(`Feedback registered for ${messageId}: ${type}`);
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#D9EDFD] to-[#FFF28B]/80">
        <RefreshCw className="w-10 h-10 text-gray-800 animate-spin mb-4" />
        <p className="text-gray-800 font-medium">Connecting to fixity...</p>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="min-h-screen bg-[#D9EDFD] p-4 pt-12 text-center flex flex-col items-center justify-center">
        <ErrorState title="Connection Error" message={error} onRetry={loadData} />
      </div>
    );
  }

  // Condition: Only show feedback if there are at least 3 messages (Greeting + User + AI), 
  // the AI isn't typing, and the very last message is from the assistant.
  const lastMessage = messages[messages.length - 1];
  const showFeedback = messages.length >= 3 && !isTyping && lastMessage?.role === "assistant";

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#D9EDFD] from-[7%] to-[#FFF28B]/80 relative">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="active:scale-95 transition-transform p-1">
          <ArrowLeft className="w-6 h-6 text-[#1E1E1E]" />
        </button>

        {/* Fixity Logo styling */}
        <div className="text-[20px] font-bold text-black tracking-tight flex items-center">
          fixit<span className="text-[#EED300] ml-[1px]">y</span>
        </div>

        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-6 scroll-smooth">
        {messages.map((message) => {
          const isAI = message.role === "assistant";

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col w-full ${isAI ? "items-start" : "items-end"}`}
            >
              <div
                className={`max-w-[85%] px-5 py-4 shadow-[0px_0px_10px_rgba(0,0,0,0.05)] ${isAI
                  ? "bg-white/50 backdrop-blur-sm rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px]"
                  : "bg-white rounded-tl-[20px] rounded-br-[20px] rounded-bl-[20px]"
                  }`}
              >
                {message.image && (
                  <img src={message.image} alt="User captured" className="rounded-lg mb-2 max-w-full h-auto" />
                )}
                <p className={`text-[13px] leading-relaxed whitespace-pre-line ${isAI ? "text-[#1E1E1E]" : "text-black"}`}>
                  {message.content}
                </p>
              </div>
            </motion.div>
          );
        })}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
            <div className="bg-white/50 backdrop-blur-sm rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] px-5 py-4 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Extra padding at the bottom so the last message isn't hidden by the feedback buttons */}
        <div ref={messagesEndRef} className="h-64" />
      </div>

      {/* Floating Feedback Buttons (Only shown after user prompts and AI replies) */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-[110px] w-full max-w-[430px] flex justify-center gap-12 z-30 pointer-events-none"
        >
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleFeedback(lastMessage.id, 'good')}
            className="flex flex-col items-center gap-2 transition-transform pointer-events-auto"
          >
            <motion.div
              animate={lastMessage.feedback === 'good' ? { scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] } : {}}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`w-[55px] h-[55px] rounded-full flex items-center justify-center shadow-[0px_0px_15px_rgba(0,0,0,0.08)] ${lastMessage.feedback === 'good' ? 'bg-green-100 text-green-700' : 'bg-white text-[#49454F]'}`}
            >
              <ThumbsUp className="w-6 h-6" strokeWidth={2} />
            </motion.div>
            <span className="text-[12px] text-black font-medium">Good Response</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleFeedback(lastMessage.id, 'bad')}
            className="flex flex-col items-center gap-2 transition-transform pointer-events-auto"
          >
            <motion.div
              animate={lastMessage.feedback === 'bad' ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`w-[55px] h-[55px] rounded-full flex items-center justify-center shadow-[0px_0px_15px_rgba(0,0,0,0.08)] ${lastMessage.feedback === 'bad' ? 'bg-red-100 text-red-700' : 'bg-white text-[#49454F]'}`}
            >
              <ThumbsDown className="w-6 h-6" strokeWidth={2} />
            </motion.div>
            <span className="text-[12px] text-black font-medium">Bad Response</span>
          </motion.button>
        </motion.div>
      )}

      {/* Floating Input Area */}
      <div className="fixed bottom-0 w-full max-w-[430px] pb-8 pt-4 px-4 flex items-center gap-3 z-40 bg-gradient-to-t from-[#FFF28B] to-transparent">
        <div className="flex-1 bg-white rounded-full shadow-[0px_0px_20px_rgba(0,0,0,0.10)] h-[55px] flex items-center px-4 gap-2">

          <button onClick={toggleListening} className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-50' : 'text-[#49454F]'}`}>
            {isListening ? <MicOff className="w-[20px] h-[20px]" /> : <Mic className="w-[20px] h-[20px]" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            className="flex-1 bg-transparent outline-none text-[#1E1E1E] text-[14px] placeholder-gray-400"
          />

          {input.trim() && (
            <button onClick={handleSend} className="p-2 text-blue-600 active:scale-95 transition-transform">
              <Send className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>

        <button
          onClick={startCamera}
          className="w-[55px] h-[55px] bg-white rounded-full shadow-[0px_0px_20px_rgba(0,0,0,0.10)] flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform text-[#49454F]"
        >
          <Camera className="w-[20px] h-[20px]" />
        </button>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 absolute top-0 w-full z-10">
            <h3 className="text-white font-medium">Take Photo</h3>
            <button onClick={stopCamera} className="text-white p-2">
              <X className="w-6 h-6" />
            </button>
          </div>
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-10 w-full flex justify-center">
            <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-gray-300" />
          </div>
        </div>
      )}

      {/* Hidden inputs */}
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
    </div>
  );
}