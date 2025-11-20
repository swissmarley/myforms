import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { formsApi } from '../services/api';
import { Form } from '../types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Form settings let you configure password protection, expiration, response limits, and more.
        </p>
        <div>
          <Link
            to="/forms"
            className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Manage forms
          </Link>
        </div>
      </header>

      {forms.length === 0 ? (
        <div className="text-sm text-gray-600">
          No forms yet. Create one from the{' '}
          <Link to="/forms" className="text-primary-600 underline">
            Forms page
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div key={form.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{form.title}</h2>
                  <p className="text-sm text-gray-500">{form.description || 'No description'}</p>
                </div>
                <Settings className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  to={`/forms/${form.id}/settings`}
                  className="btn btn-primary flex-1 text-center"
                >
                  Open settings
                </Link>
                <Link
                  to={`/forms/${form.id}/edit`}
                  className="btn btn-secondary"
                >
                  Edit form
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
