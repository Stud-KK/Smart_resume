const OpenAI = require('openai');

const useMockAi = String(process.env.USE_MOCK_AI || '').toLowerCase() === 'true';
const aiProvider = String(process.env.AI_PROVIDER || 'openai').toLowerCase(); // 'openai' | 'gemini'

// Initialize AI clients (fallback to mock if no API key)
let openai;
let geminiClient;

try {
  if (!useMockAi && aiProvider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.OPENAI_APIKEY;
    if (!apiKey) {
  console.warn('OpenAI API key not found, using mock responses');
  openai = null;
    } else {
      openai = new OpenAI({ apiKey });
    }
  }
} catch (error) {
  console.warn('Failed to initialize OpenAI client, using mock responses:', error.message);
  openai = null;
}

try {
  if (!useMockAi && aiProvider === 'gemini') {
    const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!googleApiKey) {
      console.warn('Google Gemini API key not found, using mock responses');
      geminiClient = null;
    } else {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      geminiClient = new GoogleGenerativeAI(googleApiKey);
    }
  }
} catch (error) {
  console.warn('Failed to initialize Google Gemini client, using mock responses:', error.message);
  geminiClient = null;
}

// Mock AI responses for development/testing
const mockResponses = {
  initial: {
    text: "Great! I'd like to learn more about your work experience. Can you tell me:\n\n1. What was your exact job title?\n2. How long did you work there?\n3. What were your main responsibilities?",
    followUpQuestions: [
      "I was a construction worker",
      "I worked as a delivery driver",
      "I was a factory machine operator"
    ]
  },
  construction: {
    text: "Excellent! Construction work is valuable experience. Let me ask a few more questions:\n\n1. What type of construction did you do? (residential, commercial, roads, etc.)\n2. What tools and equipment did you use?\n3. Did you work with a team? How many people?\n4. Any safety certifications or training?",
    followUpQuestions: [
      "Mostly residential buildings",
      "Road and bridge construction",
      "Commercial construction projects"
    ]
  },
  delivery: {
    text: "Delivery work shows reliability and customer service skills! Tell me more:\n\n1. What did you deliver? (food, packages, documents, etc.)\n2. What area did you cover?\n3. Did you use any apps or GPS systems?\n4. How did you handle customer interactions?",
    followUpQuestions: [
      "Food delivery for restaurants",
      "Package delivery for courier services",
      "Document delivery for offices"
    ]
  },
  factory: {
    text: "Factory work demonstrates precision and attention to detail! I'd like to know:\n\n1. What type of products did you help manufacture?\n2. What machines or equipment did you operate?\n3. Did you work on an assembly line?\n4. Any quality control responsibilities?",
    followUpQuestions: [
      "Automotive parts manufacturing",
      "Electronics assembly",
      "Food processing and packaging"
    ]
  }
};

// Adaptive questioning logic
const adaptiveQuestions = {
  workExperience: {
    triggers: ['work', 'job', 'employed', 'construction', 'delivery', 'factory', 'driver', 'worker'],
    questions: [
      "What was your exact job title?",
      "How long did you work there?",
      "What were your main responsibilities?",
      "What tools or equipment did you use?",
      "Did you work with a team?",
      "Any achievements or special projects?"
    ]
  },
  skills: {
    triggers: ['skills', 'tools', 'equipment', 'machines', 'software', 'certifications'],
    questions: [
      "What specific tools or equipment are you experienced with?",
      "Any safety certifications?",
      "Computer skills or software experience?",
      "Languages you speak?",
      "Any specialized training?"
    ]
  },
  education: {
    triggers: ['school', 'college', 'university', 'degree', 'certificate', 'training', 'course'],
    questions: [
      "What's your highest level of education?",
      "Any vocational training or certifications?",
      "Did you complete any specialized courses?",
      "Any on-the-job training programs?"
    ]
  },
  personal: {
    triggers: ['name', 'contact', 'phone', 'email', 'address', 'location'],
    questions: [
      "What's your full name?",
      "Best phone number to reach you?",
      "Email address?",
      "City and state where you're located?",
      "Are you willing to relocate for work?"
    ]
  }
};

// Process user message and generate intelligent response
async function processMessage(message, conversationHistory, language = 'en') {
  try {
    // Respect explicit mock mode
    if (useMockAi) {
      return await processWithMock(message, conversationHistory, language);
    }

    // Choose provider
    if (aiProvider === 'gemini' && geminiClient) {
      return await processWithGemini(message, conversationHistory, language);
    }

    if (aiProvider === 'openai' && openai) {
      return await processWithOpenAI(message, conversationHistory, language);
    }
    
    // Fallback to mock responses for development
    return await processWithMock(message, conversationHistory, language);
    
  } catch (error) {
    console.error('Error processing message with AI:', error);
    // Fallback to basic response
    return generateBasicResponse(message, conversationHistory);
  }
}

// Process with OpenAI API
async function processWithOpenAI(message, conversationHistory, language) {
  const systemPrompt = `You are a helpful AI assistant helping blue-collar workers create professional resumes. 
  
Your role is to:
1. Ask follow-up questions to gather complete information
2. Help improve vague descriptions into professional language
3. Be encouraging and supportive
4. Focus on work experience, skills, tools, equipment, safety, and teamwork
5. Respond in ${language === 'hi' ? 'Hindi' : 'English'}

Keep responses conversational and ask 2-3 specific follow-up questions at a time.`;

  const userMessages = conversationHistory
    .filter(msg => msg.type === 'user')
    .map(msg => ({ role: 'user', content: msg.text }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...userMessages,
    { role: 'user', content: message }
  ];

  try {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messages,
    max_tokens: 300,
    temperature: 0.7,
  });

  const response = completion.choices[0].message.content;
  
  // Extract follow-up questions from the response
  const followUpQuestions = extractFollowUpQuestions(response);
  
  return {
    text: response,
    followUpQuestions: followUpQuestions
  };
  } catch (error) {
    // Gracefully fallback to mock on quota/ratelimit issues
    const isQuotaOrRateLimit = error?.status === 429 || error?.code === 'insufficient_quota' || error?.code === 'rate_limit_exceeded';
    if (isQuotaOrRateLimit) {
      console.warn('OpenAI quota/rate limit hit; falling back to mock responses.');
      return await processWithMock(message, conversationHistory, language);
    }
    throw error;
  }
}

// Process with Google Gemini API
async function processWithGemini(message, conversationHistory, language) {
  const modelId = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  const systemPrompt = `You are a helpful AI assistant helping blue-collar workers create professional resumes. \n\nYour role is to:\n1. Ask follow-up questions to gather complete information\n2. Help improve vague descriptions into professional language\n3. Be encouraging and supportive\n4. Focus on work experience, skills, tools, equipment, safety, and teamwork\n5. Respond in ${language === 'hi' ? 'Hindi' : 'English'}\n\nKeep responses conversational and ask 2-3 specific follow-up questions at a time.`;

  const historyText = conversationHistory
    .filter(msg => msg.type === 'user')
    .map(msg => `User: ${msg.text}`)
    .join('\n');

  const prompt = `${systemPrompt}\n\n${historyText}\nUser: ${message}`;

  try {
    const model = geminiClient.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(prompt);
    const responseText = (result && result.response && typeof result.response.text === 'function')
      ? result.response.text()
      : '';

    const followUpQuestions = extractFollowUpQuestions(responseText);
    return {
      text: responseText || generateBasicResponse(message, conversationHistory).text,
      followUpQuestions: followUpQuestions
    };
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const code = error?.code || error?.response?.data?.error?.code;
    const isQuotaOrAuth = status === 429 || status === 403 || status === 401 || code === 'insufficient_quota' || code === 'rate_limit_exceeded' || code === 'invalid_api_key';
    if (isQuotaOrAuth) {
      console.warn('Gemini error (quota/auth), falling back to mock responses.');
      return await processWithMock(message, conversationHistory, language);
    }
    console.error('Gemini error:', error);
    return generateBasicResponse(message, conversationHistory);
  }
}

// Process with mock responses (for development/testing)
async function processWithMock(message, conversationHistory, language) {
  const lowerMessage = message.toLowerCase();
  
  // Check for specific work types
  if (lowerMessage.includes('construction') || lowerMessage.includes('builder')) {
    return mockResponses.construction;
  } else if (lowerMessage.includes('delivery') || lowerMessage.includes('driver')) {
    return mockResponses.delivery;
  } else if (lowerMessage.includes('factory') || lowerMessage.includes('manufacturing')) {
    return mockResponses.factory;
  }
  
  // Check conversation length for initial response
  if (conversationHistory.length <= 2) {
    return mockResponses.initial;
  }
  
  // Generate contextual response based on conversation
  return generateContextualResponse(message, conversationHistory);
}

// Generate contextual response based on conversation history
function generateContextualResponse(message, conversationHistory) {
  const lowerMessage = message.toLowerCase();
  
  // Check what information we still need
  const hasWorkExperience = conversationHistory.some(msg => 
    msg.type === 'user' && 
    (msg.text.toLowerCase().includes('work') || msg.text.toLowerCase().includes('job'))
  );
  
  const hasSkills = conversationHistory.some(msg => 
    msg.type === 'user' && 
    (msg.text.toLowerCase().includes('tools') || msg.text.toLowerCase().includes('equipment'))
  );
  
  const hasEducation = conversationHistory.some(msg => 
    msg.type === 'user' && 
    (msg.text.toLowerCase().includes('school') || msg.text.toLowerCase().includes('training'))
  );
  
  if (!hasWorkExperience) {
    return {
      text: "That's helpful information! Now let's talk about your work experience. What type of work have you done? Please tell me about your most recent or most relevant job.",
      followUpQuestions: [
        "I worked in construction",
        "I was a delivery driver",
        "I worked in a factory",
        "I'm looking for my first job"
      ]
    };
  }
  
  if (!hasSkills) {
    return {
      text: "Great! Now let's talk about your skills and what you're good at. What tools, equipment, or machines are you experienced with?",
      followUpQuestions: [
        "I can use power tools",
        "I'm good with computers",
        "I have safety certifications",
        "I'm a fast learner"
      ]
    };
  }
  
  if (!hasEducation) {
    return {
      text: "Excellent! Let's also include your education and training. What's your highest level of education? Any special training or certifications?",
      followUpQuestions: [
        "High school diploma",
        "Some college courses",
        "Vocational training",
        "On-the-job training"
      ]
    };
  }
  
  // If we have most information, ask for final details
  return {
    text: "You're doing great! I have most of the information I need. Just a few more questions:\n\n1. What languages do you speak?\n2. Are you willing to travel or relocate for work?\n3. Any additional information you'd like to include?",
    followUpQuestions: [
      "I speak English and Spanish",
      "I'm willing to travel within the state",
      "I have a clean driving record",
      "That's all the information I have"
    ]
  };
}

// Extract follow-up questions from AI response
function extractFollowUpQuestions(response) {
  const questions = [];
  const lines = response.split('\n');
  
  for (const line of lines) {
    if (line.includes('?') && line.length < 100) {
      const cleanQuestion = line.replace(/^\d+\.\s*/, '').trim();
      if (cleanQuestion && cleanQuestion.length > 10) {
        questions.push(cleanQuestion);
      }
    }
  }
  
  return questions.slice(0, 3); // Limit to 3 questions
}

// Generate basic fallback response
function generateBasicResponse(message, conversationHistory) {
  return {
    text: "Thank you for that information! I'm here to help you create a great resume. Could you tell me more about your work experience, skills, or education?",
    followUpQuestions: [
      "I have work experience",
      "I want to talk about my skills",
      "Let me tell you about my education"
    ]
  };
}

module.exports = {
  processMessage
};
