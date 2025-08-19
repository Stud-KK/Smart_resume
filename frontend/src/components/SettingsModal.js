import React from 'react';
import { X, Globe, Volume2 } from 'lucide-react';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  language, 
  setLanguage, 
  voiceEnabled, 
  setVoiceEnabled 
}) => {
  if (!isOpen) return null;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' }
  ];

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // Stop any current speech when language changes
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleVoiceToggle = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Language Settings */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-800">Language</h3>
            </div>
            <div className="space-y-3">
              {languages.map((lang) => (
                <label
                  key={lang.code}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={language === lang.code}
                    onChange={() => handleLanguageChange(lang.code)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-gray-700">{lang.name}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This affects both the AI responses and voice output language.
            </p>
          </div>

          {/* Voice Settings */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Volume2 className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-800">Voice Features</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={handleVoiceToggle}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">Enable voice input and output</span>
              </label>
              
              {voiceEnabled && (
                <div className="ml-6 space-y-2 text-sm text-gray-600">
                  <p>✅ Text-to-Speech: AI responses will be spoken aloud</p>
                  <p>✅ Speech-to-Text: You can respond using your voice</p>
                  <p>⚠️ Requires microphone permission in your browser</p>
                </div>
              )}
            </div>
          </div>

          {/* Browser Compatibility */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Browser Compatibility</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Voice features work best in Chrome, Edge, and Safari</p>
              <p>• Make sure to allow microphone access when prompted</p>
              <p>• Some features may not work in older browsers</p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Tips for Best Experience</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• Speak clearly and at a normal pace</p>
              <p>• Use a quiet environment for better voice recognition</p>
              <p>• You can always type if voice isn't working</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
