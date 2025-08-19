# Smart AI Resume Maker for Blue-Collar Workforce

A conversational AI-powered resume builder designed specifically for blue-collar workers, featuring voice interaction, adaptive questioning, and professional resume generation.

## 🎯 Project Overview

This application helps blue-collar workers (drivers, electricians, factory workers, delivery staff, etc.) create professional resumes through an intuitive conversational interface. The AI asks smart follow-up questions to gather comprehensive information and generates polished, professional resumes.

## ✨ Core Features

### 1. **Conversational AI Interface**
- Intelligent chatbot that asks adaptive follow-up questions
- Context-aware responses based on user input
- Professional language improvement suggestions
- Multi-language support (English, Hindi, Spanish, French, German)

### 2. **Voice + Text Interaction**
- **Text-to-Speech**: AI questions are spoken aloud
- **Speech-to-Text**: Users can respond via voice or typing
- Web Speech API integration for seamless voice experience
- Voice settings and language preferences

### 3. **Smart Resume Building**
- Adaptive questioning system that gathers complete information
- Automatic extraction of work experience, skills, and education
- Professional language enhancement
- Structured resume sections:
  - Personal Information
  - Work Experience
  - Skills & Equipment
  - Education & Training
  - Languages
  - Certifications

### 4. **Resume Export**
- **PDF Generation**: Professional, print-ready resumes
- **DOCX Export**: Editable Word documents
- Clean, professional templates
- Automatic formatting and layout

## 🚀 Technology Stack

### Frontend
- **React 18** with modern hooks and functional components
- **TailwindCSS** for responsive, beautiful UI
- **Web Speech API** for voice input/output
- **Lucide React** for modern icons
- **React Hot Toast** for notifications

### Backend
- **Node.js** with **Express.js** framework
- **OpenAI API** integration for intelligent responses
- **PDF-lib** for PDF generation
- **Docx** for Word document creation
- **CORS** enabled for cross-origin requests

### AI & Voice
- **OpenAI GPT-3.5-turbo** for conversational AI
- **Web Speech API** for browser-based voice features
- **Fallback mock responses** for development/testing
- **Adaptive questioning logic** for comprehensive data collection

## 📋 Prerequisites

- **Node.js** 16+ and **npm** 8+
- Modern web browser with Web Speech API support
- **OpenAI API key** (optional, for enhanced AI responses)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-resume-maker
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI API Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key_here

# Voice Configuration
SPEECH_LANG=en-US
SPEECH_RATE=0.9
SPEECH_PITCH=1

# Resume Generation
DEFAULT_RESUME_FORMAT=pdf
```

### 4. Start the Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
npm run server    # Backend only (port 5000)
npm run client    # Frontend only (port 3000)
```

## 🌐 Usage Guide

### Getting Started
1. **Open the application** in your browser
2. **Allow microphone access** when prompted for voice features
3. **Start the conversation** by telling the AI about your work experience
4. **Answer follow-up questions** to provide more details
5. **Review your resume** in real-time as it's built
6. **Download** your completed resume in PDF or DOCX format

### Voice Interaction
- **Enable voice**: Click the speaker icon in the header
- **Voice input**: Click the microphone button and speak your response
- **Voice output**: AI responses are automatically spoken aloud
- **Language support**: Choose from multiple languages in settings

### Resume Building Process
1. **Initial Question**: "What type of work do you do?"
2. **Follow-up Questions**: AI asks specific questions about:
   - Job titles and responsibilities
   - Tools and equipment used
   - Team size and collaboration
   - Safety certifications
   - Years of experience
3. **Data Extraction**: System automatically structures your responses
4. **Professional Enhancement**: Vague descriptions are improved
5. **Resume Generation**: Complete, professional resume is created

## 🔧 API Endpoints

### Chat API
- `POST /api/chat` - Process user messages and generate AI responses
- `GET /api/chat/status` - Check chat service status

### Resume Generation API
- `POST /api/generate-resume` - Generate resume in PDF/DOCX format
- `GET /api/generate-resume/formats` - Get available export formats
- `GET /api/generate-resume/status` - Check generation service status

### Health Check
- `GET /api/health` - Overall API health status

## 🎨 Customization

### Voice Settings
- Enable/disable voice features
- Adjust speech rate and pitch
- Choose preferred language
- Configure voice input/output preferences

### Resume Templates
- Professional PDF layout
- Editable Word document format
- Consistent formatting and styling
- Responsive design for all devices

### AI Behavior
- Customizable follow-up questions
- Industry-specific questioning patterns
- Professional language improvements
- Context-aware responses

## 🌟 Demo Scenarios

### Scenario 1: Construction Worker
- **User Input**: "I work in construction"
- **AI Follow-ups**: 
  - "What type of construction? (residential, commercial, roads)"
  - "What tools and equipment do you use?"
  - "How many people are on your team?"
  - "Any safety certifications?"

### Scenario 2: Delivery Driver
- **User Input**: "I deliver food"
- **AI Follow-ups**:
  - "What area do you cover?"
  - "Do you use GPS or delivery apps?"
  - "How do you handle customer interactions?"
  - "What's your delivery success rate?"

### Scenario 3: Factory Worker
- **User Input**: "I work in a factory"
- **AI Follow-ups**:
  - "What products do you manufacture?"
  - "What machines do you operate?"
  - "Are you on an assembly line?"
  - "Any quality control responsibilities?"

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
npm start
```

### Environment Variables
- Set `NODE_ENV=production`
- Configure production database connections
- Set up proper CORS origins
- Configure logging and monitoring

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **Input Validation**: All user inputs are sanitized
- **CORS Protection**: Configurable cross-origin restrictions
- **Rate Limiting**: API request throttling
- **Error Handling**: Secure error messages in production
- **Data Privacy**: No persistent storage of personal information

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
npm test
```

### Manual Testing Scenarios
1. **Voice Input/Output**: Test microphone and speaker functionality
2. **AI Responses**: Verify adaptive questioning logic
3. **Resume Generation**: Test PDF and DOCX export
4. **Multi-language**: Test different language settings
5. **Error Handling**: Test with invalid inputs and network issues

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Add comprehensive error handling
- Include appropriate logging
- Write clear commit messages
- Test thoroughly before submitting

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- **OpenAI** for AI language model capabilities
- **Web Speech API** for voice interaction features
- **React Community** for excellent frontend framework
- **Node.js Community** for robust backend runtime
- **Blue-collar workers** for inspiration and feedback

## 📞 Support

For questions, issues, or contributions:
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: [Your Contact Information]

## 🔮 Future Enhancements

- **Database Integration**: Store resume templates and user preferences
- **Advanced AI Models**: Integration with more sophisticated language models
- **Resume Templates**: Multiple design options and layouts
- **Mobile App**: Native mobile application
- **Collaboration Features**: Resume sharing and collaboration
- **Analytics Dashboard**: Usage statistics and insights
- **Integration APIs**: Connect with job boards and ATS systems

---

**Built with ❤️ for the blue-collar workforce**

*Making professional resume creation accessible to everyone, one conversation at a time.*
