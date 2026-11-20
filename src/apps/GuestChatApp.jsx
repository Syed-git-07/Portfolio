import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, MessageSquare, Users, Wifi, WifiOff, Loader2 } from 'lucide-react';
import './GuestChatApp.css';

const NTFY_TOPIC = 'syed_sufyan_portfolio_public_chat_v1';
const NTFY_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

export default function GuestChatApp({ embedMode = false }) {
  const [username, setUsername] = useState(() => localStorage.getItem('guest_chat_username') || '');
  const [tempName, setTempName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showUsersList, setShowUsersList] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Generate a distinct soft color for each user based on their name hash
  const getUserColor = (name) => {
    if (!name) return '#a0a0a0';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#ff8a80', '#ff80ab', '#ea80fc', '#b388ff', '#8c9eff', 
      '#82b1ff', '#80d8ff', '#84ffff', '#a7ffeb', '#b9f6ca', 
      '#ffe57f', '#ffd180', '#ff9e80'
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Compile unique active users list from messages sent in the last 24 hours
  const activeUsers = useMemo(() => {
    const list = new Set();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    messages.forEach((msg) => {
      if (msg.timestamp && msg.timestamp > cutoff && msg.sender) {
        list.add(msg.sender);
      }
    });
    return Array.from(list);
  }, [messages]);

  // Connect to the real-time server (SSE) and load history
  const connectToChat = async (selectedName) => {
    if (!selectedName || selectedName.trim() === '') return;
    const name = selectedName.trim();
    setUsername(name);
    localStorage.setItem('guest_chat_username', name);
    setIsConnecting(true);
    setIsLoadingHistory(true);

    try {
      // 1. Fetch cached message history from ntfy.sh
      const historyRes = await fetch(`${NTFY_URL}/json?since=all`);
      if (historyRes.ok) {
        const text = await historyRes.text();
        const lines = text.trim().split('\n');
        const loadedMessages = lines
          .map((line) => {
            if (!line.trim()) return null;
            try {
              const ntfyData = JSON.parse(line);
              // ntfy messages hold our payload inside ntfyData.message
              const payload = JSON.parse(ntfyData.message);
              return {
                ...payload,
                isMe: payload.sender === name,
              };
            } catch {
              return null;
            }
          })
          .filter((msg) => msg !== null && msg.id && msg.sender);

        // Sort by timestamp
        loadedMessages.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(loadedMessages);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }

    // 2. Open EventSource for real-time notifications
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource(`${NTFY_URL}/sse`);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
      };

      es.onmessage = (event) => {
        try {
          const ntfyData = JSON.parse(event.data);
          if (ntfyData.event === 'message' && ntfyData.message) {
            const payload = JSON.parse(ntfyData.message);
            
            // Deduplicate (in case it's our own message that got sent back, or a duplicate)
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.id)) {
                return prev;
              }
              return [...prev, { ...payload, isMe: payload.sender === name }];
            });
          }
        } catch (err) {
          // Ignore invalid messages/system messages
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (err) {
      console.error('SSE connection error:', err);
      setIsConnecting(false);
      setIsConnected(false);
    }
  };

  // Disconnect from SSE
  const disconnectChat = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  };

  // Connect automatically if username is already saved in localStorage
  useEffect(() => {
    if (username) {
      connectToChat(username);
    }
    return () => {
      disconnectChat();
    };
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      connectToChat(tempName);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const msgObj = {
      id: msgId,
      sender: username,
      text: text,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Optimistically insert locally
    setMessages((prev) => {
      if (prev.some((m) => m.id === msgId)) return prev;
      return [...prev, { ...msgObj, isMe: true }];
    });

    try {
      await fetch(NTFY_URL, {
        method: 'POST',
        body: JSON.stringify(msgObj),
      });
    } catch (err) {
      console.error('Failed to send public chat message:', err);
    }
  };

  const handleLeaveChat = () => {
    disconnectChat();
    setUsername('');
    setTempName('');
    localStorage.removeItem('guest_chat_username');
    setMessages([]);
  };

  // Login view: Screen Name Setup
  if (!username) {
    return (
      <div className={`chat-setup-container ${embedMode ? 'embed' : ''}`}>
        <div className="chat-setup-card">
          <div className="chat-setup-icon-wrap">
            <MessageSquare size={36} className="chat-setup-icon" />
          </div>
          <h2>Join Public Guest Chat</h2>
          <p>Connect with anyone currently viewing this portfolio online in real time.</p>
          <form onSubmit={handleJoin} className="chat-setup-form">
            <input
              type="text"
              placeholder="Choose a nickname..."
              maxLength={15}
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="chat-setup-input"
              autoFocus
            />
            <button type="submit" className="chat-setup-btn" disabled={!tempName.trim()}>
              Join Chatroom
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-room-container ${embedMode ? 'embed' : ''}`}>
      {/* Header bar */}
      <div className="chat-header">
        <div className="chat-status-info">
          <div className={`status-indicator ${isConnected ? 'online' : isConnecting ? 'connecting' : 'offline'}`}>
            {isConnected ? (
              <Wifi size={14} className="status-icon" />
            ) : isConnecting ? (
              <Loader2 size={14} className="status-icon spin" />
            ) : (
              <WifiOff size={14} className="status-icon" />
            )}
            <span className="status-dot-pulse" />
          </div>
          <div className="chat-title-details">
            <h3>Public Guest Chat</h3>
            <p>
              {isConnected ? (
                `Connected as ${username}`
              ) : isConnecting ? (
                'Connecting to live feed...'
              ) : (
                'Disconnected'
              )}
            </p>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            type="button"
            className={`chat-header-btn ${showUsersList ? 'active' : ''}`}
            onClick={() => setShowUsersList(!showUsersList)}
            title="Show Active Users"
          >
            <Users size={16} />
            <span className="active-users-count">{activeUsers.length}</span>
          </button>
          <button
            type="button"
            className="chat-leave-btn"
            onClick={handleLeaveChat}
            title="Leave Chatroom"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="chat-body">
        {/* Active users sidebar (overlay or panel) */}
        {showUsersList && (
          <div className="chat-users-panel">
            <div className="chat-users-panel-header">
              <h4>Active Chatters (24h)</h4>
            </div>
            <div className="chat-users-list">
              {activeUsers.length === 0 ? (
                <p className="no-users-text">No active chatters found.</p>
              ) : (
                activeUsers.map((user) => (
                  <div key={user} className="chat-user-item">
                    <span 
                      className="chat-user-avatar-dot" 
                      style={{ backgroundColor: getUserColor(user) }}
                    />
                    <span className="chat-user-item-name">{user}</span>
                    {user === username && <span className="you-badge">(You)</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Message Log */}
        <div className="chat-messages-log">
          {isLoadingHistory ? (
            <div className="chat-log-loading">
              <Loader2 size={24} className="spin loading-spinner" />
              <span>Restoring chat history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-log-empty">
              <MessageSquare size={36} className="empty-chat-icon" />
              <h4>No messages yet</h4>
              <p>Be the first to say hello in this public room!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`chat-message-row ${msg.isMe ? 'msg-me' : 'msg-other'}`}
              >
                {!msg.isMe && (
                  <span 
                    className="chat-message-sender"
                    style={{ color: getUserColor(msg.sender) }}
                  >
                    {msg.sender}
                  </span>
                )}
                <div className="chat-message-bubble">
                  <p className="chat-message-text">{msg.text}</p>
                  <span className="chat-message-time">{msg.time}</span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <form onSubmit={handleSendMessage} className="chat-input-bar">
        <input
          type="text"
          placeholder={isConnected ? "Type a message..." : "Waiting for connection..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={!isConnected}
          className="chat-text-input"
          maxLength={300}
        />
        <button 
          type="submit" 
          disabled={!isConnected || !inputText.trim()} 
          className="chat-send-btn"
          title="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
