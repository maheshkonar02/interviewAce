import { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, Copy, Check } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import '../index.css';

/**
 * Standalone Overlay Window Component
 * This component runs in a separate popup window and stays visible across all tabs/apps
 */
export default function OverlayWindow() {
  const [answer, setAnswer] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.screen.width - 420, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  // Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event) => {
      // Accept messages from same origin
      if (event.origin === window.location.origin) {
        if (event.data.type === 'UPDATE_ANSWER') {
          setAnswer(event.data.answer || '');
        } else if (event.data.type === 'SHOW_OVERLAY') {
          // Ensure window is visible
          window.focus();
        } else if (event.data.type === 'HIDE_OVERLAY') {
          // Optionally hide window
          // window.close(); // Uncomment if you want to close on hide
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request initial state from parent
    if (window.opener) {
      window.opener.postMessage({ type: 'OVERLAY_READY' }, window.location.origin);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const newX = e.screenX - dragStart.x;
      const newY = e.screenY - dragStart.y;

      setPosition({
        x: Math.max(0, Math.min(newX, window.screen.width - 400)),
        y: Math.max(0, Math.min(newY, window.screen.height - (isMinimized ? 60 : 300)))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, dragStart, isMinimized]);

  const copyToClipboard = async () => {
    if (!answer) return;
    
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        padding: 0
      }}>
      <div
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '400px',
          zIndex: 999999,
          cursor: isDragging ? 'grabbing' : 'move',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
      <div style={{
        background: 'linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%)',
        borderRadius: '8px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'move'
          }}
          onMouseDown={handleMouseDown}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, pointerEvents: 'none' }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#4ade80',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>InterviewAce AI Assistant</span>
            <span style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '8px' }}>(Drag to move)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', pointerEvents: 'auto' }}>
            <button
              onClick={copyToClipboard}
              disabled={!answer}
              style={{
                padding: '6px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px',
                opacity: answer ? 1 : 0.5
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
              title="Copy answer"
            >
              {copied ? (
                <Check style={{ width: '16px', height: '16px', color: '#4ade80' }} />
              ) : (
                <Copy style={{ width: '16px', height: '16px', color: 'white' }} />
              )}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              style={{
                padding: '6px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 style={{ width: '16px', height: '16px', color: 'white' }} />
              ) : (
                <Minimize2 style={{ width: '16px', height: '16px', color: 'white' }} />
              )}
            </button>
            <button
              onClick={() => window.close()}
              style={{
                padding: '6px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.5)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
              title="Close overlay"
            >
              <X style={{ width: '16px', height: '16px', color: 'white' }} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div 
            style={{
              padding: '16px',
              maxHeight: '300px',
              overflowY: 'auto',
              cursor: 'move'
            }}
            onMouseDown={handleMouseDown}
          >
            {answer ? (
              <div style={{
                color: 'white',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {answer}
              </div>
            ) : (
              <div style={{
                color: '#9ca3af',
                fontSize: '14px',
                textAlign: 'center',
                padding: '32px 0'
              }}>
                <div style={{ animation: 'pulse 2s infinite' }}>Waiting for answer...</div>
              </div>
            )}
          </div>
        )}
      </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: transparent !important;
            width: 100% !important;
            height: 100% !important;
          }
          #root {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
          }
        `}</style>
      </div>
    </div>
    </>
  );
}

