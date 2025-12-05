import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, Clock, TrendingUp, MessageSquare } from 'lucide-react';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/session');
      setSessions(response.data.data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="text-white text-center">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Interview Sessions</h1>

      {sessions.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 text-center">
          <p className="text-gray-200">No interview sessions yet.</p>
          <p className="text-gray-300 text-sm mt-2">
            Start your first interview session to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
              onClick={() => setSelectedSession(selectedSession === session._id ? null : session._id)}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(
                    session.status
                  )}`}
                >
                  {session.status}
                </span>
                <span className="text-gray-300 text-sm capitalize">{session.platform}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-300 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(session.startedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatDuration(session.duration || 0)}
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {session.questions?.length || 0} questions
                </div>
              </div>

              {session.summary && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center text-white mb-2">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span className="font-semibold">
                      Score: {session.summary.performanceScore || 'N/A'}%
                    </span>
                  </div>
                </div>
              )}

              {selectedSession === session._id && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <h3 className="text-white font-semibold mb-2">Questions & Answers</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {session.questions?.map((qa, index) => (
                      <div key={index} className="bg-black/30 rounded p-3">
                        <p className="text-yellow-300 text-sm mb-1">
                          <strong>Q:</strong> {qa.question}
                        </p>
                        <p className="text-white text-sm">
                          <strong>A:</strong> {qa.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

