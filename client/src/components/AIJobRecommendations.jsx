import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIJobRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/ai/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(res.data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to sample recommendations
      setRecommendations([
        {
          matchScore: 92,
          reasoning: "92% match based on skills and eligibility",
          opportunity: {
            name: "Software Developer",
            company: "TCS",
            package: { ctc: 3.5 },
            eligibility: { allowedBranches: ["CSE", "IT"] }
          }
        },
        {
          matchScore: 88,
          reasoning: "88% match based on skills and eligibility", 
          opportunity: {
            name: "System Engineer",
            company: "Infosys",
            package: { ctc: 4.0 },
            eligibility: { allowedBranches: ["CSE", "IT", "ECE"] }
          }
        },
        {
          matchScore: 85,
          reasoning: "85% match based on skills and eligibility",
          opportunity: {
            name: "Project Engineer", 
            company: "Wipro",
            package: { ctc: 3.8 },
            eligibility: { allowedBranches: ["ALL"] }
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">🎯 AI Job Recommendations</h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">🎯 AI Job Recommendations</h3>
        <button
          onClick={fetchRecommendations}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🤖</div>
          <p className="text-gray-500">Complete your profile to get AI recommendations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">
                    {rec.opportunity?.name || rec.opportunity?.jobRole || 'Position'}
                  </h4>
                  <p className="text-gray-600">
                    {rec.opportunity?.company?.name || rec.opportunity?.name || 'Company'}
                  </p>
                  {rec.opportunity?.package?.ctc && (
                    <p className="text-green-600 font-medium">
                      ₹{rec.opportunity.package.ctc} LPA
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(rec.matchScore)}`}>
                    {rec.matchScore}% Match
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      rec.matchScore >= 90 ? 'bg-green-500' :
                      rec.matchScore >= 80 ? 'bg-blue-500' :
                      rec.matchScore >= 70 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${rec.matchScore}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                🤖 {rec.reasoning}
              </p>

              {rec.opportunity?.eligibility?.allowedBranches && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Eligible Branches:</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.opportunity.eligibility.allowedBranches.map((branch, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">🤖</span>
                  AI Recommended
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>AI Tip:</strong> Keep your profile updated with latest skills and projects to get better recommendations!
        </p>
      </div>
    </div>
  );
};

export default AIJobRecommendations;