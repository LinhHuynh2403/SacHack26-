import { useState, useRef, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { tickets as mockTickets, ChatMessage, manualSteps } from "../data/mockData";
import { sendChatMessage, fetchTicket } from "../api";
import { ArrowLeft, Send, Mic, MicOff, Sparkles, Camera, X, Image } from "lucide-react";
import { motion } from "motion/react";

export function ChatInterface() {
  const { ticketId } = useParams();
  const [searchParams] = useSearchParams();
  const stepId = searchParams.get("step");
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real ticket data from backend
  useEffect(() => {
    async function getTicket() {
      if (!ticketId) return;
      try {
        const data = await fetchTicket(ticketId);
        // Map backend fields to frontend format
        const mappedTicket = {
          id: data.ticket_id,
          stationId: data.station_info.charger_id,
          component: data.prediction_details.failing_component,
          location: data.station_info.location,
          // ... add other fields if needed
        };
        setTicket(mappedTicket);
      } catch (error) {
        console.error("Failed to fetch ticket, falling back to mock:", error);
        const mock = mockTickets.find((t) => t.id === ticketId);
        setTicket(mock);
      } finally {
        setLoading(false);
      }
    }
    getTicket();
  }, [ticketId]);

  useEffect(() => {
    // Initial AI greeting
    if (ticket) {
      let greeting: ChatMessage;

      if (stepId) {
        const steps = manualSteps[ticketId || ""];
        const currentStep = steps?.find((s) => s.id === parseInt(stepId));
        if (currentStep) {
          greeting = {
            id: "1",
            role: "ai",
            content: `I see you need help with Step ${currentStep.id}: ${currentStep.title}. ${currentStep.description}\n\nCan you describe what issue you're encountering? You can also take a photo to show me the problem.`,
            timestamp: new Date().toISOString(),
          };
        } else {
          greeting = {
            id: "1",
            role: "ai",
            content: `Hi Tech, Data Pigeon predicted a ${ticket.component} failure on ${ticket.stationId}. Based on the manual, Step 1 is to locate the pressure valve behind Panel C. Are you ready to begin?`,
            timestamp: new Date().toISOString(),
          };
        }
      } else {
        greeting = {
          id: "1",
          role: "ai",
          content: `Hi Tech, Data Pigeon predicted a ${ticket.component} failure on ${ticket.stationId}. Based on the manual, Step 1 is to locate the pressure valve behind Panel C. Are you ready to begin?`,
          timestamp: new Date().toISOString(),
        };
      }
      setMessages([greeting]);
    }
  }, [ticket, stepId, ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !capturedImage) return;

    // Add user message
    const userMessage: ChatMessage = {
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
      // If there's an image, we append a note to the message so the backend has context (MVP shim)
      const finalMessage = hasImage ? `[Image attached]: ${messageText}` : messageText;

      // Call standard fetch to FastAPI RAG backend
      const response = await sendChatMessage(finalMessage, ticketId || "UNKNOWN");

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response.answer,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error(error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, I am having trouble connecting to the Data Pigeon servers right now.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10 shadow-md">
        <div className="px-4 py-4">
          <Link to={`/ticket/${ticketId}`} className="flex items-center gap-2 mb-3 opacity-90">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Details</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-semibold">AI Assistant</h1>
              <p className="text-sm text-blue-100">
                {ticket.stationId} - {ticket.component}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "ai" && (
              <div className="flex gap-2 max-w-[85%]">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-200">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            )}
            {message.role === "user" && (
              <div className="max-w-[85%]">
                {message.image && (
                  <div className="bg-blue-600 rounded-2xl rounded-tr-sm p-2 shadow-sm mb-1">
                    <img
                      src={message.image}
                      alt="User captured"
                      className="rounded-lg max-w-full h-auto"
                    />
                  </div>
                )}
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                  <p className="leading-relaxed">{message.content}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-200" style={{ maxWidth: '85%' }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
            <h3 className="text-white font-medium">Take Photo</h3>
            <button
              onClick={stopCamera}
              className="text-white p-2 active:scale-95 transition-transform"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 bg-black bg-opacity-50 flex justify-center">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 active:scale-95 transition-transform"
            />
          </div>
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        {isListening && (
          <div className="mb-2 flex items-center justify-center gap-2 text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Listening...</span>
          </div>
        )}

        {capturedImage && (
          <div className="mb-2 relative inline-block">
            <img
              src={capturedImage}
              alt="Captured"
              className="h-20 rounded-lg border-2 border-blue-600"
            />
            <button
              onClick={() => setCapturedImage(null)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gray-100 text-gray-600 rounded-full flex-shrink-0 active:bg-gray-200 transition-all"
          >
            <Camera className="w-5 h-5" />
          </button>
          <button
            onClick={toggleListening}
            className={`p-3 rounded-full flex-shrink-0 transition-all ${isListening
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 active:bg-gray-200"
              }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-3 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type or speak your message..."
              className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() && !capturedImage}
            className="p-3 bg-blue-600 text-white rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Tap camera or mic to use photo/voice input
        </p>
      </div>
    </div>
  );
}