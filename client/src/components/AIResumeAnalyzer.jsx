import React, { useState } from 'react';
import axios from 'axios';

const AIResumeAnalyzer = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx'))) {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF or DOC file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const analyzeResume = async () => {
    if (!file) return;

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/ai/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setAnalysis(res.data.analysis);
      if (onAnalysisComplete) {
        onAnalysisComplete(res.data.analysis);
      }
    } catch (error) {
      alert('Analysis failed: ' + (error.response?.data?.msg || 'Unknown error'));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">🤖 AI Resume Analyzer</h3>
      
      {!analysis ? (
        <div>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          >
            {file ? (
              <div>
                <div className="text-4xl mb-2">📄</div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-gray-600 mb-2">
                  Drop your resume here or{' '}
                  <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                    browse files
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX files only</p>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={analyzeResume}
                disabled={analyzing}
                className={`px-6 py-2 rounded-lg font-medium ${
                  analyzing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {analyzing ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </span>
                ) : (
                  '🤖 Analyze with AI'
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Overall Resume Score</h4>
              <div className="text-2xl font-bold text-blue-600">
                {analysis.feedback.overallScore}/100
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${analysis.feedback.overallScore}%` }}
              ></div>
            </div>
          </div>

          {/* Extracted Skills */}
          <div>
            <h4 className="font-semibold mb-2">🎯 Extracted Skills</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.extractedData.skills.map((skill, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div>
            <h4 className="font-semibold mb-2 text-green-600">✅ Strengths</h4>
            <ul className="space-y-1">
              {analysis.feedback.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-gray-700">• {strength}</li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div>
            <h4 className="font-semibold mb-2 text-orange-600">🔧 Improvements</h4>
            <ul className="space-y-1">
              {analysis.feedback.improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-gray-700">• {improvement}</li>
              ))}
            </ul>
          </div>

          {/* Missing Skills */}
          <div>
            <h4 className="font-semibold mb-2 text-red-600">❌ Missing Skills</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.feedback.missingSkills.map((skill, index) => (
                <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold mb-2 text-blue-600">💡 AI Recommendations</h4>
            <ul className="space-y-2">
              {analysis.feedback.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => { setAnalysis(null); setFile(null); }}
            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            Analyze Another Resume
          </button>
        </div>
      )}
    </div>
  );
};

export default AIResumeAnalyzer;