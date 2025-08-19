// Resume data extraction and structuring service

// Public helper to compute what is missing and the next question to ask
async function getNextQuestion(conversationHistory) {
  const resumeData = await extractResumeData(conversationHistory) || {
    personalInfo: {},
    workExperience: [],
    skills: [],
    education: [],
    languages: [],
    certifications: []
  };

  const missing = determineMissingFields(resumeData);
  const question = generateNextQuestion(missing, resumeData);

  return {
    question,
    missing,
    resumeData
  };
}

// Extract resume data from conversation history
async function extractResumeData(conversationHistory) {
  try {
    const resumeData = {
      personalInfo: {},
      workExperience: [],
      skills: [],
      education: [],
      languages: [],
      certifications: []
    };

    // Process each user message to extract information
    const userMessages = conversationHistory.filter(msg => msg.type === 'user');
    
    for (const message of userMessages) {
      const text = message.text.toLowerCase();
      
      // Extract personal information
      extractPersonalInfo(text, resumeData.personalInfo);
      
      // Extract work experience
      extractWorkExperience(text, resumeData.workExperience);
      
      // Extract skills
      extractSkills(text, resumeData.skills);
      
      // Extract education
      extractEducation(text, resumeData.education);
      
      // Extract languages
      extractLanguages(text, resumeData.languages);
      
      // Extract certifications
      extractCertifications(text, resumeData.certifications);
    }

    // Clean and validate the data
    cleanResumeData(resumeData);
    
    // Only return data if we have meaningful information
    if (hasMeaningfulData(resumeData)) {
      return resumeData;
    }
    
    return null;
    
  } catch (error) {
    console.error('Error extracting resume data:', error);
    return null;
  }
}

// Extract personal information
function extractPersonalInfo(text, personalInfo) {
  // Extract name patterns
  const namePatterns = [
    /my name is (\w+)/i,
    /i'm (\w+)/i,
    /i am (\w+)/i,
    /call me (\w+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && !personalInfo.name) {
      personalInfo.name = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      break;
    }
  }
  
  // Extract contact information
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/;
  const emailMatch = text.match(emailPattern);
  if (emailMatch && !personalInfo.email) {
    personalInfo.email = emailMatch[0];
  }
  
  const phonePattern = /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/;
  const phoneMatch = text.match(phonePattern);
  if (phoneMatch && !personalInfo.phone) {
    personalInfo.phone = phoneMatch[1];
  }
  
  // Extract location
  const locationPatterns = [
    /i live in ([^,]+)/i,
    /i'm from ([^,]+)/i,
    /located in ([^,]+)/i,
    /based in ([^,]+)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && !personalInfo.location) {
      personalInfo.location = match[1].trim();
      break;
    }
  }
  
  // Extract job title for summary
  if (text.includes('work') || text.includes('job') || text.includes('employed')) {
    const jobTitlePatterns = [
      /i was a (\w+)/i,
      /i worked as a (\w+)/i,
      /i am a (\w+)/i,
      /(\w+ worker)/i,
      /(\w+ driver)/i,
      /(\w+ operator)/i
    ];
    
    for (const pattern of jobTitlePatterns) {
      const match = text.match(pattern);
      if (match && !personalInfo.title) {
        personalInfo.title = match[1].replace(/\b\w/g, l => l.toUpperCase());
        break;
      }
    }
  }
}

// Extract work experience
function extractWorkExperience(text, workExperience) {
  if (text.includes('work') || text.includes('job') || text.includes('employed')) {
    const experience = {
      title: '',
      company: '',
      description: '',
      startDate: '',
      endDate: '',
      achievements: [],
      tools: []
    };
    
    // Extract job title
    const titlePatterns = [
      /i was a (\w+)/i,
      /i worked as a (\w+)/i,
      /(\w+ worker)/i,
      /(\w+ driver)/i,
      /(\w+ operator)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match) {
        experience.title = match[1].replace(/\b\w/g, l => l.toUpperCase());
        break;
      }
    }
    
    // Extract company/employer
    const companyPatterns = [
      /at (\w+)/i,
      /for (\w+)/i,
      /with (\w+)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) {
        experience.company = match[1].replace(/\b\w/g, l => l.toUpperCase());
        break;
      }
    }
    
    // Extract duration
    const durationPatterns = [
      /(\d+) years?/i,
      /(\d+) months?/i,
      /for (\d+)/i
    ];
    
    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match) {
        const years = parseInt(match[1]);
        if (years > 0) {
          experience.startDate = new Date(Date.now() - years * 365 * 24 * 60 * 60 * 1000);
          experience.endDate = new Date();
        }
        break;
      }
    }
    
    // Extract description
    if (text.includes('responsible') || text.includes('duties') || text.includes('did')) {
      experience.description = improveDescription(text);
    }

    // Extract tools/machines used
    const toolPhrases = [
      /(?:used|operated|handled|worked with) ([a-z0-9\- ]+?)(?:\.|,|;|$)/i,
      /(tools?|machines?|equipment) like ([a-z0-9\- ,]+)/i
    ];
    for (const pattern of toolPhrases) {
      const match = text.match(pattern);
      if (match) {
        const raw = (match[1] || match[2] || '')
          .split(/,| and /i)
          .map(s => s.trim())
          .filter(Boolean);
        experience.tools.push(...raw.map(t => t.replace(/\b\w/g, l => l.toUpperCase())));
      }
    }
    
    // Only add if we have meaningful data
    if (experience.title || experience.company || experience.description || (experience.tools && experience.tools.length)) {
      workExperience.push(experience);
    }
  }
}

// Extract skills
function extractSkills(text, skills) {
  const skillKeywords = [
    'tools', 'equipment', 'machines', 'software', 'certifications',
    'power tools', 'hand tools', 'safety', 'teamwork', 'communication',
    'problem solving', 'attention to detail', 'quality control'
  ];
  
  for (const keyword of skillKeywords) {
    if (text.includes(keyword) && !skills.includes(keyword.replace(/\b\w/g, l => l.toUpperCase()))) {
      skills.push(keyword.replace(/\b\w/g, l => l.toUpperCase()));
    }
  }
  
  // Extract specific tools/equipment
  const toolPatterns = [
    /(\w+ tools?)/i,
    /(\w+ equipment)/i,
    /(\w+ machines?)/i
  ];
  
  for (const pattern of toolPatterns) {
    const match = text.match(pattern);
    if (match && !skills.includes(match[1])) {
      skills.push(match[1].replace(/\b\w/g, l => l.toUpperCase()));
    }
  }
}

// Extract education
function extractEducation(text, education) {
  if (text.includes('school') || text.includes('college') || text.includes('university') || text.includes('training')) {
    const edu = {
      degree: '',
      institution: '',
      year: ''
    };
    
    // Extract degree/qualification
    const degreePatterns = [
      /high school/i,
      /college/i,
      /university/i,
      /training/i,
      /certificate/i
    ];
    
    for (const pattern of degreePatterns) {
      if (text.includes(pattern)) {
        edu.degree = pattern.replace(/\b\w/g, l => l.toUpperCase());
        break;
      }
    }
    
    // Extract year
    const yearPattern = /(\d{4})/;
    const yearMatch = text.match(yearPattern);
    if (yearMatch) {
      edu.year = yearMatch[1];
    }
    
    if (edu.degree) {
      education.push(edu);
    }
  }
}

// Extract languages
function extractLanguages(text, languages) {
  const languagePatterns = [
    /speak (\w+)/i,
    /(\w+) and (\w+)/i,
    /(\w+) language/i
  ];
  
  for (const pattern of languagePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        // Two languages
        languages.push({ language: match[1].charAt(0).toUpperCase() + match[1].slice(1), proficiency: 'Fluent' });
        languages.push({ language: match[2].charAt(0).toUpperCase() + match[2].slice(1), proficiency: 'Fluent' });
      } else {
        languages.push({ language: match[1].charAt(0).toUpperCase() + match[1].slice(1), proficiency: 'Fluent' });
      }
    }
  }
}

// Extract certifications
function extractCertifications(text, certifications) {
  if (text.includes('certification') || text.includes('certificate') || text.includes('license')) {
    const cert = {
      name: '',
      year: ''
    };
    
    // Extract certification name
    const certPatterns = [
      /(\w+ certification)/i,
      /(\w+ license)/i,
      /(\w+ certificate)/i
    ];
    
    for (const pattern of certPatterns) {
      const match = text.match(pattern);
      if (match) {
        cert.name = match[1].replace(/\b\w/g, l => l.toUpperCase());
        break;
      }
    }
    
    // Extract year
    const yearPattern = /(\d{4})/;
    const yearMatch = text.match(yearPattern);
    if (yearMatch) {
      cert.year = yearMatch[1];
    }
    
    if (cert.name) {
      certifications.push(cert);
    }
  }
}

// Improve vague descriptions into professional language
function improveDescription(text) {
  let improved = text;
  
  // Replace informal language with professional terms
  const improvements = {
    'i deliver': 'Delivered',
    'i work': 'Worked',
    'i do': 'Performed',
    'i help': 'Assisted',
    'i make': 'Manufactured',
    'i build': 'Built',
    'i drive': 'Operated delivery vehicles',
    'i use': 'Utilized',
    'i know': 'Demonstrated proficiency in'
  };
  
  for (const [informal, professional] of Object.entries(improvements)) {
    if (improved.includes(informal)) {
      improved = improved.replace(informal, professional);
    }
  }
  
  return improved;
}

// Clean and validate resume data
function cleanResumeData(resumeData) {
  // Remove duplicates
  resumeData.skills = [...new Set(resumeData.skills)];
  if (Array.isArray(resumeData.workExperience)) {
    for (const exp of resumeData.workExperience) {
      if (Array.isArray(exp.tools)) {
        exp.tools = [...new Set(exp.tools)];
      }
    }
  }
  resumeData.languages = resumeData.languages.filter((lang, index, self) => 
    index === self.findIndex(l => l.language === lang.language)
  );
  
  // Ensure required fields have values
  if (!resumeData.personalInfo.name) {
    resumeData.personalInfo.name = 'Your Name';
  }
  
  if (!resumeData.personalInfo.title) {
    resumeData.personalInfo.title = 'Professional';
  }
  
  // Generate summary if not provided
  if (!resumeData.personalInfo.summary) {
    resumeData.personalInfo.summary = generateSummary(resumeData);
  }
}

// Generate professional summary
function generateSummary(resumeData) {
  const { workExperience, skills, education } = resumeData;
  
  let summary = 'Experienced professional with ';
  
  if (workExperience.length > 0) {
    const totalYears = workExperience.reduce((total, exp) => {
      if (exp.startDate && exp.endDate) {
        return total + ((new Date(exp.endDate) - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 365));
      }
      return total + 1;
    }, 0);
    
    summary += `${Math.round(totalYears)} years of experience in `;
  }
  
  if (skills.length > 0) {
    summary += `${skills.slice(0, 3).join(', ')}. `;
  }
  
  summary += 'Demonstrated ability to work effectively in team environments with strong attention to detail and commitment to safety standards.';
  
  return summary;
}

// Check if resume data has meaningful information
function hasMeaningfulData(resumeData) {
  return (
    resumeData.workExperience.length > 0 ||
    resumeData.skills.length > 0 ||
    resumeData.education.length > 0 ||
    Object.values(resumeData.personalInfo).some(value => value && value !== 'Your Name' && value !== 'Professional')
  );
}

// ===== Missing fields detection and question generation =====

function determineMissingFields(resumeData) {
  const missing = [];

  // Personal Info
  if (!resumeData.personalInfo?.name) missing.push({ section: 'personalInfo', field: 'name' });
  if (!resumeData.personalInfo?.title) missing.push({ section: 'personalInfo', field: 'title' });
  if (!resumeData.personalInfo?.email) missing.push({ section: 'personalInfo', field: 'email' });
  if (!resumeData.personalInfo?.phone) missing.push({ section: 'personalInfo', field: 'phone' });
  if (!resumeData.personalInfo?.location) missing.push({ section: 'personalInfo', field: 'location' });

  // Work Experience (first role focus)
  const firstJob = resumeData.workExperience?.[0];
  if (!firstJob) {
    missing.push({ section: 'workExperience', field: 'title' });
    missing.push({ section: 'workExperience', field: 'company' });
    missing.push({ section: 'workExperience', field: 'duration' });
    missing.push({ section: 'workExperience', field: 'tools' });
    missing.push({ section: 'workExperience', field: 'description' });
  } else {
    if (!firstJob.title) missing.push({ section: 'workExperience', field: 'title' });
    if (!firstJob.company) missing.push({ section: 'workExperience', field: 'company' });
    if (!(firstJob.startDate && firstJob.endDate)) missing.push({ section: 'workExperience', field: 'duration' });
    if (!firstJob.tools || firstJob.tools.length === 0) missing.push({ section: 'workExperience', field: 'tools' });
    if (!firstJob.description) missing.push({ section: 'workExperience', field: 'description' });
  }

  // Skills
  if (!resumeData.skills || resumeData.skills.length === 0) missing.push({ section: 'skills', field: 'skills' });

  // Education
  const firstEdu = resumeData.education?.[0];
  if (!firstEdu) {
    missing.push({ section: 'education', field: 'degree' });
    missing.push({ section: 'education', field: 'institution' });
    missing.push({ section: 'education', field: 'year' });
  } else {
    if (!firstEdu.degree) missing.push({ section: 'education', field: 'degree' });
    if (!firstEdu.institution) missing.push({ section: 'education', field: 'institution' });
    if (!firstEdu.year) missing.push({ section: 'education', field: 'year' });
  }

  // Languages
  if (!resumeData.languages || resumeData.languages.length === 0) missing.push({ section: 'languages', field: 'languages' });

  return missing;
}

function generateNextQuestion(missing, resumeData) {
  if (!missing || missing.length === 0) {
    return 'Thanks! We have most details. Would you like to add any certifications or achievements?';
  }

  const priority = [
    { section: 'personalInfo', field: 'name', q: 'What is your full name?' },
    { section: 'personalInfo', field: 'title', q: 'What is your job title?' },
    { section: 'workExperience', field: 'title', q: 'What was your exact job title in your most recent job?' },
    { section: 'workExperience', field: 'company', q: 'What was the company or employer name?' },
    { section: 'workExperience', field: 'duration', q: 'How long did you work there? (e.g., 2 years, 8 months)' },
    { section: 'workExperience', field: 'tools', q: 'What tools, machines, or equipment did you use on the job?' },
    { section: 'workExperience', field: 'description', q: 'What were your main responsibilities? (e.g., operated machines, managed deliveries)' },
    { section: 'personalInfo', field: 'email', q: 'What is your email address?' },
    { section: 'personalInfo', field: 'phone', q: 'What is your phone number?' },
    { section: 'personalInfo', field: 'location', q: 'What city and state are you located in?' },
    { section: 'skills', field: 'skills', q: 'List 3–5 skills or tools you are good at.' },
    { section: 'education', field: 'degree', q: 'What is your highest degree or training certificate?' },
    { section: 'education', field: 'institution', q: 'What is the name of the school or training center?' },
    { section: 'education', field: 'year', q: 'What year did you complete it?' },
    { section: 'languages', field: 'languages', q: 'Which languages do you speak?' }
  ];

  for (const p of priority) {
    if (missing.find(m => m.section === p.section && m.field === p.field)) {
      if (p.section === 'workExperience' && p.field === 'title') {
        const text = collectAllUserText(resumeData);
        if (/(construction|delivery|factory|driver|operator)/i.test(text)) {
          return 'What was your exact job title? (e.g., Construction Laborer, Delivery Associate, Machine Operator)';
        }
      }
      return p.q;
    }
  }

  return 'Please share any additional details you would like to include.';
}

function collectAllUserText(resumeData) {
  const parts = [];
  if (resumeData.personalInfo?.title) parts.push(resumeData.personalInfo.title);
  for (const w of resumeData.workExperience || []) {
    if (w.title) parts.push(w.title);
    if (w.description) parts.push(w.description);
  }
  return parts.join(' ').toLowerCase();
}

module.exports = {
  extractResumeData,
  getNextQuestion
};
