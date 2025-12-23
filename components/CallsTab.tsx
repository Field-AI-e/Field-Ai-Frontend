"use client";

import { useState, useEffect } from 'react';
import { Edit3, Check, X, ChevronDown, Volume2 } from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import ReactMarkdown from 'react-markdown';

interface AudioFile {
  id: string;
  path: string;
  transcript: string;
  summary: string;
  classification: string;
  sentiment: string;
  severity: string;
  resolved: boolean;
  createdAt: string;
}

interface CallsTabProps {
  calls: AudioFile[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function CallsTab({ calls, loading, error, onRefresh }: CallsTabProps) {
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newClassification, setNewClassification] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const classifications = [
    { value: 'all', label: 'All Calls', count: calls.length },
    { value: 'complaint', label: 'Complaints', count: calls.filter(call => call.classification === 'complaint').length },
    { value: 'compliment', label: 'Compliments', count: calls.filter(call => call.classification === 'compliment').length },
    { value: 'uncategorised', label: 'Uncategorized', count: calls.filter(call => !call.classification || call.classification === 'uncategorised').length },
  ];

  const filteredCalls = selectedClassification === 'all' 
    ? calls 
    : calls.filter(call => call.classification === selectedClassification);

  const handleUpdateClassification = async (id: string, classification: string) => {
    try {
      await apiClient.put(`/speech/audio/${id}/classification`, { classification });
      onRefresh();
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update classification:', error);
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'complaint':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'compliment':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'uncategorised':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'text-green-600';
      case 'NEGATIVE':
        return 'text-red-600';
      case 'NEUTRAL':
        return 'text-gray-600';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading calls...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Classification Filter */}
      <div className="flex gap-3 flex-wrap">
  {classifications.map((classification) => (
    <button
      key={classification.value}
      onClick={() => setSelectedClassification(classification.value)}
      className={`
        cursor-pointer
        relative px-5 py-2.5 rounded-xl text-base font-semibold transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-400
        ${selectedClassification === classification.value
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105 ring-2 ring-blue-400'
          : 'bg-white/5 backdrop-blur-xl text-gray-300 hover:text-white hover:bg-blue-700/20 shadow border border-white/10 hover:scale-105'}
        group
      `}
    >
      {/* Glow effect for active */}
      {selectedClassification === classification.value && (
        <span className="absolute inset-0 rounded-xl bg-blue-600 opacity-20 animate-pulse pointer-events-none"></span>
      )}
      <span className="relative z-10">
        {classification.label}
        <span className={`
          ml-2 px-2 py-0.5 text-xs font-bold rounded-full
          ${selectedClassification === classification.value
            ? 'bg-white/20 text-white'
            : 'bg-white/10 text-blue-400 group-hover:bg-white/20 group-hover:text-white'}
        `}>
          {classification.count}
        </span>
      </span>
    </button>
  ))}
</div>


      {/* Calls List - Accordion Style */}
    <div
  className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-gradient-to-br from-[#232336]/70 to-[#181825]/80 backdrop-blur-xl"
>
  {filteredCalls.length === 0 ? (
    <div className="text-center text-gray-400 py-12 text-lg font-semibold tracking-wide select-none">
      <span className="inline-flex items-center gap-2">
        <Volume2 className="text-blue-500" size={20} />
        No calls found for the selected classification.
      </span>
    </div>
  ) : (
    filteredCalls.map((call, index) => (
      <div key={call.id} className={`relative border-b border-white/10 last:border-b-0`}>
        {/* Accordion Header */}
        <div
          className={`
            flex items-center justify-between pl-5 pr-4 py-4 bg-white/5 hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-blue-700/10 transition-all duration-200
            cursor-pointer group
          `}
          onClick={() => setExpandedId(expandedId === call.id ? null : call.id)}
        >
          <div className="flex items-center gap-4 flex-1">
            {/* Checkbox */}
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-blue-400 bg-[#232336] rounded-lg focus:ring-blue-500 focus:ring-2 shadow"
              checked={false}
              onChange={() => {}}
            />

            {/* Main Content */}
            <div className="flex-1">
              {/* Title */}
              <div className="flex items-center gap-3 mb-1">
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${getClassificationColor(call.classification)} bg-opacity-90 uppercase tracking-wide`}>
                  [{call.classification || 'Uncategorised'}]
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-blue-300 mb-2 font-mono tracking-tight">
                <Volume2 size={14} className="text-blue-400" />
                <span>Call</span>
                <span className="opacity-30">•</span>
                <span className="font-semibold text-gray-400">{call.id.substring(0, 8)}</span>
                <span className="opacity-30">•</span>
                <span className="text-gray-400">sagecall</span>
              </div>

              {/* Description Snippet */}
              <p className="text-sm text-gray-200/90 group-hover:text-blue-100 transition-colors font-medium line-clamp-2">
                {call.transcript ? (
                  call.transcript.length > 100
                    ? `${call.transcript.substring(0, 100)}...`
                    : call.transcript
                ) : (
                  <span className="text-gray-500">No transcript available</span>
                )}
              </p>
            </div>
          </div>

          {/* Right side - Time and Chevron */}
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm font-semibold text-gray-300 bg-white/10 px-2 py-1 rounded-lg min-w-[100px] text-center select-none">
              {new Date(call.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                ? `${Math.floor((Date.now() - new Date(call.createdAt).getTime()) / (1000 * 60))} min ago`
                : new Date(call.createdAt).toLocaleDateString()
              }
            </span>
            <div className="rounded-full bg-white/5 p-1 transition-transform duration-200 group-hover:bg-blue-800/10">
              <ChevronDown
                size={18}
                className={`text-blue-300 transition-transform duration-200 ${expandedId === call.id ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expandedId === call.id && (
          <div className="px-6 pb-7 pt-2 bg-gradient-to-br from-[#181825]/80 to-[#212134]/90 border-t border-white/10">
            <div className="space-y-6">
              {/* Audio Player */}
              {call.path && (
                <div>
                  <h4 className="text-xs font-bold text-blue-300 mb-2">Audio:</h4>
                  <div className="bg-[#22223e]/80 rounded-xl border border-white/10 p-4 shadow">
                    <audio controls className="w-full h-9">
                      <source src={call.path} type="audio/mpeg" />
                      <source src={call.path} type="audio/wav" />
                      <source src={call.path} type="audio/ogg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}

              {/* Full Transcript */}
              <div>
                <h4 className="text-xs font-bold text-blue-300 mb-2">Full Transcript:</h4>
                <div className="bg-[#232336] rounded-lg border border-white/10 p-4 text-sm text-blue-100 max-h-40 overflow-y-auto shadow-inner">
                  {call.transcript || <span className="text-gray-500">No transcript available</span>}
                </div>
              </div>

              {/* Summary */}
              {call.summary && (
                <div>
                  <h4 className="text-xs font-bold text-blue-300 mb-2">Summary:</h4>
                  <div className="bg-[#1a1a28] rounded-lg border border-white/10 p-4 text-sm text-blue-100 prose prose-invert prose-sm max-w-none shadow-inner">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => <code className="bg-[#232336] px-1 py-0.5 rounded text-xs">{children}</code>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-400/30 pl-4 italic">{children}</blockquote>,
                      }}
                    >
                      {call.summary}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Classification Editor Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingId(call.id);
                    setNewClassification(call.classification || '');
                  }}
                  className="px-4 py-1.5 text-xs bg-gradient-to-r from-blue-700 to-purple-600 text-white rounded-lg hover:scale-105 shadow transition-all"
                >
                  Edit Classification
                </button>
              </div>

              {/* Classification Editor */}
              {editingId === call.id && (
                <div className="bg-[#171728] rounded-xl border border-blue-800/20 p-4 mt-2 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <label className="text-xs font-bold text-blue-300">Update Classification:</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={newClassification}
                      onChange={(e) => setNewClassification(e.target.value)}
                      className="px-3 py-2 bg-[#22223e] border border-white/10 rounded text-white text-xs focus:outline-none focus:border-purple-500 transition"
                    >
                      <option value="">Select Classification</option>
                      <option value="complaint">Complaint</option>
                      <option value="compliment">Compliment</option>
                      <option value="uncategorised">Uncategorized</option>
                    </select>
                    <button
                      onClick={() => handleUpdateClassification(call.id, newClassification)}
                      className="p-2 text-green-400 hover:text-green-200 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-red-400 hover:text-red-200 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    ))
  )}
</div>

    </div>
  );
}
