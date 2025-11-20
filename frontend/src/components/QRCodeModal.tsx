import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface QRCodeModalProps {
  url: string;
  onClose: () => void;
}

export default function QRCodeModal({ url, onClose }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share Form</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            <QRCodeSVG value={url} size={200} />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={url}
                readOnly
                className="input flex-1"
              />
              <button
                onClick={copyToClipboard}
                className="btn btn-secondary"
                title="Copy URL"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Scan the QR code or share the URL to allow others to access your form
          </p>
        </div>
      </div>
    </div>
  );
}

