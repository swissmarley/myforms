import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ComponentType, SVGProps } from 'react';
import { formsApi } from '../services/api';
import { Form } from '../types';
import toast from 'react-hot-toast';
import { BarChart3, FileText, Eye } from 'lucide-react';

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <Icon className="h-6 w-6 text-primary-500" />
      </div>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

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

  const publishedForms = forms.filter((form) => form.status === 'PUBLISHED');
  const drafts = forms.filter((form) => form.status === 'DRAFT');
  const totalResponses = forms.reduce(
    (acc, form) => acc + (form._count?.responses || 0),
    0,
  );
  const recentForms = forms.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total forms"
          value={forms.length.toString()}
          description={`${drafts.length} drafts · ${publishedForms.length} published`}
          icon={FileText}
        />
        <StatCard
          label="Published forms"
          value={publishedForms.length.toString()}
          description="Live forms are ready to collect responses"
          icon={BarChart3}
        />
        <StatCard
          label="Responses collected"
          value={totalResponses.toString()}
          description="Sum of all published form submissions"
          icon={Eye}
        />
      </div>

      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Recent forms</h2>
            <p className="text-sm text-gray-500">
              Pick a form to edit, publish, preview, or jump to analytics.
            </p>
          </div>
          <Link
            to="/forms"
            className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Manage forms
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : recentForms.length === 0 ? (
          <div className="text-sm text-center text-gray-600">
            No forms yet. Click below to create the first one.
            <div className="mt-4">
              <Link
                to="/forms/new"
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                + New form
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentForms.map((form) => (
              <div key={form.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                    {form.description && (
                      <p className="text-sm text-gray-600">{form.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
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
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link
                    to={`/forms/${form.id}/edit`}
                    className="btn btn-secondary"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/forms/${form.id}/analytics`}
                    className="btn btn-secondary"
                  >
                    Analytics
                  </Link>
                  <Link
                    to={`/forms/${form.id}/settings`}
                    className="btn btn-secondary"
                  >
                    Settings
                  </Link>
                  {form.status === 'PUBLISHED' ? (
                    <a
                      href={`/form/${form.shareableUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      Preview
                    </a>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      publish to preview
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
