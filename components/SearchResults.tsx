import { Message } from '@/types';
import { useState } from 'react';
import Markdown from './Markdown';
import { Download } from 'lucide-react';

interface SearchResultsProps {
  searchResults: Message[];
  thinkingProcess: string[];
}

export const SearchResults = ({ searchResults, thinkingProcess }: SearchResultsProps) => {
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto">
      {searchResults.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-12">
          {searchResults.map((result, resultIndex) => (
            <div key={resultIndex} className="space-y-8">
              {/* Query on the right */}
              {result.role === "user" ? <div className="text-white text-md text-right">
                <span className="bg-[#2E2E2E] rounded-xl p-4 inline-block">
                  <span className=" text-sm">{result.content}</span>
                </span>
              </div>

                :
                <div>
                  <div className="max-w-[80vw]">
                      <Markdown content={result.content} />
                  </div>
                  {result.source && result.source.length > 0 && (
                    <div className=" rounded-lg ">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {result.source.map((source, sourceIndex) => (
                          <div key={sourceIndex} className=" rounded-lg p-3 border border-[#3E3E3E] bg-[#2E2E2E]">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start space-x-2 flex-1 min-w-0">
                                {source.type === "file.audio" ? (
                                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                  </svg>
                                 ) : (
                                  <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <h5 className="text-white font-medium text-sm leading-tight" title={source.title}>
                                  {source.title}
                                </h5>
                              </div>
                              
                              {/* Download button for documents with key */}
                              {source.key && source.type !== "file.audio" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(source.key, source.title);
                                  }}
                                  className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2"
                                  title="Download document"
                                >
                                  <Download size={14} />
                                </button>
                              )}
                            </div>

                            {source.type === "file.audio" && source.key ? (
                              <div className="mb-2">
                                <audio controls className="w-full h-8">
                                  <source src={source.key} type="audio/mpeg" />
                                  <source src={source.key} type="audio/wav" />
                                  <source src={source.key} type="audio/ogg" />
                                  Your browser does not support the audio element.
                                </audio>
                              </div>
                            ) : (
                              <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                                {source.snippet}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              }
            </div>
          ))}
        </div>
      )}


      {/* Sources Section */}


      {/* Thinking process - below search results */}
      {thinkingProcess.length > 0 && (
        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-gray-300 text-sm">
                {thinkingProcess[thinkingProcess.length - 1]}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
