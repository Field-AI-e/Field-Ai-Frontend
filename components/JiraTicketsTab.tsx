"use client";

import { useState, useEffect } from 'react';
import { ExternalLink, User, Calendar, TrendingUp, AlertCircle, Ticket } from 'lucide-react';
import { apiClient } from '@/utils/apiClient';

interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  assignee?: {
    displayName: string;
    emailAddress: string;
  };
  created: string;
  updated: string;
  issueType: string;
  project: string;
}

interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress: string;
}

interface JiraTicketsTabProps {
  tickets: JiraTicket[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function JiraTicketsTab({ tickets, loading, error, onRefresh }: JiraTicketsTabProps) {
  const [users, setUsers] = useState<JiraUser[]>([]);
  const [assigningTicket, setAssigningTicket] = useState<string | null>(null);
  const [selectedAssignees, setSelectedAssignees] = useState<{ [ticketKey: string]: string }>({});
  const [ticketsPerDay, setTicketsPerDay] = useState<{ date: string; count: number }[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('updated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchUsers();
    calculateTicketsPerDay();
  }, [tickets]);

  // Initialize selected assignees when users are loaded
  useEffect(() => {
    if (users.length > 0 && tickets.length > 0) {
      const initialAssignees: { [ticketKey: string]: string } = {};
      tickets.forEach(ticket => {
        if (ticket.assignee?.emailAddress) {
          const user = users.find(u => u.emailAddress === ticket.assignee?.emailAddress);
          if (user) {
            initialAssignees[ticket.key] = user.accountId;
          }
        }
      });
      setSelectedAssignees(initialAssignees);
    }
  }, [users, tickets]);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/jira-tickets/users');
      setUsers(response as any || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const calculateTicketsPerDay = () => {
    const dayCounts: { [key: string]: number } = {};
    
    tickets.forEach(ticket => {
      const date = new Date(ticket.created).toISOString().split('T')[0];
      dayCounts[date] = (dayCounts[date] || 0) + 1;
    });

    const sortedDays = Object.entries(dayCounts)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }));

    setTicketsPerDay(sortedDays);
  };

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter(ticket => {
      const statusMatch = statusFilter === 'all' || ticket.status.toLowerCase() === statusFilter.toLowerCase();
      const priorityMatch = priorityFilter === 'all' || ticket.priority.toLowerCase() === priorityFilter.toLowerCase();
      return statusMatch && priorityMatch;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'key':
          aValue = a.key;
          bValue = b.key;
          break;
        case 'summary':
          aValue = a.summary.toLowerCase();
          bValue = b.summary.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'priority':
          aValue = a.priority.toLowerCase();
          bValue = b.priority.toLowerCase();
          break;
        case 'updated':
        default:
          aValue = new Date(a.updated).getTime();
          bValue = new Date(b.updated).getTime();
          break;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Get filter options with counts
  const statusFilters = [
    { value: 'all', label: 'All Status', count: tickets.length },
    { value: 'to do', label: 'To Do', count: tickets.filter(t => t.status.toLowerCase() === 'to do').length },
    { value: 'in progress', label: 'In Progress', count: tickets.filter(t => t.status.toLowerCase() === 'in progress').length },
    { value: 'done', label: 'Done', count: tickets.filter(t => t.status.toLowerCase() === 'done').length },
    { value: 'closed', label: 'Closed', count: tickets.filter(t => t.status.toLowerCase() === 'closed').length },
  ];

  const priorityFilters = [
    { value: 'all', label: 'All Priority', count: tickets.length },
    { value: 'high', label: 'High', count: tickets.filter(t => t.priority.toLowerCase() === 'high').length },
    { value: 'medium', label: 'Medium', count: tickets.filter(t => t.priority.toLowerCase() === 'medium').length },
    { value: 'low', label: 'Low', count: tickets.filter(t => t.priority.toLowerCase() === 'low').length },
  ];

  const handleAssignTicket = async (ticketKey: string, assigneeId: string) => {
    setAssigningTicket(ticketKey);
    try {
      await apiClient.put(`/jira-tickets/${ticketKey}/assign`, { assigneeId });
      onRefresh();
      // Clear the selected assignee for this specific ticket
      setSelectedAssignees(prev => ({ ...prev, [ticketKey]: '' }));
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    } finally {
      setAssigningTicket(null);
    }
  };

  // Helper function to get current assignee account ID
  const getCurrentAssigneeId = (ticket: JiraTicket) => {
    if (ticket.assignee?.emailAddress) {
      const user = users.find(u => u.emailAddress === ticket.assignee?.emailAddress);
      return user?.accountId || '';
    }
    return '';
  };

  // Helper function to check if assignment is needed
  const isAssignmentNeeded = (ticket: JiraTicket) => {
    const currentAssigneeId = getCurrentAssigneeId(ticket);
    const selectedAssigneeId = selectedAssignees[ticket.key] || '';
    return selectedAssigneeId && selectedAssigneeId !== currentAssigneeId;
  };

  // Handle column sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column headers
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? <span className="text-blue-400">↑</span> : <span className="text-blue-400">↓</span>;
  };

  // Format time ago with appropriate units
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'to do':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'done':
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading tickets...</div>
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
      {/* Analytics Section */}
      <div className=" grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {/* Total Tickets Card */}
  <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover: group relative overflow-hidden">
    {/* Gradient Background Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="cursor-pointer relative z-10 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-400 mb-2">Total Tickets</p>
        <p className="text-4xl font-bold text-white mb-1">{tickets.length}</p>
        <div className="flex items-center gap-1 text-xs text-blue-400 font-medium">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
          <span>All tickets</span>
        </div>
      </div>
      <div className="p-4 bg-gradient-to-br from-blue-600/20 to-blue-500/20 rounded-2xl border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
        <AlertCircle className="text-blue-400" size={28} />
      </div>
    </div>

    {/* Bottom Accent Line */}
    <div className="cursor-pointer absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600/0 via-blue-600 to-blue-600/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
  </div>

  {/* Open Tickets Card */}
  <div className="cursor-pointer bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover: group relative overflow-hidden">
    {/* Gradient Background Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-400 mb-2">Open Tickets</p>
        <p className="text-4xl font-bold text-white mb-1">
          {tickets.filter(t => t.status.toLowerCase() !== 'done' && t.status.toLowerCase() !== 'closed').length}
        </p>
        <div className="flex items-center gap-1 text-xs text-yellow-400 font-medium">
          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
          <span>In progress</span>
        </div>
      </div>
      <div className="p-4 bg-gradient-to-br from-yellow-600/20 to-yellow-500/20 rounded-2xl border border-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
        <Calendar className="text-yellow-400" size={28} />
      </div>
    </div>

    {/* Bottom Accent Line */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-600/0 via-yellow-600 to-yellow-600/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
  </div>

  {/* High Priority Card */}
  <div className="cursor-pointer bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover: group relative overflow-hidden">
    {/* Gradient Background Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-400 mb-2">High Priority</p>
        <p className="text-4xl font-bold text-white mb-1">
          {tickets.filter(t => t.priority.toLowerCase() === 'high').length}
        </p>
        <div className="flex items-center gap-1 text-xs text-red-400 font-medium">
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
          <span>Urgent attention</span>
        </div>
      </div>
      <div className="p-4 bg-gradient-to-br from-red-600/20 to-red-500/20 rounded-2xl border border-red-500/30 group-hover:scale-110 transition-transform duration-300">
        <TrendingUp className="text-red-400" size={28} />
      </div>
    </div>

    {/* Bottom Accent Line */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600/0 via-red-600 to-red-600/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
  </div>
</div>


      {/* Tickets Per Day Chart */}
{ticketsPerDay.length > 0 && (
  <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl mb-8 animate-fadeIn">
    <div className="flex items-center justify-center gap-3 mb-6">
      <div className="p-2 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
        <TrendingUp size={20} className="text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-white">Tickets Created Per Day</h3>
    </div>
    
    <div className="space-y-3 max-w-2xl mx-auto">
      {ticketsPerDay.slice(-7).map((day, index) => (
        <div 
          key={day.date} 
          className="flex items-center justify-center gap-4 group hover:bg-white/5 p-3 rounded-xl transition-all duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors w-24 text-center">
            {day.date}
          </span>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden border border-white/10 relative">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden group-hover:shadow-lg"
                style={{ width: `${Math.min((day.count / Math.max(...ticketsPerDay.map(d => d.count))) * 100, 100)}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </div>
            <span className="text-base font-bold text-white w-10 text-center bg-white/10 px-2 py-1 rounded-lg border border-white/20">
              {day.count}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

<style jsx>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out;
  }
`}</style>


      {/* Filters */}
     <div className="space-y-6">
  {/* Status Filters */}
  <div className="animate-fadeIn">
    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
      <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
      Status Filter
    </h4>
    <div className="flex gap-3 flex-wrap">
      {statusFilters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => setStatusFilter(filter.value)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform relative overflow-hidden group ${
            statusFilter === filter.value
              ? 'cursor-pointer bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg scale-105 border border-blue-500/30'
              : 'cursor-pointer bg-white/5 backdrop-blur-xl text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 hover:scale-105 hover:shadow-lg'
          }`}
        >
          {/* Shimmer effect on active */}
          {statusFilter === filter.value && (
            <div className="absolute inset-0 opacity-50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
          )}
          
          <span className="relative z-10 flex items-center gap-2">
            {filter.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              statusFilter === filter.value
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-gray-400 group-hover:bg-white/15 group-hover:text-gray-300'
            }`}>
              {filter.count}
            </span>
          </span>
        </button>
      ))}
    </div>
  </div>

  {/* Priority Filters */}
  <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
      <div className="w-1 h-4 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
      Priority Filter
    </h4>
    <div className="flex gap-3 flex-wrap">
      {priorityFilters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => setPriorityFilter(filter.value)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform relative overflow-hidden group ${
            priorityFilter === filter.value
              ? 'cursor-pointer bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg scale-105 border border-red-500/30'
              : 'cursor-pointer bg-white/5 backdrop-blur-xl text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 hover:scale-105 hover:shadow-lg'
          }`}
        >
          {/* Shimmer effect on active */}
          {priorityFilter === filter.value && (
            <div className="absolute inset-0 opacity-50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
          )}
          
          <span className="relative z-10 flex items-center gap-2">
            {filter.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              priorityFilter === filter.value
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-gray-400 group-hover:bg-white/15 group-hover:text-gray-300'
            }`}>
              {filter.count}
            </span>
          </span>
        </button>
      ))}
    </div>
  </div>
</div>

<style jsx>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(200%);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`}</style>


      {/* Tickets Table */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fadeIn">
        {filteredTickets.length === 0 ? (
           <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-600/20 to-gray-500/20 rounded-2xl border border-gray-500/30 mb-4">
        <Ticket size={32} className="text-gray-400" />
      </div>
      <p className="text-gray-400 text-lg font-medium">No tickets found for the selected filters.</p>
      <p className="text-gray-500 text-sm mt-2">Try adjusting your filters to see more results.</p>
    </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-xl border-b border-white/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded "
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('key')}
                  >
                    <div className="flex items-center gap-1">
                      Ticket ID
                      {getSortIcon('key')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('summary')}
                  >
                    <div className="flex items-center gap-1">
                      Summary
                      {getSortIcon('summary')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-1">
                      Priority
                      {getSortIcon('priority')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('updated')}
                  >
                    <div className="flex items-center gap-1">
                      Last Updated
                      {getSortIcon('updated')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gradient-to-r hover:from-blue-600/5 hover:via-purple-600/5 hover:to-transparent transition-all duration-300">
                    
                    <td className="px-4 py-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all truncate">
                        {ticket.key}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <div className="text-xs font-semibold text-white truncate group-hover:text-gray-100 transition-colors">
                          {ticket.summary}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {ticket.description ? ticket.description.toString().substring(0, 100) + '...' : 'No description'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded border ${getStatusColor(ticket.status)} transition-all duration-200 group-hover:scale-105 whitespace-nowrap`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded border ${getStatusColor(ticket.status)} transition-all duration-200 group-hover:scale-105 whitespace-nowrap`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">
                      {formatTimeAgo(ticket.updated)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedAssignees[ticket.key] || (ticket.assignee?.emailAddress ? users.find(u => u.emailAddress === ticket.assignee?.emailAddress)?.accountId || '' : '')}
                          onChange={(e) => setSelectedAssignees(prev => ({ ...prev, [ticket.key]: e.target.value }))}
                          className="flex-1 px-2 py-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded text-white text-xs focus:outline-none focus:border-purple-500/50 transition-all duration-200 cursor-pointer hover:bg-white/10 min-w-0"
                          disabled={assigningTicket === ticket.key}
                        >
                          <option value="" className='bg-gray-900'>Assign...</option>
                          {users.map((user) => (
                            <option key={user.accountId} className='bg-gray-900' value={user.accountId}>
                              {user.displayName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignTicket(ticket.key, selectedAssignees[ticket.key] || '')}
                          disabled={!isAssignmentNeeded(ticket) || assigningTicket === ticket.key}
                          className="cursor-pointer px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold rounded disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 flex-shrink-0"
                        >
                          {assigningTicket === ticket.key ? '...' : 'Assign'}
                        </button>
                        <a
                          href={`https://your-jira-instance.atlassian.net/browse/${ticket.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-all duration-200 hover:scale-110 border border-white/10 flex-shrink-0"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
