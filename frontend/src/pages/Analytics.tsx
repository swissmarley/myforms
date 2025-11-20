import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, ArrowLeft } from 'lucide-react';
import { analyticsApi } from '../services/api';
import { Analytics as AnalyticsType } from '../types';
import toast from 'react-hot-toast';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const { id } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAnalytics();
    }
  }, [id]);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsApi.getFormAnalytics(id!);
      setAnalytics(response.data);
    } catch (error: any) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = format === 'csv'
        ? await analyticsApi.exportCSV(id!)
        : await analyticsApi.exportJSON(id!);

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-${id}-responses.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('csv')}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm font-medium text-gray-500">Total Responses</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {analytics.totalResponses}
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-500">Completed</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {analytics.completedResponses}
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-500">Completion Rate</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {analytics.completionRate.toFixed(1)}%
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-500">Avg. Time</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {Math.round(analytics.averageCompletionTime / 60)}m
          </div>
        </div>
      </div>

      {/* Response Trends */}
      {analytics.trends.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Question Analytics */}
      <div className="space-y-6">
        {analytics.questionAnalytics.map((qa, index) => (
          <div key={qa.questionId} className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {qa.questionTitle}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {qa.responseCount} responses
            </p>

            {qa.choiceDistribution && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Distribution</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={qa.choiceDistribution}
                        dataKey="count"
                        nameKey="choice"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {qa.choiceDistribution.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Counts</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={qa.choiceDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="choice" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {qa.scaleDistribution && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Scale Distribution {qa.average && `(Avg: ${qa.average.toFixed(1)})`}
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={qa.scaleDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="value" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

