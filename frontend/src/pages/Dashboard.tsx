import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Eye, BarChart3, MoreVertical, Archive } from 'lucide-react';
import { formsApi } from '../services/api';
import { Form } from '../types';
import toast from 'react-hot-toast';

export default function Dashboard() {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      await formsApi.delete(id);
      toast.success('Form deleted');
      loadForms();
    } catch (error: any) {
      toast.error('Failed to delete form');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Forms</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage your survey forms
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/forms/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </Link>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="mt-8 text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No forms</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new form.
          </p>
          <div className="mt-6">
            <Link
              to="/forms/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Form
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div key={form.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{form.title}</h3>
                  {form.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {form.description}
                    </p>
                  )}
                </div>
                <div className="ml-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      form.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : form.status === 'ARCHIVED'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {form.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex space-x-4">
                  <span>{form._count?.questions || 0} questions</span>
                  <span>{form._count?.responses || 0} responses</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <Link
                  to={`/forms/${form.id}/edit`}
                  className="flex-1 btn btn-primary text-center"
                >
                  Edit
                </Link>
                {form.status === 'PUBLISHED' && (
                  <>
                    <Link
                      to={`/forms/${form.id}/analytics`}
                      className="btn btn-secondary"
                      title="Analytics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                    <a
                      href={`/form/${form.shareableUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </>
                )}
                <button
                  onClick={() => handleDelete(form.id)}
                  className="btn btn-danger"
                  title="Delete"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

