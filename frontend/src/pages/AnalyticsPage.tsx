import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Eye } from 'lucide-react';
import { formsApi } from '../services/api';
import { Form } from '../types';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await formsApi.getAll();
      setForms(response.data.forms);
    } catch (error: any) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const publishedForms = forms.filter((form) => form.status === 'PUBLISHED');

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">
          All analytics are per form. Publish a form and then click its analytics icon to view detailed insights.
        </p>
        <div>
          <Link
            to="/forms"
            className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Review all forms
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : publishedForms.length === 0 ? (
        <div className="text-sm text-gray-600">
          No published forms yet. Publish a form from the{' '}
          <Link to="/forms" className="text-primary-600 underline">
            Forms page
          </Link>{' '}
          so analytics become available.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {publishedForms.map((form) => (
            <div key={form.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{form.title}</h2>
                  <p className="text-sm text-gray-500">{form.description || 'No description'}</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  Published
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  to={`/forms/${form.id}/analytics`}
                  className="btn btn-primary flex-1 text-center"
                >
                  View analytics
                </Link>
                <Link
                  to={`/forms/${form.id}/settings`}
                  className="btn btn-secondary"
                >
                  Settings
                </Link>
                <a
                  href={`/form/${form.shareableUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <Eye className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
