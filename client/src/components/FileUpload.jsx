import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess, acceptedTypes = '.pdf', maxSize = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload only PDF files');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size should be less than ${maxSize}MB`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/students/upload-resume', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      onUploadSuccess(res.data);
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.msg || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      {uploading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Uploading...</p>
        </div>
      ) : (
        <div>
          <div className="text-4xl mb-2">📄</div>
          <p className="text-gray-600 mb-2">
            Drag and drop your resume here, or{' '}
            <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
              browse files
              <input
                type="file"
                accept={acceptedTypes}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">
            PDF files only, max {maxSize}MB
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;