import React from 'react';

const Landing = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center">
      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Smart AI Resume Maker</h1>
          <p className="text-gray-700 mb-6">
            Build a professional resume through a simple chat. Optimized for blue-collar roles with
            voice support, adaptive questions, and clean PDF/DOCX export.
          </p>
          <ul className="space-y-2 text-gray-700 mb-8">
            <li>• Conversational guidance to collect your details</li>
            <li>• Voice input and AI-generated professional language</li>
            <li>• Export to PDF or DOCX</li>
          </ul>
          <button onClick={onLoginClick} className="btn-primary">Get Started</button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-3">How it works</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Login or create a free account</li>
            <li>Answer a few simple questions</li>
            <li>Review your resume and download</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Landing;


