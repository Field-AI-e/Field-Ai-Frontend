import { Plus, Send, X, Sparkles, Box, Play, Loader2 } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ToolsMenu } from './ToolsMenu';
import { useEffect, useRef, useState } from 'react';
import { ITool, MessageAttachment } from '@/types';
import { useSocket } from '@/context/SocketContext';

interface InputBarProps {
  text: string;
  setText: (text: string) => void;
  onSend: (tool?: ITool | null, query?: string) => void;
  isBusy: boolean;
  attachedFiles: MessageAttachment[];
  isUploading: boolean;
  onRemoveFile: (index: number) => void;
  onClearAllFiles: () => void;
  selectedTool: ITool | null;
  onToolSelected?: (tool: ITool | null) => void;
  isRecordingDisabled?: boolean;
  onImageSelect?: (file: File) => void;
}

export const InputBar = ({
  text,
  setText,
  onSend,
  isBusy,
  attachedFiles,
  isUploading,
  onRemoveFile,
  onClearAllFiles,
  selectedTool,
  onToolSelected,
  isRecordingDisabled = false,
  onImageSelect,
}: InputBarProps) => {
  const [toolBarOpen, setToolBarOpen] = useState(false);
  const { socket } = useSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);




  const [partial, setPartial] = useState("");
  const [finalText, setFinalText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [recording, setRecording] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const transcriptRef = useRef<string>("");

  // MIC visualizer
  const micAudioCtxRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micDataRef = useRef<Uint8Array | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const micAnimRef = useRef<number | null>(null);
  const aiAnimRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // AI response visualizer
  const responseCtxRef = useRef<AudioContext | null>(null);
  const responseAnalyserRef = useRef<AnalyserNode | null>(null);
  const responseDataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handlePartial = (text: string) => {
      setPartial((prev) => {
        const newPartial = prev + text;
        // Update ref with current accumulated transcript
        transcriptRef.current = transcriptRef.current + text;
        return newPartial;
      });
    };

    const handleFinal = (text: string) => {
      setFinalText((prev) => {
        const newFinal = prev + (prev ? " " : "") + text;
        // Update ref with current accumulated transcript
        transcriptRef.current = transcriptRef.current + (transcriptRef.current ? " " : "") + text;
        return newFinal;
      });
    };

    socket.on("partial", handlePartial);
    socket.on("final", handleFinal);

    return () => {
      socket.off("partial", handlePartial);
      socket.off("final", handleFinal);
    };
  }, [socket]);

  const handleToolPick = (tool: ITool) => {
    setToolBarOpen(false);
    onToolSelected?.(tool);
  };

  const handleToolClear = () => {
    onToolSelected?.(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const hasText = Boolean(text.trim());
      if ((hasText || selectedTool) && !isBusy) {
        onSend(selectedTool);
      }
    }
  };

  function startVisualizer(
    analyser: AnalyserNode,
    dataArray: Uint8Array,
    target: "mic" | "ai"
  ) {
    const bars = document.querySelectorAll(
      target === "mic" ? ".mic-bar" : ".ai-bar"
    ) as NodeListOf<HTMLElement>;

    function tick() {
      const animId = requestAnimationFrame(tick);

      // store anim loop so we can cancel it later
      if (target === "mic") micAnimRef.current = animId;
      else aiAnimRef.current = animId;

      analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);

      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const norm = avg / 255;

      bars.forEach((bar, i) => {
        const h = 6 + norm * (14 + Math.sin(i + Date.now() / 200) * 6);
        bar.style.height = `${Math.min(h, 20)}px`;
      });
    }

    tick();
  }

  async function startAudio() {
    // Don't start recording if audio is playing or response is loading
    if (isRecordingDisabled) {
      console.log("Recording disabled: audio is playing or response is loading");
      return;
    }

    // Reset transcript state when starting new recording
    setPartial("");
    setFinalText("");
    transcriptRef.current = "";

    console.log("start-audio");
    setIsInitializing(true);
    socket?.emit("start-audio");
    
    const handleInitializationComplete = (data: any) => {
      console.log("initialization-complete", data);
      setIsInitializing(false);
      handleStartRecording();
      socket?.off("initialization-complete", handleInitializationComplete);
    };

    const handlePause = (data: any) => {
      console.log("pause", data);
      const transcript = data?.transcript || transcriptRef.current || finalText || partial;
      console.log("transcript", transcript);
      if (transcript && transcript.trim()) {
        onSend(selectedTool, transcript.trim());
        stopRecording();
      }
      socket?.off("pause", handlePause);
    };

    socket?.on("initialization-complete", handleInitializationComplete);
    socket?.on("pause", handlePause);
  }
  async function handleStartRecording() {
    // socket?.emit("handle-request");
    setRecording(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = stream;

    // Setup mic analyser
    micAudioCtxRef.current = new AudioContext({ sampleRate: 16000 });
    micAnalyserRef.current = micAudioCtxRef.current.createAnalyser();
    micAnalyserRef.current.fftSize = 256;
    const buffer = new ArrayBuffer(micAnalyserRef.current.frequencyBinCount);
    micDataRef.current = new Uint8Array(buffer);

    micSourceRef.current =
      micAudioCtxRef.current.createMediaStreamSource(stream);

    // Connect mic to analyser
    micSourceRef.current.connect(micAnalyserRef.current);

    // Begin mic visualizer
    startVisualizer(micAnalyserRef.current, micDataRef.current, "mic");

    // Send mic audio to server
    await micAudioCtxRef.current.audioWorklet.addModule(
      "/worklets/audio-processor.js"
    );

    const workletNode = new AudioWorkletNode(
      micAudioCtxRef.current,
      "audio-processor"
    );

    workletNode.port.onmessage = (e) => {
      socket?.emit("audio", e.data);
    };

    micSourceRef.current.connect(workletNode);
  }

  function stopRecording() {
    setRecording(false);
    setIsInitializing(false);

    // Clean up socket event listeners
    socket?.off("pause");
    socket?.off("initialization-complete");

    // 🔥 Stop mic visualizer
    if (micAnimRef.current !== null) {
      cancelAnimationFrame(micAnimRef.current);
      micAnimRef.current = null;
    }
    micStreamRef.current?.getTracks().forEach(track => track.stop());
    micStreamRef.current = null;
    // Reset bars to default height
    const micBars = document.querySelectorAll(".mic-bar") as NodeListOf<HTMLElement>;
    micBars.forEach(bar => (bar.style.height = "8px"));

    // Stop audio context
    micAudioCtxRef.current?.close();
    micAudioCtxRef.current = null;
    socket?.emit("close-audio");
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 pb-6 px-6 z-50 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">

        <div
          className={`flex flex-col bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-visible transition-all duration-300 shadow-2xl ${attachedFiles.length > 0 ? 'py-3' : text.split('\n').length > 1 ? 'h-auto min-h-[60px]' : 'h-14'
            }`}
        >
          {/* File Upload Section */}
          {attachedFiles.length > 0 && (
            <div className="px-3 pb-2 border-b border-white/10">
              <FileUpload
                attachedFiles={attachedFiles}
                isUploading={isUploading}
                onRemoveFile={onRemoveFile}
                onClearAllFiles={onClearAllFiles}
              />
            </div>
          )}

          <div className={`flex items-center gap-2 relative ${attachedFiles.length > 0 ? 'pt-2' : ''}`}>
            {/* Add/Tool Button */}
            <div className="relative ml-3">
              {!selectedTool ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onImageSelect) {
                        onImageSelect(file);
                      }
                      // Reset input so same file can be selected again
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={() => {
                      if (onImageSelect) {
                        fileInputRef.current?.click();
                      } else {
                        setToolBarOpen(!toolBarOpen);
                      }
                    }}
                    className="p-2.5 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 flex-shrink-0 group border border-white/10 hover:scale-110 hover:shadow-lg"
                    aria-label="Add image or choose tool"
                  >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </>
              ) : (
                <div className="animate-fadeIn">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-xl group hover:shadow-lg transition-all duration-300">
                    <button
                      onClick={handleToolClear}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                      aria-label="Clear selected tool"
                    >
                      <X size={16} className="text-gray-300 hover:text-white" />
                    </button>
                    <selectedTool.icon className="text-purple-400" size={18} />
                    <div className="text-sm font-semibold text-white flex items-center gap-1">
                      {selectedTool.label}
                      <Sparkles size={12} className="text-purple-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tools Menu - Positioned above button */}
              {toolBarOpen && (
                <div className="absolute bottom-full left-0 mb-2 animate-slideUp z-50">
                  <ToolsMenu
                    onClose={() => setToolBarOpen(false)}
                    onPick={handleToolPick}
                  />
                </div>
              )}
            </div>

            {/* Textarea Input */}
              <div className="flex-1 relative px-2">
                <textarea
                  value={recording ? partial : text}
                  onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="w-full bg-transparent text-white placeholder-gray-400 border-none outline-none py-3.5 text-sm resize-none overflow-hidden"
                style={{ height: 'auto', minHeight: '24px' }}
                rows={1}
              />
            </div>

            {/* Send Button */}
            <div className="pr-3 flex items-center gap-2">
              {(isInitializing || recording) && (
                <button
                  onClick={() => {
                    stopRecording();
                    setIsInitializing(false);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full h-10 overflow-hidden hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium flex items-center">Initializing</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-0.5 h-6" style={{ maxHeight: '24px' }}>
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="mic-bar w-1 bg-white rounded"
                            style={{ height: "6px", maxHeight: "20px" }}
                          ></div>
                        ))}
                      </div>
                      <span className="text-sm font-medium flex items-center">End</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => {
                  if (recording) {
                    // Send the transcript when recording
                    const transcript = transcriptRef.current || (finalText + " " + partial).trim() || partial.trim();
                    if (transcript) {
                      onSend(selectedTool, transcript.trim());
                      stopRecording();
                      // Reset transcript state after sending
                      setPartial("");
                      setFinalText("");
                      transcriptRef.current = "";
                    }
                  } else if (text.trim() || selectedTool) {
                    // Send text message when there's text or a tool selected
                    onSend(selectedTool);
                  } else {
                    // Start voice recording when no text
                    startAudio();
                  }
                }}
                disabled={isRecordingDisabled && !recording && !text.trim() && !selectedTool}
                className={`w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all duration-300
                  ${!isRecordingDisabled || recording || text.trim() || selectedTool
                    ? 'hover:scale-110 shadow-lg hover:shadow-xl cursor-pointer'
                    : 'bg-gray-700/50 cursor-not-allowed opacity-50'
                  }`}
                aria-label={recording || text.trim() || selectedTool ? "Send message" : "Start recording"}
              >
                {recording || text.trim() || selectedTool ? (
                  <Send className="w-5 h-5 text-black" />
                ) : (
                  /* Audio Waveform Icon */
                  <div className="flex items-end gap-0.5 h-4">
                    <div className="w-0.5 bg-black rounded" style={{ height: '8px' }}></div>
                    <div className="w-0.5 bg-black rounded" style={{ height: '12px' }}></div>
                    <div className="w-0.5 bg-black rounded" style={{ height: '6px' }}></div>
                    <div className="w-0.5 bg-black rounded" style={{ height: '10px' }}></div>
                    <div className="w-0.5 bg-black rounded" style={{ height: '6px' }}></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Character Count or Hint */}
        {text.length > 0 && (
          <div className="mt-2 text-center text-xs text-gray-500 animate-fadeIn">
            Press Enter to send, Shift+Enter for new line
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        /* Custom Scrollbar for Textarea */
        textarea::-webkit-scrollbar {
          width: 4px;
        }

        textarea::-webkit-scrollbar-track {
          background: transparent;
        }

        textarea::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};
