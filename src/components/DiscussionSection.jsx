import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, LogIn, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const DiscussionSection = ({ movieId, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const savedDiscussions = localStorage.getItem(`discussions_${movieId}`);
    if (savedDiscussions) {
      setMessages(JSON.parse(savedDiscussions));
    } else {
      setMessages([]);
    }
  }, [movieId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setIsSubmitting(true);
    
    const message = {
      id: Date.now(),
      username: user.name || user.email.split('@')[0],
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      userId: user.id,
      fullTimestamp: Date.now()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(`discussions_${movieId}`, JSON.stringify(updatedMessages));
    
    setNewMessage('');
    
    setTimeout(() => {
      setIsSubmitting(false);
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="mt-0 space-y-6">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <MessageCircle className="text-[#C50337]" size={24} />
        <h2 className="text-2xl font-bold text-white">Discussion</h2>
        <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded-full text-xs font-medium">
          {messages.length}
        </span>
      </div>

      <div className="bg-[#021C4F]/10 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[550px] shadow-2xl">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}
              >
                <div className={`flex items-end gap-3 max-w-[85%] ${msg.userId === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                    msg.userId === user?.id ? 'bg-[#C50337] text-white shadow-lg shadow-crimson-900/20' : 'bg-[#021C4F] text-gray-400'
                  }`}>
                    {msg.username.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className={`p-3.5 rounded-2xl text-[13px] sm:text-sm leading-relaxed ${
                    msg.userId === user?.id 
                      ? 'bg-[#C50337]/20 text-white rounded-br-none border border-[#C50337]/20' 
                      : 'bg-white/5 text-gray-200 rounded-bl-none border border-white/5'
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5 pointer-events-none">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        msg.userId === user?.id ? 'text-[#C50337]' : 'text-gray-500'
                      }`}>
                        {msg.username}
                      </span>
                    </div>
                    {msg.text}
                  </div>
                </div>
                <div className={`mt-1.5 flex items-center gap-1 text-[10px] font-medium text-gray-600 ${msg.userId === user?.id ? 'mr-1' : 'ml-11'}`}>
                  <Clock size={10} />
                  {msg.timestamp}
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3 opacity-30">
              <MessageCircle size={40} strokeWidth={1.5} />
              <p className="text-sm font-medium">No messages in this chat yet</p>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/40 border-t border-white/10">
          {user ? (
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-[#010d26]/80 border border-white/10 rounded-full py-3 pl-5 pr-14 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C50337]/50 transition-all font-medium"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !newMessage.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#C50337] hover:bg-[#e50442] disabled:bg-gray-800 text-white rounded-full transition-all active:scale-90 flex items-center justify-center border border-white/10 shadow-lg"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-gray-400 mb-2 font-medium">Login to join the discussion</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#C50337] hover:text-[#e50442] transition-colors uppercase tracking-wider"
              >
                <LogIn size={14} />
                Login to join the discussion
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionSection;
