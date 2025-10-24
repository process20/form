// src/components/FormComponent.jsx
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { submitForm, downloadSubmission } from '../services/api';
import { generateSubmissionPDF } from '../utils/pdfGenerator';
import { showLoading, dismiss, showSuccess, showError } from '../utils/toastHelpers';
import './FormComponent.css';

const FormComponent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Remove download button when user starts editing
    if (savedId) {
      setSavedId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = showLoading('Submitting form...');

    try {
      const response = await submitForm(formData);
      
      dismiss(loadingToast);
      showSuccess(response.message || 'Form submitted successfully!');

      setSavedId(response.data._id);

      setFormData({
        name: '',
        email: '',
        phone: '',
      });
    } catch (error) {
      dismiss(loadingToast);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!savedId) {
      showError('No submission to download');
      return;
    }

    const downloadToast = showLoading('Generating PDF...');

    try {
      const response = await downloadSubmission(savedId);
      const data = response.success ? response.data : response;
      
      if (!data || !data._id) {
        throw new Error('Invalid submission data received');
      }
      
      await generateSubmissionPDF(data);
      
      dismiss(downloadToast);
      showSuccess('PDF downloaded successfully!', '📄');
      
      setSavedId(null);
    } catch (error) {
      console.error('Download error:', error);
      dismiss(downloadToast);
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={15}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />

      <div className="form-card">
        <h1>إستمارة المعلومات</h1>
        <p className="subtitle">يرجى ملى إستمارة المعلومات الشخصية</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">الإسم و اللقب</label>
            <input
              type="text"
              id="name"
              name="name"
              
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">البريد الالكتروني</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">رقم الهاتف</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              required
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '... تسجيل' : 'تسجيل'}
            </button>

            {savedId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDownload}
                disabled={loading}
              >
                📄 تحميل الإستمارة
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormComponent;