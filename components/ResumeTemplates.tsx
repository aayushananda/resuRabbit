import React from 'react';

// Define the props interface
interface ResumeTemplatesProps {
  onSelectTemplate: (templateCode: string) => void;
}

const ResumeTemplates: React.FC<ResumeTemplatesProps> = ({ onSelectTemplate }) => {
  // Template data - just including one template as requested
  const templates = [
    {
      id: 'professional',
      name: 'Professional Resume',
      description: 'A clean, professional layout suitable for most industries',
      thumbnail: '/api/placeholder/200/300',
    },

    {
      id: 'professional2',
      name: 'Professional Resume',
      description: 'A clean, professional layout suitable for most industries',
      thumbnail: '/api/placeholder/200/300',
    },

      {
        id: 'professional3',
        name: 'Professional Resume',
        description: 'A clean, professional layout suitable for most industries',
        thumbnail: '/api/placeholder/200/300',
      },
      {
        id: 'professional3',
        name: 'Professional Resume',
        description: 'A clean, professional layout suitable for most industries',
        thumbnail: '/api/placeholder/200/300',
      }
    
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div 
          key={template.id}
          className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative h-64 bg-gray-100">
            <img 
              src={template.thumbnail} 
              alt={`${template.name} preview`}
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1">{template.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>
            <button
              onClick={() => onSelectTemplate(template.id)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-300"
            >
              Select Template
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumeTemplates;