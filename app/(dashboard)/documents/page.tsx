"use client";

import { useState, useEffect } from 'react';
import { Search, Bell, Upload, Filter } from 'lucide-react';
import { TopBar } from '@/components/TopBar';
import { DocumentCard } from '@/components/DocumentCard';
import { SectionHeader } from '@/components/SectionHeader';
import { FilePicker } from '@/components/FilePicker';
import { useDocuments, PolicyDocument } from '@/hooks/useDocuments';

// Policy Document Types enum
enum PolicyDocumentType {
  CODE_OF_CONDUCT = 'CODE_OF_CONDUCT',
  DATA_PRIVACY_POLICY = 'DATA_PRIVACY_POLICY',
  IT_SECURITY_POLICY = 'IT_SECURITY_POLICY',
  REMOTE_WORK_POLICY = 'REMOTE_WORK_POLICY',
  ONBOARDING = 'ONBOARDING',
  PERFORMANCE = 'PERFORMANCE',
  LEAVE = 'LEAVE',
  EMPLOYEE_HANDBOOK = 'EMPLOYEE_HANDBOOK',
}

// Policy Document Parent IDs enum (from schema)
enum PolicyDocumentParentId {
  POLICY = 'POLICY',
  HR = 'HR',
  SALES = 'SALES',
  MARKETING = 'MARKETING',
  ENGINEERING = 'ENGINEERING',
  PRODUCT = 'PRODUCT',
  OPS = 'OPS',
  FINANCE = 'FINANCE',
  LEGAL = 'LEGAL',
  OTHER = 'OTHER',
}

// Mapping of section headers to parent IDs
const sectionToParentId: Record<string, PolicyDocumentParentId> = {
  'Policy Documents': PolicyDocumentParentId.POLICY,
  'HR Documents': PolicyDocumentParentId.HR,
  'Sales Documents': PolicyDocumentParentId.SALES,
  'Marketing Documents': PolicyDocumentParentId.MARKETING,
  'Engineering Documents': PolicyDocumentParentId.ENGINEERING,
  'Product Documents': PolicyDocumentParentId.PRODUCT,
  'Operations Documents': PolicyDocumentParentId.OPS,
  'Finance Documents': PolicyDocumentParentId.FINANCE,
  'Legal Documents': PolicyDocumentParentId.LEGAL,
  'Recently Viewed': PolicyDocumentParentId.OTHER, // Default for recently viewed
};

// Mapping of section headers to policy document types
const sectionToPolicyType: Record<string, PolicyDocumentType> = {
  'Policy Documents': PolicyDocumentType.CODE_OF_CONDUCT, // Default for policy section
  'HR Documents': PolicyDocumentType.ONBOARDING, // Default for HR section
  'Recently Viewed': PolicyDocumentType.EMPLOYEE_HANDBOOK, // Default for recently viewed
};

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterModified, setFilterModified] = useState('Last Modified');
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  // Use the documents hook
  const {
    documents,
    loading,
    error,
    fetchDocuments,
    fetchDocumentsBySection,
    searchDocuments,
    uploadDocument,
  } = useDocuments();
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);
  // Handle search
  useEffect(() => {
    if (searchTerm.trim()) {
      searchDocuments(searchTerm);
    } else {
      // fetchDocuments();
    }
  }, [searchTerm, searchDocuments]);
  // Mock data for recently viewed documents (fallback)
  const recentlyViewed = [
    {
      title: "Employee Handbook 2024",
      description: "Updated version of the company-wide employee handbook.",
      lastModified: "2 days ago",
      icon: "document" as const,
      fileUrl: undefined
    },
    {
      title: "Social Media Guidelines",
      description: "Rules and best practices for company social media accounts.",
      lastModified: "1 week ago",
      icon: "image" as const,
      fileUrl:undefined
    },
    {
      title: "Q3 Sales Report",
      description: "Comprehensive analysis of sales performance for the third quarter.",
      lastModified: "3 days ago",
      icon: "chart" as const,
      fileUrl: undefined
    }
  ];

  // Mock data for policy documents
  const policyDocuments = [
    { 
      title: "Code of Conduct", 
      description: "Company code of conduct and ethical guidelines",
      fileUrl: undefined
    },
    { 
      title: "Data Privacy Policy", 
      description: "Data protection and privacy policy",
      fileUrl: undefined
    },
    { 
      title: "IT Security Policy", 
      description: "Information technology security guidelines",
      fileUrl:undefined
    },
    { 
      title: "Remote Work Policy", 
      description: "Guidelines for remote work arrangements",
      fileUrl: undefined // No file URL - will show upload icon
    }
  ];

  // Mock data for HR documents
  const hrDocuments = [
    { 
      title: "Onboarding Checklist", 
      description: "New employee onboarding process",
      fileUrl: "/documents/onboarding-checklist.pdf"
    },
    { 
      title: "Performance Review Template", 
      description: "Employee performance evaluation form",
      fileUrl: "/documents/performance-review-template.pdf"
    },
    { 
      title: "Leave Request Form", 
      description: "Employee leave request and approval process",
      fileUrl: "/documents/leave-request-form.pdf"
    },
    { 
      title: "Employee Handbook", 
      description: "Comprehensive employee handbook and guidelines",
      fileUrl: undefined // No file URL - will show upload icon
    }
  ];

  const handleFileSelect = async (file: File) => {
    setSelectedFiles(prev => [...prev, file]);
    setIsUploading(true);
    
    try {
      // Show loading state
      // Upload the file to backend
      const uploadData = {
        title: file.name,
        description: `Uploaded document: ${file.name}`,
        type: PolicyDocumentType.EMPLOYEE_HANDBOOK,
        uploadedBy: 'user-123',
        version: '1.0',
        effectiveDate: new Date().toISOString(),
        parentId: PolicyDocumentParentId.OTHER, // Default parent ID for favorites
        headers: {
          originalFileName: file.name,
          fileType: file.type,
          uploadDate: new Date().toISOString(),
          source: 'dashboard-favorites',
          fileSize: file.size,
        },
      };

      const result = await uploadDocument(file, uploadData);
      
      // Refresh documents to show the newly uploaded document
      await fetchDocuments();
      
      
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileReplace = async (file: File, cardTitle: string, sectionTitle?: string) => {
    setIsUploading(true);
    
    try {
      // Determine policy document type based on section and card title
      let policyType = PolicyDocumentType.EMPLOYEE_HANDBOOK; // Default
      
      if (sectionTitle) {
        // Map specific card titles to policy types
        const cardToPolicyType: Record<string, PolicyDocumentType> = {
          'Code of Conduct': PolicyDocumentType.CODE_OF_CONDUCT,
          'Data Privacy Policy': PolicyDocumentType.DATA_PRIVACY_POLICY,
          'IT Security Policy': PolicyDocumentType.IT_SECURITY_POLICY,
          'Remote Work Policy': PolicyDocumentType.REMOTE_WORK_POLICY,
          'Onboarding Checklist': PolicyDocumentType.ONBOARDING,
          'Performance Review Template': PolicyDocumentType.PERFORMANCE,
          'Leave Request Form': PolicyDocumentType.LEAVE,
          'Employee Handbook': PolicyDocumentType.EMPLOYEE_HANDBOOK,
        };
        
        policyType = cardToPolicyType[cardTitle] || sectionToPolicyType[sectionTitle] || PolicyDocumentType.EMPLOYEE_HANDBOOK;
      }

      // Get parent ID based on section
      const parentId = sectionTitle ? sectionToParentId[sectionTitle] || PolicyDocumentParentId.OTHER : PolicyDocumentParentId.OTHER;

      // Prepare upload data
      const uploadData = {
        title: cardTitle,
        description: `Policy document for ${cardTitle}`,
        type: policyType,
        uploadedBy: 'user-123',
        version: '1.0',
        effectiveDate: new Date().toISOString(),
        parentId: parentId,
        headers: {
          originalFileName: file.name,
          fileType: file.type,
          uploadDate: new Date().toISOString(),
          source: 'dashboard-upload',
          cardTitle: cardTitle,
          sectionTitle: sectionTitle,
          policyType: policyType,
          parentId: parentId,
        },
      };

      // Upload using the hook
      const result = await uploadDocument(file, uploadData);
      
      // Refresh documents to show the newly uploaded document
      await fetchDocuments();
      
      alert(`Policy document "${cardTitle}" uploaded successfully as ${policyType}!`);
      
    } catch (error) {
      console.error('Failed to upload policy document:', error);
      alert('Failed to upload policy document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCardClick = (title: string) => {
    // You can add navigation logic here
  };

  // Get all documents for a section (both uploaded and not uploaded)
  const getDocumentsBySection = (sectionTitle: string) => {
    const expectedParentId = sectionToParentId[sectionTitle];
    
    // Get uploaded documents for this section
    const uploadedDocs = documents.filter(doc => {
      if (expectedParentId) {
        return doc.parentId === expectedParentId;
      }
      
      // Fallback to type-based filtering
      const sectionMapping: Record<string, string[]> = {
        'Policy Documents': ['CODE_OF_CONDUCT', 'DATA_PRIVACY_POLICY', 'IT_SECURITY_POLICY', 'REMOTE_WORK_POLICY'],
        'HR Documents': ['ONBOARDING', 'PERFORMANCE', 'LEAVE', 'EMPLOYEE_HANDBOOK'],
        'Recently Viewed': ['EMPLOYEE_HANDBOOK', 'CODE_OF_CONDUCT', 'ONBOARDING'],
      };
      
      const allowedTypes = sectionMapping[sectionTitle] || [];
      return allowedTypes.includes(doc.type);
    });

    // Define expected documents for each section
    const expectedDocuments = getExpectedDocumentsForSection(sectionTitle);
    
    // Merge uploaded documents with expected documents
    const allDocuments = expectedDocuments.map(expected => {
      const uploaded = uploadedDocs.find(doc => 
        doc.title.toLowerCase() === expected.title.toLowerCase() ||
        doc.fileName.toLowerCase().includes(expected.title.toLowerCase())
      );
      
      return {
        ...expected,
        id: uploaded?.id || `placeholder-${expected.title.toLowerCase().replace(/\s+/g, '-')}`,
        fileUrl: uploaded?.filePath,
        lastModified: uploaded ? new Date(uploaded.createdAt).toLocaleDateString() : '',
        isUploaded: !!uploaded,
        uploadedDoc: uploaded
      };
    });

    return allDocuments;
  };

  // Define expected documents for each section
  const getExpectedDocumentsForSection = (sectionTitle: string) => {
    const sectionDocuments: Record<string, Array<{title: string, description: string}>> = {
      'Policy Documents': [
        { title: 'Code of Conduct', description: 'Company code of conduct and ethical guidelines' },
        { title: 'Data Privacy Policy', description: 'Data protection and privacy policy' },
        { title: 'IT Security Policy', description: 'Information technology security guidelines' },
        { title: 'Remote Work Policy', description: 'Guidelines for remote work arrangements' }
      ],
      'HR Documents': [
        { title: 'Onboarding Checklist', description: 'New employee onboarding process' },
        { title: 'Performance Review Template', description: 'Employee performance evaluation form' },
        { title: 'Leave Request Form', description: 'Employee leave request and approval process' },
        { title: 'Employee Handbook', description: 'Comprehensive employee handbook and guidelines' }
      ],
      'Sales Documents': [
        { title: 'Sales Process Guide', description: 'Step-by-step sales process documentation' },
        { title: 'Customer Onboarding', description: 'Customer onboarding and setup procedures' },
        { title: 'Sales Training Manual', description: 'Sales training and development materials' },
        { title: 'Customer Success Playbook', description: 'Customer success strategies and procedures' }
      ],
      'Engineering Documents': [
        { title: 'Development Guidelines', description: 'Software development best practices and guidelines' },
        { title: 'Code Review Process', description: 'Code review standards and procedures' },
        { title: 'API Documentation', description: 'API design and implementation guidelines' },
        { title: 'Testing Standards', description: 'Software testing procedures and standards' }
      ]
    };

    return sectionDocuments[sectionTitle] || [];
  };

  // Get recently viewed documents (last 3 uploaded documents)
  const getRecentlyViewedDocuments = () => {
    const recentDocs = documents
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    return recentDocs.map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.description || '',
      lastModified: new Date(doc.createdAt).toLocaleDateString(),
      fileUrl: doc.filePath,
      isUploaded: true,
      uploadedDoc: doc
    }));
  };

  return (
    <>
      <TopBar title="Dashboard" />
      
      <div className="flex-1 overflow-auto p-6 min-h-screen" style={{ backgroundColor: '#212121' }}>
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-white text-3xl font-bold">Welcome, John!</h1>
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Bell size={20} />
                </button>
                <button 
                  onClick={() => setShowFilePicker(true)}
                  disabled={isUploading}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isUploading 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <Upload size={16} />
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents, policies, and more..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option>All Types</option>
                  <option>PDF</option>
                  <option>DOC</option>
                  <option>Images</option>
                </select>
                <select
                  value={filterModified}
                  onChange={(e) => setFilterModified(e.target.value)}
                  className="px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option>Last Modified</option>
                  <option>Recently Added</option>
                  <option>Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recently Viewed Section */}
          <div className="mb-8">
            <SectionHeader title="Recently Viewed" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading || isUploading ? (
                <div className="col-span-full text-center text-gray-400">
                  {isUploading ? 'Uploading document...' : 'Loading documents...'}
                </div>
              ) : error ? (
                <div className="col-span-full text-center text-red-400">Error: {error}</div>
              ) : (
                <>
                  {getRecentlyViewedDocuments().map((doc, index) => (
                    <DocumentCard
                      key={doc.id}
                      title={doc.title}
                      description={doc.description}
                      lastModified={doc.lastModified}
                      icon="document"
                      fileUrl={doc.fileUrl}
                      onClick={() => handleCardClick(doc.title)}
                      onDownload={doc.isUploaded ? () => handleDownload(doc.fileUrl!, doc.uploadedDoc!.fileName) : undefined}
                      onFileReplace={(file) => handleFileReplace(file, doc.title, 'Recently Viewed')}
                    />
                  ))}
                  <DocumentCard
                    title="Add to Favorites"
                    description=""
                    lastModified=""
                    isAddCard={true}
                    onFileSelect={() => setShowFilePicker(true)}
                  />
                </>
              )}
            </div>
          </div>

          {/* Policy Documents Section */}
          <div className="mb-8">
            <SectionHeader title="Policy Documents" showViewAll={true} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getDocumentsBySection('Policy Documents').map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  description={doc.description}
                  lastModified={doc.lastModified}
                  fileUrl={doc.fileUrl}
                  onClick={() => handleCardClick(doc.title)}
                  onDownload={doc.isUploaded ? () => handleDownload(doc.fileUrl!, doc.uploadedDoc!.fileName) : undefined}
                  onFileReplace={(file) => handleFileReplace(file, doc.title, 'Policy Documents')}
                />
              ))}
            </div>
          </div>

          {/* HR Documents Section */}
          <div className="mb-8">
            <SectionHeader title="HR Documents" showViewAll={true} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getDocumentsBySection('HR Documents').map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  description={doc.description}
                  lastModified={doc.lastModified}
                  fileUrl={doc.fileUrl}
                  onClick={() => handleCardClick(doc.title)}
                  onDownload={doc.isUploaded ? () => handleDownload(doc.fileUrl!, doc.uploadedDoc!.fileName) : undefined}
                  onFileReplace={(file) => handleFileReplace(file, doc.title, 'HR Documents')}
                />
              ))}
            </div>
          </div>

          {/* Sales Documents Section */}
          <div className="mb-8">
            <SectionHeader title="Sales Documents" showViewAll={true} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getDocumentsBySection('Sales Documents').map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  description={doc.description}
                  lastModified={doc.lastModified}
                  fileUrl={doc.fileUrl}
                  onClick={() => handleCardClick(doc.title)}
                  onDownload={doc.isUploaded ? () => handleDownload(doc.fileUrl!, doc.uploadedDoc!.fileName) : undefined}
                  onFileReplace={(file) => handleFileReplace(file, doc.title, 'Sales Documents')}
                />
              ))}
            </div>
          </div>

          {/* Engineering Documents Section */}
          <div className="mb-8">
            <SectionHeader title="Engineering Documents" showViewAll={true} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getDocumentsBySection('Engineering Documents').map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  description={doc.description}
                  lastModified={doc.lastModified}
                  fileUrl={doc.fileUrl}
                  onClick={() => handleCardClick(doc.title)}
                  onDownload={doc.isUploaded ? () => handleDownload(doc.fileUrl!, doc.uploadedDoc!.fileName) : undefined}
                  onFileReplace={(file) => handleFileReplace(file, doc.title, 'Engineering Documents')}
                />
              ))}
            </div>
          </div>

          {/* Selected Files Display */}
          {selectedFiles.length > 0 && (
            <div className="mb-8 bg-gray-800 rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-4">Selected Files</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-2">
                    <span className="text-white text-sm">{file.name}</span>
                    <button
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="ml-2 p-1 rounded-full hover:bg-gray-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Picker Modal */}
      <FilePicker
        isOpen={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onFileSelect={handleFileSelect}
      />
    </>
  );
}
