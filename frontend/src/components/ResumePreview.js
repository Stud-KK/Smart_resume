import React from 'react';

const ResumePreview = ({ resumeData, fullView = false }) => {
  if (!resumeData) return null;

  const {
    personalInfo = {},
    workExperience = [],
    skills = [],
    education = [],
    languages = [],
    certifications = []
  } = resumeData;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const renderSection = (title, children, className = '') => (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );

  const renderWorkExperience = () => (
    <div className="space-y-4">
      {workExperience.map((job, index) => (
        <div key={index} className="border-l-4 border-primary-500 pl-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800">{job.title}</h4>
            <span className="text-sm text-gray-500">
              {formatDate(job.startDate)} - {job.endDate ? formatDate(job.endDate) : 'Present'}
            </span>
          </div>
          <p className="text-gray-600 font-medium mb-1">{job.company}</p>
          <p className="text-gray-700 text-sm leading-relaxed">{job.description}</p>
          {job.achievements && job.achievements.length > 0 && (
            <ul className="mt-2 space-y-1">
              {job.achievements.map((achievement, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  {achievement}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={index}
          className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium"
        >
          {skill}
        </span>
      ))}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-3">
      {education.map((edu, index) => (
        <div key={index} className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-gray-800">{edu.degree}</h4>
            <p className="text-gray-600">{edu.institution}</p>
          </div>
          <span className="text-sm text-gray-500">{edu.year}</span>
        </div>
      ))}
    </div>
  );

  const renderLanguages = () => (
    <div className="flex flex-wrap gap-2">
      {languages.map((lang, index) => (
        <span
          key={index}
          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
        >
          {lang.language} ({lang.proficiency})
        </span>
      ))}
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-2">
      {certifications.map((cert, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="font-medium text-gray-800">{cert.name}</span>
          <span className="text-sm text-gray-500">{cert.year}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`bg-white ${fullView ? 'p-8' : 'p-4'} rounded-lg`}>
      {/* Header/Personal Info */}
      <div className="text-center mb-6 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {personalInfo.name || 'Your Name'}
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          {personalInfo.title || 'Professional Title'}
        </p>
        <div className="text-sm text-gray-500 space-y-1">
          {personalInfo.email && <p>{personalInfo.email}</p>}
          {personalInfo.phone && <p>{personalInfo.phone}</p>}
          {personalInfo.location && <p>{personalInfo.location}</p>}
        </div>
        {personalInfo.summary && (
          <p className="text-gray-700 mt-4 text-center max-w-2xl mx-auto leading-relaxed">
            {personalInfo.summary}
          </p>
        )}
      </div>

      {/* Work Experience */}
      {workExperience.length > 0 && renderSection('Work Experience', renderWorkExperience())}

      {/* Skills */}
      {skills.length > 0 && renderSection('Skills', renderSkills())}

      {/* Education */}
      {education.length > 0 && renderSection('Education & Training', renderEducation())}

      {/* Languages */}
      {languages.length > 0 && renderSection('Languages', renderLanguages())}

      {/* Certifications */}
      {certifications.length > 0 && renderSection('Certifications', renderCertifications())}

      {/* Additional Info */}
      {personalInfo.additionalInfo && (
        renderSection('Additional Information', (
          <p className="text-gray-700 leading-relaxed">
            {personalInfo.additionalInfo}
          </p>
        ))
      )}
    </div>
  );
};

export default ResumePreview;
