import { useState, useEffect, useRef } from 'react';
import { X, Minimize2, Maximize2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Floating Answer Overlay
 * Displays AI answers in a floating window that stays visible during screen share
 * Uses high z-index to ensure visibility
 */
export default function FloatingAnswerOverlay({ answer, isVisible, onClose }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  // Ensure overlay stays on screen
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 400),
        y: Math.min(prev.y, window.innerHeight - 200)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e) => {
    // Don't start dragging if clicking on buttons
    if (e.target.closest('button')) return;
    
    // Allow dragging from header area or content area
    const isHeaderClick = e.target.closest('.overlay-header');
    const isContentClick = e.target.closest('.overlay-content');
    
    if (isHeaderClick || isContentClick) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      e.preventDefault(); // Prevent text selection while dragging
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;

      // Keep within bounds
      setPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - 400)),
        y: Math.max(0, Math.min(newY, window.innerHeight - (isMinimized ? 60 : 300)))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, isMinimized]);

  const copyToClipboard = async () => {
    if (!answer) return;
    
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      toast.success('Answer copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-[99999] shadow-2xl select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        cursor: isDragging ? 'grabbing' : 'move',
        pointerEvents: 'auto',
        transition: isDragging ? 'none' : 'none' // No transition while dragging for smooth movement
      }}
    >
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg border-2 border-white/30 backdrop-blur-md">
        {/* Header - Draggable area */}
        <div 
          className="overlay-header flex items-center justify-between p-3 bg-black/40 rounded-t-lg border-b border-white/20 cursor-move hover:bg-black/50 transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2 flex-1" style={{ pointerEvents: 'none' }}>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-semibold">InterviewAce AI Assistant</span>
            <span className="text-xs text-gray-400 ml-2">(Drag to move)</span>
          </div>
          <div className="flex items-center gap-1" style={{ pointerEvents: 'auto' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard();
              }}
              disabled={!answer}
              className="p-1.5 hover:bg-white/20 rounded transition-colors disabled:opacity-50 cursor-pointer"
              title="Copy answer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="p-1.5 hover:bg-white/20 rounded transition-colors cursor-pointer"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4 text-white" />
              ) : (
                <Minimize2 className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 hover:bg-red-600/50 rounded transition-colors cursor-pointer"
              title="Close overlay"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content - Also draggable */}
        {!isMinimized && (
          <div 
            className="overlay-content p-4 max-h-[300px] overflow-y-auto cursor-move"
            onMouseDown={handleMouseDown}
          >
            {answer ? (
              <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {answer}
              </div>
            ) : (
              <div className="text-gray-400 text-sm text-center py-8">
                <div className="animate-pulse">Waiting for answer...</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 bg-black/50 px-2 py-1 rounded pointer-events-none">
          Dragging...
        </div>
      )}
      
      {/* Visual drag handle indicator */}
      {!isDragging && (
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full opacity-50"></div>
      )}
    </div>
  );
}
