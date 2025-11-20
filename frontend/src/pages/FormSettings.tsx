import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { formsApi } from '../services/api';
import { Form } from '../types';
import toast from 'react-hot-toast';
import QRCodeModal from '../components/QRCodeModal';

export default function FormSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    try {
      const response = await formsApi.getById(id!);
      setForm(response.data.form);
    } catch (error: any) {
      toast.error('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await formsApi.update(form.id, {
        password: form.password || null,
        expiresAt: form.expiresAt || null,
        responseLimit: form.responseLimit || null,
        allowMultiple: form.allowMultiple,
        collectEmail: form.collectEmail,
        showProgress: form.showProgress,
        confirmationMsg: form.confirmationMsg,
        settings: form.settings,
      });
      toast.success('Settings saved');
    } catch (error: any) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!form) {
    return <div>Form not found</div>;
  }

  const baseUrl = window.location.origin;
  const formUrl = `${baseUrl}/form/${form.shareableUrl}`;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/forms/${id}/edit`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Form Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </button>
      </div>

      <div className="space-y-6">
        {/* Sharing */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sharing</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formUrl}
                  readOnly
                  className="input flex-1 bg-gray-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(formUrl);
                    toast.success('URL copied to clipboard');
                  }}
                  className="btn btn-secondary"
                >
                  Copy
                </button>
                <button
                  onClick={() => setShowQR(true)}
                  className="btn btn-secondary"
                >
                  QR Code
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Protection (optional)
              </label>
              <input
                type="text"
                value={form.password || ''}
                onChange={(e) => setForm({ ...form, password: e.target.value || undefined })}
                className="input"
                placeholder="Leave empty to disable"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (optional)
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt ? new Date(form.expiresAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Response Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Limit (optional)
              </label>
              <input
                type="number"
                value={form.responseLimit || ''}
                onChange={(e) => setForm({ ...form, responseLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                className="input"
                placeholder="Maximum number of responses"
                min="1"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={form.allowMultiple}
                onChange={(e) => setForm({ ...form, allowMultiple: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Allow multiple responses from the same user
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={form.collectEmail}
                onChange={(e) => setForm({ ...form, collectEmail: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Collect email addresses
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={form.showProgress}
                onChange={(e) => setForm({ ...form, showProgress: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Show progress bar
              </label>
            </div>
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirmation</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmation Message
            </label>
            <textarea
              value={form.confirmationMsg || ''}
              onChange={(e) => setForm({ ...form, confirmationMsg: e.target.value })}
              className="input"
              rows={4}
              placeholder="Message shown after form submission"
            />
          </div>
        </div>
      </div>

      {showQR && (
        <QRCodeModal
          url={formUrl}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
