import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Download, FileText, Settings } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import VoiceChat from './components/VoiceChat';
import ResumePreview from './components/ResumePreview';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import Landing from './components/Landing';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

function App() {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [showResume, setShowResume] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [showAuth, setShowAuth] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        type: 'ai',
        text: `Hello! I'm your AI Resume Assistant. I'll help you create a professional resume by asking you some questions about your work experience, skills, and background. 

Let's start with something simple - what type of work do you do?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Speak the welcome message if voice is enabled
      if (voiceEnabled) {
        speakText(welcomeMessage.text);
      }
    }
  }, []);

  useEffect(() => {
    // Load auth from storage
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token) setAuthToken(token);
    if (userJson) {
      try { setCurrentUser(JSON.parse(userJson)); } catch {}
    }
  }, []);

  const onAuthSuccess = ({ token, user }) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    toast.success(`Welcome ${user.name.split(' ')[0]}!`);
    navigate('/app');
  };

  const logout = () => {
    setAuthToken('');
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    navigate('/');
  };

  const withAuthHeaders = (baseHeaders = {}) => {
    const h = { ...baseHeaders };
    if (authToken) h['Authorization'] = `Bearer ${authToken}`;
    return h;
  };

  const speakText = (text) => {
    if (!voiceEnabled) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  const handleUserMessage = async (text) => {
    if (!authToken) {
      setShowAuth(true);
      toast.error('Please log in to continue.');
      return;
    }
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI thinking
    const thinkingMessage = {
      id: Date.now() + 1,
      type: 'ai',
      text: '...',
      timestamp: new Date(),
      isThinking: true
    };
    
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Send message to backend for AI processing
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          message: text,
          conversationHistory: messages,
          language: language
        }),
      });

      const data = await response.json();
      
      // Remove thinking message and add AI response
      setMessages(prev => prev.filter(msg => !msg.isThinking));
      
      const aiMessage = {
        id: Date.now() + 2,
        type: 'ai',
        text: data.response,
        timestamp: new Date(),
        followUpQuestions: data.followUpQuestions || []
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the AI response
      if (voiceEnabled) {
        speakText(data.response);
      }

      // Update resume data if provided
      if (data.resumeData) {
        setResumeData(data.resumeData);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Sorry, there was an error processing your message. Please try again.');
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => !msg.isThinking));
    }
  };

  const handleVoiceInput = (text) => {
    handleUserMessage(text);
  };

  const handleGenerateResume = async () => {
    if (!resumeData) {
      toast.error('Please complete the conversation first to generate a resume.');
      return;
    }
    if (!authToken) {
      setShowAuth(true);
      toast.error('Please log in to download your resume.');
      return;
    }

    try {
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          resumeData: resumeData,
          format: 'pdf' // or 'docx'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Resume downloaded successfully!');
      } else {
        toast.error('Failed to generate resume. Please try again.');
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      toast.error('Failed to generate resume. Please try again.');
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const AppShell = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Smart AI Resume Maker
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors ${
                  voiceEnabled 
                    ? 'bg-primary-100 text-primary-600 hover:bg-primary-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
              >
                {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => setShowAuth(true)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title={currentUser ? currentUser.name : 'Login'}
                style={{ display: currentUser ? 'none' : 'inline-flex' }}
              >
                Login
              </button>

              {currentUser && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">Hi, {currentUser.name.split(' ')[0]}</span>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    title="Logout"
                  >
                    Logout
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-primary-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  AI Resume Assistant
                </h2>
                <p className="text-primary-100 text-sm mt-1">
                  {voiceEnabled ? 'Voice enabled - Speak or type your responses' : 'Voice disabled - Type your responses'}
                </p>
              </div>
              
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`chat-bubble ${message.type}`}>
                      {message.isThinking ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse-slow">Thinking...</div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap">{message.text}</p>
                          {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-sm font-medium text-gray-700">Quick options:</p>
                              <div className="flex flex-wrap gap-2">
                                {message.followUpQuestions.map((question, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleUserMessage(question)}
                                    className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200 transition-colors"
                                  >
                                    {question}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Voice Chat Component */}
              <VoiceChat
                onVoiceInput={handleVoiceInput}
                onTextInput={handleUserMessage}
                isListening={isListening}
                setIsListening={setIsListening}
                voiceEnabled={voiceEnabled}
                isSpeaking={isSpeaking}
              />
            </div>
          </div>

          {/* Resume Preview & Actions */}
          <div className="space-y-6">
            {/* Resume Preview */}
            {resumeData && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-green-600 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">
                    Resume Preview
                  </h3>
                </div>
                <div className="p-6">
                  <ResumePreview resumeData={resumeData} />
                  <div className="mt-4 space-y-3">
                    <button
                      onClick={() => setShowResume(true)}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Full Resume</span>
                    </button>
                    <button
                      onClick={handleGenerateResume}
                      className="w-full btn-secondary flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-yellow-500 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  💡 Tips for Better Resumes
                </h3>
              </div>
              <div className="p-6 space-y-3 text-sm text-gray-600">
                <p>• Be specific about your job titles and responsibilities</p>
                <p>• Mention tools, equipment, or software you used</p>
                <p>• Include safety certifications and training</p>
                <p>• Highlight problem-solving and teamwork skills</p>
                <p>• Use action words like "operated," "maintained," "delivered"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Modal */}
      {showResume && resumeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Resume</h2>
              <button
                onClick={() => setShowResume(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ResumePreview resumeData={resumeData} fullView={true} />
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        language={language}
        setLanguage={setLanguage}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
      />

    </div>
  );

  const RequireAuth = ({ children }) => {
    if (!authToken) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Landing onLoginClick={() => setShowAuth(true)} />}
        />
        <Route
          path="/app"
          element={
            <RequireAuth>
              {AppShell}
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to={authToken ? '/app' : '/'} replace />} />
      </Routes>
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthSuccess={onAuthSuccess}
      />
    </>
  );
}

export default App;
