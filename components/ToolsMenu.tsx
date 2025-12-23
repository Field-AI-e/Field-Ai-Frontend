"use client";

import { ETools, ITool, tools } from "@/types";
import { X, Mic, FileUp, Sparkles, ShieldCheck, Ticket, Search, BookOpen } from "lucide-react";



export function ToolsMenu({ onClose, onPick }:{
  onClose: ()=>void; 
  onPick: (tool: ITool)=>void;
}) {
  // Calculate position to keep menu within viewport
  const menuWidth = 420;
  const menuHeight = 300; // Approximate height
  const padding = 20;
  


  return (
    <div className="absolute inset-0 bg-black/20  bg-[#212121]" onClick={onClose}>
      <div
        className="absolute w-[30vh] bg-[#212121] rounded-2xl shadow-xl border p-3"
        style={{
          left: `${4}vh`,
          bottom: `${7}vh`,
        }}
        onClick={(e)=>e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-2 py-1">
          <div className="text-sm font-medium text-white">Tools</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#303030]"><X size={16}/></button>
        </div>
        <div className="grid grid-cols-1 gap-2 p-2">
          {tools.map(T => (
            <button
              key={T.id}
              onClick={() => onPick(T)}
              className="flex items-start gap-3 text-left p-3  rounded-lg hover:bg-[#303030] "
            >
              <T.icon className="mt-0.5 text-white" size={18} />
              <div>
                <div className="text-sm font-medium text-white  ">{T.label}</div>
                <div className="text-sm font-small text-gray  ">{T.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
