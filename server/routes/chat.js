const express = require('express');
const router = express.Router();
const { processMessage } = require('../services/aiService');
const { extractResumeData } = require('../services/resumeService');
const auth = require('../middleware/auth');

// POST /api/chat - Handle user messages and generate AI responses
router.post('/', auth, async (req, res) => {
  try {
    const { message, conversationHistory, language = 'en' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    console.log(`Processing message: "${message}" in ${language}`);

    // Process the message with AI service
    const aiResponse = await processMessage(message, conversationHistory, language);
    
    // Extract resume data from the conversation
    const resumeData = await extractResumeData([...conversationHistory, { type: 'user', text: message }]);

    // Prepare response
    const response = {
      response: aiResponse.text,
      followUpQuestions: aiResponse.followUpQuestions || [],
      resumeData: resumeData,
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
});

// GET /api/chat/status - Check chat service status
router.get('/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chat service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
