import { useState } from 'react';
import { InfoSource } from '@/types';
import { apiClient } from '@/utils/apiClient';

export interface SearchResult {
  query: string;
  answer: string;
  conversationId: string;
  
  sources: InfoSource[];
}

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState<string[]>([]);

  const searchDocs = async (query: string, conversationId?: string, artifactId?: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setThinkingProcess([]);
    
    // Thinking process animation
    const thinkingSteps = [
      "Analyzing your question...",
      "Searching through documents...",
      "Finding relevant information...",
      "Processing results...",
      "Generating answer..."
    ];
    
    let stepIndex = 0;
    const thinkingInterval = setInterval(() => {
      if (stepIndex < thinkingSteps.length) {
        setThinkingProcess(prev => [...prev, thinkingSteps[stepIndex]]);
        stepIndex++;
        
        // Auto-scroll when thinking process updates
        setTimeout(() => {
          const container = document.querySelector('.overflow-y-auto');
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 50);
      } else {
        clearInterval(thinkingInterval);
      }
    }, 800);

    try {
      const result = await apiClient.post('/agent/plan', {
        message: query,
        conversationId: conversationId,
        artifactId: artifactId
      });

      console.log('Search results:', result);
      
      // Auto-scroll to bottom when result arrives
      setTimeout(() => {
        const container = document.querySelector('.overflow-y-auto');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
      
      return result;
      
    } catch (error) {
      console.error('Search error:', error);
      // Don't clear results on error, keep existing ones
    } finally {
      clearInterval(thinkingInterval);
      setIsSearching(false);
      setThinkingProcess([]);
    }
  };

  const clearResults = () => {
    setSearchResults([]);
  };

  return {
    searchResults,
    isSearching,
    thinkingProcess,
    searchDocs,
    clearResults
  };
};
