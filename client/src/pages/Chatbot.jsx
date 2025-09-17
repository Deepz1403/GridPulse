import { useState, useRef, useEffect } from 'react';
import { MainNav } from "@/components/dashboard/Navbar";
import { Send, User, Bot, Clock, Info, Activity, Zap, Database, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ChatbotPage = () => {
  // State management
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('gridPulseChatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [gridStats, setGridStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  const API_BASE_URL = 'http://localhost:5000';
  
  const suggestedPrompts = [
    "What is the current power consumption at SS-5 substation?",
    "Show me voltage readings for both transformers in SS-4",
    "Which areas consume the most electricity in the hostels?",
    "Compare temperature trends between SS-4 and SS-5",
    "What happened to power consumption after February 28, 2024?",
    "Show me transformer status for both substations",
    "Which areas have the highest power consumption?",
    "What are the current voltage and temperature readings?"
  ];

  // Initialize chat with simplified API calls
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const healthCheck = await axios.get(`${API_BASE_URL}/health`);
        console.log('Backend health:', healthCheck.data);
        
        const newConversationId = 'conv_' + Date.now();
        setConversationId(newConversationId);
        localStorage.setItem('gridPulseConversationId', newConversationId);
        
        try {
          const statsResponse = await axios.get(`${API_BASE_URL}/grid/status`);
          if (statsResponse.data) {
            setGridStats({
              total_records: Object.values(statsResponse.data.collections || {})
                .reduce((sum, col) => sum + (col.document_count || 0), 0),
              substations: 2,
              ss4_readings: statsResponse.data.collections?.ss4_data?.document_count || 0,
              ss5_readings: statsResponse.data.collections?.ss5_data?.document_count || 0,
              attendants: statsResponse.data.collections?.attendants?.document_count || 0,
              latest_readings: {
                ss4: statsResponse.data.latest_readings?.ss4 || null,
                ss5: statsResponse.data.latest_readings?.ss5 || null
              }
            });
          }
        } catch (statsError) {
          console.warn('Could not load grid stats:', statsError);
          setGridStats({
            total_records: 0,
            substations: 2,
            ss4_readings: 0,
            ss5_readings: 0,
            attendants: 0,
            latest_readings: { ss4: null, ss5: null }
          });
        }
        
        if (messages.length === 0) {
          const welcomeMessage = {
            text: `🔌 **Welcome to Grid Pulse Assistant!**

I can help you analyze power consumption, transformer performance, and electrical infrastructure data from:

**🏢 SS-5 Substation**: Academic buildings, chillers, data center, hostels
**🏠 SS-4 Substation**: Hostel areas, water pumps, residential facilities

**📊 System Status**: Backend Connected ✅

What would you like to know about the electrical grid?`,
            user: false,
            timestamp: new Date(),
            type: 'welcome'
          };
          
          setMessages([welcomeMessage]);
        }
        
      } catch (error) {
        console.error('Initialization error:', error);
        setError(`Failed to connect to backend: ${error.response?.data?.error || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('gridPulseChatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage = {
      text: input,
      user: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        query: currentInput
      });
      
      console.log('Chat Response:', response.data);
      
      const botMessage = {
        text: response.data.response || 'No response received',
        user: false,
        timestamp: new Date(),
        sources: response.data.sources || [],
        metadata: {
          collections_searched: response.data.collections_searched || [],
          total_documents: response.data.total_documents_available || 0
        }
      };
      
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorText = "Sorry, I encountered an error processing your request.";
      if (error.response?.status === 500) {
        errorText = "Backend server error. Please check if the Flask server is running.";
      } else if (error.response?.data?.error) {
        errorText = `Error: ${error.response.data.error}`;
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        errorText = "Cannot connect to backend server. Please ensure Flask server is running on http://localhost:5000";
      }
      
      const errorMessage = {
        text: errorText,
        user: false,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    setInput(prompt);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('gridPulseChatMessages');
    localStorage.removeItem('gridPulseConversationId');
    setConversationId(null);
    window.location.reload();
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-800 text-cyan-300 px-2 py-1 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br />');
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-900">
        <MainNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="text-slate-300">Connecting to Grid Assistant...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="flex h-screen bg-slate-900">
        <MainNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4 p-6 bg-slate-800 border border-red-500/30 rounded-lg max-w-md mx-4">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Connection Error</h3>
              <p className="text-slate-300 text-sm mb-4">{error}</p>
              <div className="text-xs text-slate-400 bg-slate-700 p-3 rounded mb-4">
                <strong className="text-red-400">Troubleshooting:</strong>
                <br />1. Make sure Flask server is running: <code className="text-cyan-300">python app.py</code>
                <br />2. Check if http://localhost:5000 is accessible
                <br />3. Verify CORS is enabled in Flask
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 w-full">
      <MainNav />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Grid Pulse Assistant</h1>
                  <p className="text-slate-400">AI-powered electrical grid data analysis</p>
                </div>
              </div>
              
              {gridStats && (
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300">{gridStats.total_records} records</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300">{gridStats.substations} substations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400">Connected</span>
                  </div>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Info className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Settings Panel */}
            {showSettings && gridStats && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 border border-slate-600 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-cyan-400" />
                      SS-5 Substation
                    </h3>
                    <p className="text-sm text-slate-400">Academic buildings, chillers, data center</p>
                    <p className="text-xs text-slate-500 mt-1">{gridStats.ss5_readings} readings</p>
                  </div>
                  <div className="bg-slate-700/50 border border-slate-600 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-green-400" />
                      SS-4 Substation
                    </h3>
                    <p className="text-sm text-slate-400">Hostel areas, water pumps</p>
                    <p className="text-xs text-slate-500 mt-1">{gridStats.ss4_readings} readings</p>
                  </div>
                  <div className="bg-slate-700/50 border border-slate-600 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2 text-purple-400" />
                      System Info
                    </h3>
                    <p className="text-sm text-slate-400">Attendants: {gridStats.attendants}</p>
                    <button
                      onClick={clearChat}
                      className="mt-2 text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      Clear Chat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.user ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-4xl ${message.user ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-3 ${message.user ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.user 
                          ? 'bg-cyan-600' 
                          : message.type === 'error' 
                            ? 'bg-red-600' 
                            : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                      }`}>
                        {message.user ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className={`flex flex-col ${message.user ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-lg px-4 py-3 max-w-full ${
                          message.user 
                            ? 'bg-cyan-600 text-white' 
                            : message.type === 'error'
                              ? 'bg-red-900/30 text-red-200 border border-red-700/50'
                              : 'bg-slate-800 text-slate-100 border border-slate-700'
                        }`}>
                          <div 
                            className="prose prose-sm max-w-none text-inherit [&>*]:mb-2 [&>*:last-child]:mb-0 [&>strong]:text-white [&>em]:text-slate-300"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                          />
                          
                          {/* Sources Display */}
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-600">
                              <p className="text-xs font-semibold text-slate-300 mb-2 flex items-center">
                                <Database className="w-3 h-3 mr-1" />
                                Data Sources ({message.sources.length}):
                              </p>
                              <div className="space-y-1">
                                {message.sources.slice(0, 3).map((source, idx) => (
                                  <div key={idx} className="text-xs text-slate-300 bg-slate-700/50 rounded px-2 py-1 border border-slate-600">
                                    <div className="flex items-center justify-between">
                                      <strong className="text-cyan-300">
                                        {source.collection?.toUpperCase().replace('_', '-')}
                                      </strong>
                                      <span className="text-slate-400">
                                        {(source.similarity * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                    {source.date && (
                                      <div className="text-slate-400">📅 {source.date}</div>
                                    )}
                                    {source.temperature && (
                                      <div className="text-slate-400">🌡️ {source.temperature}°C</div>
                                    )}
                                  </div>
                                ))}
                                {message.sources.length > 3 && (
                                  <div className="text-xs text-slate-400 text-center py-1">
                                    ... and {message.sources.length - 3} more sources
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Metadata Display */}
                          {message.metadata && message.metadata.collections_searched && (
                            <div className="mt-2 pt-2 border-t border-slate-600">
                              <div className="text-xs text-slate-400">
                                Searched: {message.metadata.collections_searched.join(', ')}
                                {message.metadata.total_documents > 0 && (
                                  <span> | {message.metadata.total_documents} total documents</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
                      <div className="flex space-x-1 items-center">
                        <span className="text-sm text-slate-300">Analyzing grid data</span>
                        <div className="flex space-x-1 ml-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested Prompts */}
          {messages.length <= 1 && (
            <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
              <div className="max-w-6xl mx-auto">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Try asking about your grid data:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="text-left text-sm text-slate-300 hover:text-cyan-300 hover:bg-slate-700/50 p-3 rounded-lg border border-slate-600 hover:border-cyan-500/50 transition-all disabled:opacity-50"
                      disabled={isTyping}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-slate-700 bg-slate-800">
            <div className="max-w-6xl mx-auto">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about power consumption, voltage readings, transformers, or grid status..."
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-colors text-slate-100 placeholder-slate-400"
                    rows="2"
                    disabled={isTyping}
                  />
                  <div className="absolute bottom-1 right-1 text-xs text-slate-500">
                    {input.length > 0 && `${input.length} chars`}
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2 min-w-[100px] justify-center"
                >
                  {isTyping ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Connection Status */}
              <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Connected to Grid Assistant Backend</span>
                </div>
                {conversationId && (
                  <span>Session: {conversationId}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
