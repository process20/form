const express = require('express');
const FormData = require('../models/FormData');
const router = express.Router();
const User = require('../models/FormData');
// POST - Create new form submission
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Create new form data
    const user = new User({
      name,
      email,
      phone,
    });

    // Save to database
    const savedData = await user.save();

    res.status(201).json({
      success: true,
      message: 'تم التسجيل بنجاح',
      data: savedData
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'خطأ, يرجى إعادة ملئ البيانات بشكل صحيح',
        errors: messages
      });
    }
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Database error occurred',
      error: error.message
    });
  }
});

// GET - Retrieve all form submissions
router.get('/submissions', async (req, res) => {
  try {
    const submissions = await FormData.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
});


// GET - Download form submission as JSON
router.get('/download/:id', async (req, res) => {
  try {
    const formData = await FormData.findById(req.params.id);
    
    if (!formData) {
      return res.status(404).json({
        success: false,
        message: 'إستمارة التسجيل غير موجودة'
      });
    }

    // Return the data as JSON for frontend PDF generation
    res.status(200).json({
      success: true,
      data: formData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحميل الإستمارة',
      error: error.message
    });
  }
});
module.exports = router;
