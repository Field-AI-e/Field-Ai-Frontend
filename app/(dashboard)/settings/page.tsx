"use client";

import { TopBar } from "@/components/TopBar";
import { API_BASE_URL } from "@/types/contstants";
import { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";

interface JiraCredentials {
  id?: string;
  jiraUrl: string;
  jiraUser: string;
  jiraApiKey: string;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

export default function SettingsPage() {
  const [jiraCredentials, setJiraCredentials] = useState<JiraCredentials>({
    jiraUrl: '',
    jiraUser: '',
    jiraApiKey: ''
  });
  const [jiraProjects, setJiraProjects] = useState<JiraProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadJiraCredentials();
  }, []);

  const loadJiraCredentials = async () => {
    try {
      const credentials: JiraCredentials = await apiClient.get('/jira-credentials');
      if (credentials) {
        setJiraCredentials({
          jiraUrl: credentials.jiraUrl || '',
          jiraUser: credentials.jiraUser || '',
          jiraApiKey: credentials.jiraApiKey || ''
        });
      }
    } catch (error) {
      console.log('No existing credentials found');
    }
  };

  const saveJiraCredentials = async () => {
    setSaving(true);
    setMessage('');
    try {
      await apiClient.post('/jira-credentials', jiraCredentials);
      setMessage('Jira credentials saved successfully!');
      await loadJiraProjects();
    } catch (error) {
      setMessage('Error saving credentials: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const loadJiraProjects = async () => {
    setLoading(true);
    try {
      const projects: JiraProject[] = await apiClient.get('/jira-tickets/projects');
      setJiraProjects(projects as JiraProject[]);
    } catch (error) {
      setMessage('Error loading projects: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const ingestProject = async () => {
    if (!selectedProject) {
      setMessage('Please select a project first');
      return;
    }
    
    setIngesting(true);
    setMessage('');
    try {
      await apiClient.post('/jira-tickets/ingest', { projectKey: selectedProject });
      setMessage(`Successfully ingested project ${selectedProject}`);
    } catch (error) {
      setMessage('Error ingesting project: ' + (error as Error).message);
    } finally {
      setIngesting(false);
    }
  };

  return (
   <>
  <TopBar title="Settings" />
  
  <div className="flex-1 overflow-auto p-8 pb-12 bg-gradient-to-br from-[#1c1c1e] to-[#28282b] min-h-[calc(100vh-64px)] max-h-[calc(100vh-64px)]">
    <div className="max-w-4xl mx-auto space-y-16">
      
      {/* Jira Integration Card */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 border border-gray-700 shadow-xl shadow-purple-900/25">
        <span className="absolute -left-12 top-8 bg-purple-600 text-white px-4 py-1 rounded-full rotate-[-10deg] font-semibold text-xs shadow-xl select-none z-10">
          JIRA
        </span>
        <h2 className="text-white text-2xl font-extrabold tracking-wide mb-6 select-none">
          Jira Integration
        </h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="jira-url" className="block mb-2 text-sm font-semibold text-gray-300 select-none">
              Jira URL
            </label>
            <input
              id="jira-url"
              type="url"
              value={jiraCredentials.jiraUrl}
              onChange={(e) => setJiraCredentials({...jiraCredentials, jiraUrl: e.target.value})}
              placeholder="https://yourcompany.atlassian.net"
              className="w-full px-5 py-3 rounded-2xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-600 transition shadow-lg"
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="jira-user" className="block mb-2 text-sm font-semibold text-gray-300 select-none">
              Jira User (Email)
            </label>
            <input
              id="jira-user"
              type="email"
              value={jiraCredentials.jiraUser}
              onChange={(e) => setJiraCredentials({...jiraCredentials, jiraUser: e.target.value})}
              placeholder="your.email@company.com"
              className="w-full px-5 py-3 rounded-2xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-600 transition shadow-lg"
              spellCheck={false}
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="jira-api-key" className="block mb-2 text-sm font-semibold text-gray-300 select-none">
              Jira API Key
            </label>
            <input
              id="jira-api-key"
              type="password"
              value={jiraCredentials.jiraApiKey}
              onChange={(e) => setJiraCredentials({...jiraCredentials, jiraApiKey: e.target.value})}
              placeholder="Your Jira API token"
              className="w-full px-5 py-3 rounded-2xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-600 transition shadow-lg"
              spellCheck={false}
              autoComplete="current-password"
            />
          </div>

          <button
            onClick={saveJiraCredentials}
            disabled={saving || !jiraCredentials.jiraUrl || !jiraCredentials.jiraUser || !jiraCredentials.jiraApiKey}
            className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-extrabold rounded-2xl shadow-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving...' : 'Save Credentials'}
          </button>
        </div>
      </section>
      
      {/* Jira Projects Card */}
      {jiraCredentials.jiraUrl && jiraCredentials.jiraUser && jiraCredentials.jiraApiKey && (
        <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 border border-gray-700 shadow-xl shadow-green-700/25">
          <span className="absolute -left-12 top-8 bg-green-600 text-white px-4 py-1 rounded-full -rotate-12 font-semibold text-xs shadow-lg select-none z-10">
            PROJECTS
          </span>
          <h3 className="text-white text-xl font-extrabold mb-6 tracking-wide select-none">Jira Projects</h3>
          
          <div className="space-y-6">
            <button
              onClick={loadJiraProjects}
              disabled={loading}
              className="w-full px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white font-extrabold shadow-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition"
            >
              {loading ? 'Loading...' : 'Load Projects'}
            </button>
            
            {jiraProjects.length > 0 && (
              <div>
                <label htmlFor="select-project" className="block mb-2 text-sm font-semibold text-gray-300 select-none">Select Project to Ingest</label>
                <select
                  id="select-project"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-5 py-3 bg-gray-700 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-green-500 shadow-lg transition"
                >
                  <option value="">Select a project...</option>
                  {jiraProjects.map((project) => (
                    <option key={project.id} value={project.key}>
                      {project.name} ({project.key})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {selectedProject && (
              <button
                onClick={ingestProject}
                disabled={ingesting}
                className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-extrabold shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition"
              >
                {ingesting ? 'Ingesting...' : `Ingest ${selectedProject}`}
              </button>
            )}
          </div>
        </section>
      )}
      
      {/* Message Display */}
      {message && (
        <div className={`p-5 rounded-2xl font-semibold select-none ${
          message.includes('Error') ? 'bg-red-900 text-red-300 shadow-md shadow-red-800/70' : 'bg-green-900 text-green-300 shadow-md shadow-green-800/70'
        }`}>
          {message}
        </div>
      )}
      
      {/* Other Settings Card */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 border border-gray-700 shadow-xl shadow-indigo-600/25">
        <span className="absolute -left-20 top-8 bg-indigo-600 text-white px-4 py-1 rounded-full -rotate-12 font-semibold text-xs shadow-lg select-none z-10">
          OTHER SETTINGS
        </span>
        <h2 className="text-white text-2xl font-extrabold mb-6 tracking-wide select-none">Other Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="api-base-url" className="block mb-2 text-sm font-semibold text-gray-300 select-none">
              API Base URL
            </label>
            <input
              id="api-base-url"
              type="text"
              defaultValue={API_BASE_URL}
              className="w-full px-5 py-3 rounded-2xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-600 shadow-lg transition"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="theme-select" className="block mb-2 text-sm font-semibold text-gray-300 select-none">
              Theme
            </label>
            <select
              id="theme-select"
              className="w-full px-5 py-3 bg-gray-700 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-4 focus:ring-indigo-600 shadow-lg transition"
            >
              <option>Dark</option>
              <option>Light</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  </div>
</>

  );
}
