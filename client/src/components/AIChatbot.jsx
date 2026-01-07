import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AIChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState('default');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
      // Add welcome message if no history
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: "👋 **Welcome to MBM Career Assistant!**\n\nI'm here to help you with:\n\n💼 **Job Recommendations** - Find perfect matches\n📄 **Resume Tips** - Improve your profile\n🎯 **Interview Prep** - Ace your interviews\n📈 **Application Status** - Track your progress\n\nWhat would you like to explore today?",
          timestamp: new Date()
        }]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/ai/chat-history/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.messages.length > 0) {
        setMessages(res.data.messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/ai/chat', {
        message: inputMessage,
        sessionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const assistantMessage = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "💼 Best jobs for me?",
    "📄 Resume tips?",
    "📈 Application status?",
    "🎯 Interview prep?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Career Assistant</h3>
            <p className="text-xs opacity-90">Your Placement Guide</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-2xl font-bold transition-colors duration-200"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl shadow-md ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="p-2 border-t">
          <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
          <div className="grid grid-cols-2 gap-1">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded text-left"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="💬 Type your question here..."
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            rows="2"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 font-semibold shadow-lg"
          >
            🚀 Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;