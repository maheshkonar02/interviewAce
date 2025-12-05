import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { Video, FileText, Zap, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, fetchUser } = useAuthStore();
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalQuestions: 0,
    averageScore: 0
  });

  useEffect(() => {
    fetchStats();
    // Refresh user data to get latest credits
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/session');
      const sessions = response.data.data.sessions || [];
      
      const totalQuestions = sessions.reduce((sum, session) => 
        sum + (session.questions?.length || 0), 0
      );
      
      const avgScore = sessions.length > 0
        ? sessions.reduce((sum, session) => 
            sum + (session.summary?.performanceScore || 0), 0
          ) / sessions.length
        : 0;

      setStats({
        totalSessions: sessions.length,
        totalQuestions,
        averageScore: Math.round(avgScore)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-200">
          Ready to ace your next interview? Let's get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Credits</p>
              <p className="text-3xl font-bold text-white">{user?.credits || 0}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Sessions</p>
              <p className="text-3xl font-bold text-white">{stats.totalSessions}</p>
            </div>
            <Video className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Avg Performance</p>
              <p className="text-3xl font-bold text-white">{stats.averageScore}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/interview"
          className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 hover:bg-white/20 transition-all"
        >
          <Video className="w-12 h-12 text-white mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Start Interview</h2>
          <p className="text-gray-200">
            Begin a new interview session with real-time AI assistance
          </p>
        </Link>

        <Link
          to="/resume"
          className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 hover:bg-white/20 transition-all"
        >
          <FileText className="w-12 h-12 text-white mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Upload Resume</h2>
          <p className="text-gray-200">
            Upload your resume for personalized interview answers
          </p>
        </Link>
      </div>
    </div>
  );
}

