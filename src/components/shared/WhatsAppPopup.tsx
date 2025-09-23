import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot } from 'lucide-react';

// Define the structure for a chat message
interface ChatMessage {
  id: number;
  text: string | React.ReactNode;
  sender: 'bot' | 'user';
}

// Props for the component, so you can easily change the phone number
interface WhatsAppPopupProps {
  phoneNumber: string;
  message?: string; // This is now a base message, the user's input will be appended
}

export default function WhatsAppPopup({ phoneNumber, message = "Hello! I'm interested in your products." }: WhatsAppPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(false); // NEW: Controls visibility of the text input
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize the chat with a welcome message when the popup opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: (
            <div>
              <p className="font-bold mb-2">Welcome to Siddhi Divine! 🙏</p>
              <p>How can we help you today?</p>
            </div>
          )
        },
        {
          id: 2,
          sender: 'bot',
          text: <ChatOptions handleOptionClick={handleOptionClick} />
        }
      ]);
    }
  }, [isOpen]); // Simplified dependency array

  // Main logic for the automated chat flow
  const handleOptionClick = (option: 'track' | 'product_info' | 'support') => {
    const userMessageText = option === 'track' ? "Track my order" : option === 'product_info' ? "Product information" : "Talk to support";
    const userMessage: ChatMessage = { id: Date.now(), sender: 'user', text: userMessageText };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      let botResponse: ChatMessage;
      switch (option) {
        case 'track':
          botResponse = { id: Date.now() + 1, sender: 'bot', text: "Please provide your Order ID on the tracking page. You can find it under 'My Account' -> 'My Orders'." };
          setMessages(prev => [...prev, botResponse]);
          break;
        case 'product_info':
          botResponse = { id: Date.now() + 1, sender: 'bot', text: "Of course! Could you please tell me the name of the product you are interested in?" };
          setMessages(prev => [...prev, botResponse]);
          setShowInput(true); // NEW: Show the text input
          break;
        case 'support':
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          botResponse = {
            id: Date.now() + 1,
            sender: 'bot',
            text: <DirectSupportLink whatsappUrl={whatsappUrl} />
          };
          setMessages(prev => [...prev, botResponse]);
          break;
      }
    }, 500);
  };

  // NEW: Function to handle the user typing and sending a message
  const handleSendMessage = () => {
    if (userInput.trim() === '') return;

    const userMessage: ChatMessage = { id: Date.now(), sender: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);

    // Construct the final WhatsApp message URL with the user's specific query
    const finalMessage = `${message}\n\nMy Question: ${userInput}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;

    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: <DirectSupportLink whatsappUrl={whatsappUrl} />
      };
      setMessages(prev => [...prev, botResponse]);
      setShowInput(false); // Hide input after sending
      setUserInput(''); // Clear input
    }, 500);
  };

  return (
    <>
      <style>{`
        /* ... existing animation styles ... */
        @keyframes heartbeat { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 10px 0px rgba(37, 211, 102, 0.7); } 50% { box-shadow: 0 0 20px 10px rgba(37, 211, 102, 0.5); } }
        .animate-heartbeat { animation: heartbeat 1.5s ease-in-out infinite; }
        .animate-glow { animation: glow 2.5s ease-in-out infinite; }
      `}</style>

      <div className={`fixed bottom-24 right-5 z-50 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-80 h-[28rem] bg-white rounded-lg shadow-2xl flex flex-col">
          {/* Header (green theme) */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Siddhi Divine Support</h3>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-75"><X size={20} /></button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map(msg => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* NEW: Text Input Area */}
          {showInput && (
            <div className="p-2 border-t bg-white flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
                className="flex-1 w-full px-3 py-2 text-sm border-gray-300 rounded-full focus:ring-green-500 focus:border-green-500"
              />
              <button onClick={handleSendMessage} className="w-10 h-10 bg-green-500 text-white rounded-full flex-shrink-0 flex items-center justify-center hover:bg-green-600">
                <Send size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Action Button (green theme) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl animate-heartbeat animate-glow"
        aria-label="Open Chat"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </>
  );
}

// Reusable component for the final WhatsApp link
const DirectSupportLink = ({ whatsappUrl }: { whatsappUrl: string }) => (
  <div>
    <p>No problem! We're connecting you to our support team.</p>
    <p className="mt-2">Please click the button below to start your chat on WhatsApp.</p>
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-block mt-3 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
    >
      Chat on WhatsApp
    </a>
  </div>
);

const ChatOptions = ({ handleOptionClick }: { handleOptionClick: (option: 'track' | 'product_info' | 'support') => void }) => (
  <div className="flex flex-col gap-2 mt-2">
    <button onClick={() => handleOptionClick('track')} className="text-left text-sm text-green-700 font-semibold p-2 rounded-md bg-green-500/10 hover:bg-green-500/20 transition-colors">Track my order</button>
    <button onClick={() => handleOptionClick('product_info')} className="text-left text-sm text-green-700 font-semibold p-2 rounded-md bg-green-500/10 hover:bg-green-500/20 transition-colors">Product information</button>
    <button onClick={() => handleOptionClick('support')} className="text-left text-sm text-green-700 font-semibold p-2 rounded-md bg-green-500/10 hover:bg-green-500/20 transition-colors">Talk to support</button>
  </div>
);

const ChatMessageBubble = ({ message }: { message: ChatMessage }) => {
  const isBot = message.sender === 'bot';
  return (
    <div className={`flex items-end gap-2 mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0"><Bot size={18} className="text-green-600" /></div>}
      <div className={`max-w-[80%] p-3 rounded-xl ${isBot ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 'bg-green-600 text-white rounded-br-none'}`}>
        <div className="text-sm">{message.text}</div>
      </div>
      {!isBot && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><User size={18} className="text-gray-600" /></div>}
    </div>
  );
};

