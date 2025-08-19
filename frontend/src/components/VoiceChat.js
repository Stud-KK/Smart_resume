import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';

const VoiceChat = ({ 
  onVoiceInput, 
  onTextInput, 
  isListening, 
  setIsListening, 
  voiceEnabled, 
  isSpeaking 
}) => {
  const [inputText, setInputText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          alert('Please allow microphone access to use voice input.');
        }
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          onVoiceInput(transcript.trim());
          setTranscript('');
        }
      };
      
      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, [onVoiceInput]);

  const startListening = () => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onTextInput(inputText.trim());
      setInputText('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t bg-gray-50 p-4">
      <div className="flex items-center space-x-3">
        {/* Voice Input Button */}
        {isSupported && voiceEnabled && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-full transition-all duration-200 ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            disabled={isSpeaking}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isListening 
                ? "Listening... Speak now" 
                : "Type your message or use voice input..."
            }
            className="input-field pr-12"
            disabled={isListening}
          />
          
          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim() || isListening}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Voice Status Indicators */}
      {isListening && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Listening... {transcript && `"${transcript}"`}</span>
        </div>
      )}

      {isSpeaking && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
          <Volume2 className="h-4 w-4 text-primary-600" />
          <span>AI is speaking...</span>
        </div>
      )}

      {/* Voice Support Notice */}
      {!isSupported && (
        <div className="mt-3 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
          ⚠️ Voice input is not supported in your browser. Please use text input instead.
        </div>
      )}

      {/* Voice Disabled Notice */}
      {!voiceEnabled && isSupported && (
        <div className="mt-3 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
          🔇 Voice input is currently disabled. Enable it in settings to use voice features.
        </div>
      )}
    </div>
  );
};

export default VoiceChat;
