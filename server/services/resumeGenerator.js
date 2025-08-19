const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType } = require('docx');

// Generate PDF resume
async function generatePDF(resumeData) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // US Letter size
    const { width, height } = page.getSize();
    
    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPosition = height - 50;
    
    // Header with name and title
    page.drawText(resumeData.personalInfo.name || 'Your Name', {
      x: 50,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2)
    });
    
    yPosition -= 30;
    
    if (resumeData.personalInfo.title) {
      page.drawText(resumeData.personalInfo.title, {
        x: 50,
        y: yPosition,
        size: 16,
        font: font,
        color: rgb(0.4, 0.4, 0.4)
      });
      yPosition -= 25;
    }
    
    // Contact information
    const contactInfo = [];
    if (resumeData.personalInfo.email) contactInfo.push(resumeData.personalInfo.email);
    if (resumeData.personalInfo.phone) contactInfo.push(resumeData.personalInfo.phone);
    if (resumeData.personalInfo.location) contactInfo.push(resumeData.personalInfo.location);
    
    if (contactInfo.length > 0) {
      page.drawText(contactInfo.join(' • '), {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });
      yPosition -= 30;
    }
    
    // Summary
    if (resumeData.personalInfo.summary) {
      yPosition = addSectionHeader(page, 'Professional Summary', yPosition, boldFont);
      yPosition = addWrappedText(page, resumeData.personalInfo.summary, yPosition, font, 50, 512);
      yPosition -= 20;
    }
    
    // Work Experience
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      yPosition = addSectionHeader(page, 'Work Experience', yPosition, boldFont);
      
      for (const job of resumeData.workExperience) {
        yPosition = addJobEntry(page, job, yPosition, font, boldFont);
        yPosition -= 10;
      }
      yPosition -= 10;
    }
    
    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      yPosition = addSectionHeader(page, 'Skills', yPosition, boldFont);
      yPosition = addSkillsList(page, resumeData.skills, yPosition, font);
      yPosition -= 20;
    }
    
    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      yPosition = addSectionHeader(page, 'Education & Training', yPosition, boldFont);
      
      for (const edu of resumeData.education) {
        yPosition = addEducationEntry(page, edu, yPosition, font, boldFont);
        yPosition -= 10;
      }
      yPosition -= 10;
    }
    
    // Languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      yPosition = addSectionHeader(page, 'Languages', yPosition, boldFont);
      const languageText = resumeData.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(', ');
      yPosition = addWrappedText(page, languageText, yPosition, font, 50, 512);
      yPosition -= 20;
    }
    
    // Certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      yPosition = addSectionHeader(page, 'Certifications', yPosition, boldFont);
      
      for (const cert of resumeData.certifications) {
        yPosition = addCertificationEntry(page, cert, yPosition, font, boldFont);
        yPosition -= 10;
      }
    }
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF resume');
  }
}

// Generate DOCX resume
async function generateDOCX(resumeData) {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: []
      }]
    });
    
    const children = doc.sections[0].children;
    
    // Header with name and title
    children.push(
      new Paragraph({
        text: resumeData.personalInfo.name || 'Your Name',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        text: resumeData.personalInfo.title || 'Professional',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
    
    // Contact information
    const contactInfo = [];
    if (resumeData.personalInfo.email) contactInfo.push(resumeData.personalInfo.email);
    if (resumeData.personalInfo.phone) contactInfo.push(resumeData.personalInfo.phone);
    if (resumeData.personalInfo.location) contactInfo.push(resumeData.personalInfo.location);
    
    if (contactInfo.length > 0) {
      children.push(
        new Paragraph({
          text: contactInfo.join(' • '),
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }
    
    // Summary
    if (resumeData.personalInfo.summary) {
      children.push(
        new Paragraph({
          text: 'Professional Summary',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: resumeData.personalInfo.summary,
          spacing: { after: 400 }
        })
      );
    }
    
    // Work Experience
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      children.push(
        new Paragraph({
          text: 'Work Experience',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );
      
      for (const job of resumeData.workExperience) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: job.title, bold: true }),
              new TextRun({ text: ` - ${job.company}`, bold: false })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: job.description,
            spacing: { after: 200 }
          })
        );
      }
    }
    
    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      children.push(
        new Paragraph({
          text: 'Skills',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: resumeData.skills.join(', '),
          spacing: { after: 400 }
        })
      );
    }
    
    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      children.push(
        new Paragraph({
          text: 'Education & Training',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );
      
      for (const edu of resumeData.education) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.degree, bold: true }),
              new TextRun({ text: ` - ${edu.institution}`, bold: false }),
              new TextRun({ text: ` (${edu.year})`, bold: false })
            ],
            spacing: { after: 200 }
          })
        );
      }
    }
    
    // Languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      children.push(
        new Paragraph({
          text: 'Languages',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: resumeData.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(', '),
          spacing: { after: 400 }
        })
      );
    }
    
    // Certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      children.push(
        new Paragraph({
          text: 'Certifications',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );
      
      for (const cert of resumeData.certifications) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: cert.name, bold: true }),
              new TextRun({ text: ` (${cert.year})`, bold: false })
            ],
            spacing: { after: 200 }
          })
        );
      }
    }
    
    // Generate DOCX buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
    
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX resume');
  }
}

// Helper functions for PDF generation
function addSectionHeader(page, title, yPosition, boldFont) {
  page.drawText(title, {
    x: 50,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2)
  });
  
  // Draw line under header
  page.drawLine({
    start: { x: 50, y: yPosition - 5 },
    end: { x: 562, y: yPosition - 5 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7)
  });
  
  return yPosition - 25;
}

function addWrappedText(page, text, yPosition, font, x, maxWidth) {
  const words = text.split(' ');
  let line = '';
  let currentY = yPosition;
  
  for (const word of words) {
    const testLine = line + word + ' ';
    const testWidth = font.widthOfTextAtSize(testLine, 10);
    
    if (testWidth > maxWidth && line !== '') {
      page.drawText(line.trim(), {
        x: x,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0.2, 0.2, 0.2)
      });
      line = word + ' ';
      currentY -= 15;
    } else {
      line = testLine;
    }
  }
  
  if (line.trim()) {
    page.drawText(line.trim(), {
      x: x,
      y: currentY,
      size: 10,
      font: font,
      color: rgb(0.2, 0.2, 0.2)
    });
    currentY -= 15;
  }
  
  return currentY;
}

function addJobEntry(page, job, yPosition, font, boldFont) {
  // Job title and company
  page.drawText(job.title, {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2)
  });
  
  if (job.company) {
    page.drawText(` - ${job.company}`, {
      x: 50 + font.widthOfTextAtSize(job.title, 12),
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0.4, 0.4, 0.4)
    });
  }
  
  yPosition -= 15;
  
  // Job description
  if (job.description) {
    yPosition = addWrappedText(page, job.description, yPosition, font, 70, 492);
  }
  
  return yPosition;
}

function addSkillsList(page, skills, yPosition, font) {
  const skillsText = skills.join(', ');
  return addWrappedText(page, skillsText, yPosition, font, 50, 512);
}

function addEducationEntry(page, edu, yPosition, font, boldFont) {
  page.drawText(edu.degree, {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2)
  });
  
  if (edu.institution) {
    page.drawText(` - ${edu.institution}`, {
      x: 50 + font.widthOfTextAtSize(edu.degree, 12),
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0.4, 0.4, 0.4)
    });
  }
  
  yPosition -= 15;
  
  if (edu.year) {
    page.drawText(edu.year, {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });
    yPosition -= 15;
  }
  
  return yPosition;
}

function addCertificationEntry(page, cert, yPosition, font, boldFont) {
  page.drawText(cert.name, {
    x: 50,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2)
  });
  
  if (cert.year) {
    page.drawText(` (${cert.year})`, {
      x: 50 + font.widthOfTextAtSize(cert.name, 12),
      y: yPosition,
      size: 12,
      font: font,
      color: rgb(0.4, 0.4, 0.4)
    });
  }
  
  return yPosition - 15;
}

module.exports = {
  generatePDF,
  generateDOCX
};
