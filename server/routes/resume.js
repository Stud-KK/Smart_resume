const express = require('express');
const router = express.Router();
const { generatePDF, generateDOCX } = require('../services/resumeGenerator');
const auth = require('../middleware/auth');

// POST /api/generate-resume - Generate resume in specified format
router.post('/', auth, async (req, res) => {
  try {
    const { resumeData, format = 'pdf' } = req.body;

    if (!resumeData) {
      return res.status(400).json({ 
        error: 'Resume data is required' 
      });
    }

    console.log(`Generating ${format.toUpperCase()} resume for: ${resumeData.personalInfo?.name || 'Unknown'}`);

    let fileBuffer;
    let fileName;
    let contentType;

    if (format.toLowerCase() === 'pdf') {
      fileBuffer = await generatePDF(resumeData);
      fileName = `resume-${Date.now()}.pdf`;
      contentType = 'application/pdf';
    } else if (format.toLowerCase() === 'docx') {
      fileBuffer = await generateDOCX(resumeData);
      fileName = `resume-${Date.now()}.docx`;
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else {
      return res.status(400).json({ 
        error: 'Unsupported format. Use "pdf" or "docx"' 
      });
    }

    // Set response headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    // Send the file buffer
    res.send(fileBuffer);

  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({ 
      error: 'Failed to generate resume',
      message: error.message 
    });
  }
});

// GET /api/generate-resume/formats - Get available resume formats
router.get('/formats', (req, res) => {
  res.json({
    formats: [
      { 
        id: 'pdf', 
        name: 'PDF Document', 
        description: 'Portable Document Format - best for printing and sharing',
        icon: '📄'
      },
      { 
        id: 'docx', 
        name: 'Word Document', 
        description: 'Microsoft Word format - editable in Word and similar applications',
        icon: '📝'
      }
    ]
  });
});

// GET /api/generate-resume/status - Check resume generation service status
router.get('/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Resume generation service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
