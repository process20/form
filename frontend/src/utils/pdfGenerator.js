// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import reshape from 'arabic-reshaper';
import { amiriFont } from '../assets/fonts/arabicFont';

/**
 * Check if text contains Arabic characters
 */
const containsArabic = (text) => {
  if (!text) return false;
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

/**
 * Check if text contains only Arabic characters (excluding spaces and punctuation)
 */
const isPureArabic = (text) => {
  if (!text) return false;
  const nonSpaceText = text.replace(/[\s\u060C\u061B\u061F\u0640.,!?;:()]/g, '');
  const arabicRegex = /^[\u0600-\u06FF]+$/;
  return arabicRegex.test(nonSpaceText);
};

/**
 * Prepare text for PDF rendering with proper reshaping
 */
const prepareText = (text, forceDirection = null) => {
  if (!text) return 'N/A';
  
  const isRTL = forceDirection !== null ? forceDirection : isPureArabic(text);
  
  if (isRTL && containsArabic(text)) {
    try {
      return reshape(text);
    } catch (error) {
      console.warn('Arabic reshaping failed:', error);
      return text;
    }
  }
  
  return text;
};

/**
 * Add a field (label + value) to the PDF with proper bidirectional support
 * Labels in Arabic are right-aligned, values adjust based on content
 */
const addField = (doc, label, value, x, y) => {
  if (!value) value = 'N/A';
  
  // Check if label is Arabic
  const labelIsArabic = containsArabic(label);
  
  if (labelIsArabic) {
    // Arabic label - render right-aligned
    const reshapedLabel = prepareText(label, true);
    doc.setFont('Amiri', 'bold');
    doc.setFontSize(12);
    doc.text(reshapedLabel, 190, y, { align: 'right' });
  } else {
    // English label - render left-aligned
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(label, x, y);
  }
  
  // Determine if the entire value should be treated as RTL
  const isFullyRTL = isPureArabic(value);
  
  if (isFullyRTL) {
    // Pure Arabic text - render right-aligned below the label
    const processedValue = prepareText(value, true);
    doc.setFont('Amiri', 'normal');
    doc.text(processedValue, 190, y + 8, { align: 'right' });
    return 20; // More space for two-line layout
  } else if (containsArabic(value)) {
    // Mixed content - render with reshaped Arabic
    const processedValue = prepareText(value, false);
    doc.setFont('Amiri', 'normal');
    if (labelIsArabic) {
      doc.text(processedValue, 190, y + 8, { align: 'right' });
      return 20;
    } else {
      doc.text(processedValue, x + 40, y);
      return 12;
    }
  } else {
    // Pure Latin text
    doc.setFont('helvetica', 'normal');
    if (labelIsArabic) {
      doc.text(value, 190, y + 8, { align: 'right' });
      return 20;
    } else {
      doc.text(value, x + 40, y);
      return 12;
    }
  }
};

/**
 * Add multi-line text with proper word wrap and bidirectional support
 */
const addMultiLineText = (doc, text, x, y, maxWidth) => {
  if (!text) text = 'N/A';
  
  const isFullyRTL = isPureArabic(text);
  const hasMixedContent = containsArabic(text) && !isFullyRTL;
  
  if (isFullyRTL) {
    // Pure Arabic text - right-aligned
    const processedText = prepareText(text, true);
    doc.setFont('Amiri', 'normal');
    const lines = doc.splitTextToSize(processedText, maxWidth);
    
    lines.forEach((line, index) => {
      doc.text(line, 190, y + (index * 7), { align: 'right' });
    });
    
    return lines.length * 7;
  } else if (hasMixedContent) {
    // Mixed content - left-aligned with Arabic reshaping
    const processedText = prepareText(text, false);
    doc.setFont('Amiri', 'normal');
    const lines = doc.splitTextToSize(processedText, maxWidth);
    
    lines.forEach((line, index) => {
      doc.text(line, x, y + (index * 7));
    });
    
    return lines.length * 7;
  } else {
    // Pure Latin text - left-aligned
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line, index) => {
      doc.text(line, x, y + (index * 7));
    });
    
    return lines.length * 7;
  }
};

/**
 * Generate PDF for form submission with Arabic title and labels
 * @param {Object} data - Submission data from API
 */
export const generateSubmissionPDF = async (data) => {
  if (!data || !data._id) {
    throw new Error('Invalid submission data received');
  }

  // Create new PDF document
  const doc = new jsPDF();
  
  // Add Arabic font support
  doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'bold');
  
  // Header with colored background
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Title in Arabic
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('Amiri', 'bold');
  const arabicTitle = prepareText('المعلومات الشخصية للمستخدم', true);
  doc.text(arabicTitle, 105, 22, { align: 'center' });
  
  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  
  let yPos = 50;
  
  // Submission ID (optional - currently commented out in your code)
/*   doc.setFont('Amiri', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const idLabel = prepareText(': رقم التسجيل', true);
  doc.text(`${idLabel} ${data._id}`, 190, yPos, { align: 'right' });
  yPos += 15; */
  
  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;
  
  // Reset color for main content
  doc.setTextColor(0, 0, 0);
  
  // Name field with Arabic label
  yPos += addField(doc, ': الإسم و اللقب', data.name, 20, yPos);
  yPos += 5;
  
  // Email field with Arabic label
  yPos += addField(doc, ': البريد الإلكتروني', data.email, 20, yPos);
  yPos += 5;
  
  // Phone field with Arabic label
  yPos += addField(doc, ': رقم الهاتف', data.phone, 20, yPos);
  yPos += 15;
  
  // Message section (if exists)
/*   if (data.message) {
    const messageLabel = prepareText('الرسالة:', true);
    doc.setFont('Amiri', 'bold');
    doc.setFontSize(12);
    doc.text(messageLabel, 190, yPos, { align: 'right' });
    yPos += 8;
    
    const messageHeight = addMultiLineText(doc, data.message, 20, yPos, 170);
    yPos += messageHeight + 10;
  } */
  
  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  
  // Submission date with Arabic label
  doc.setFont('Amiri', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const submissionDate = new Date(data.createdAt).toLocaleString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const dateLabel = prepareText(': تاريخ التسجيل', true);
  doc.text(`${dateLabel} ${submissionDate}`, 190, yPos, { align: 'right' });
  
  // Footer in Arabic
   doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  const pageHeight = doc.internal.pageSize.height;
/* const footerText = prepareText('تم الإنشاء بواسطة تطبيق MERN', true);
  doc.setFont('Amiri', 'normal');
  doc.text(footerText, 105, pageHeight - 15, { align: 'center' }); */
  
  
  // Save the PDF
  doc.save(`form-submission-${data._id}.pdf`);
  
  return true;
};