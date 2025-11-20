import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formsApi, responsesApi } from '../services/api';
import { Form, Question, Answer } from '../types';
import toast from 'react-hot-toast';

export default function FormView() {
  const { shareableUrl } = useParams<{ shareableUrl: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadForm();
    // Auto-save to localStorage
    const interval = setInterval(() => {
      if (shareableUrl) {
        localStorage.setItem(`form_${shareableUrl}`, JSON.stringify({ answers, email }));
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [shareableUrl, answers, email]);

  useEffect(() => {
    // Load saved data
    if (shareableUrl) {
      const saved = localStorage.getItem(`form_${shareableUrl}`);
      if (saved) {
        const { answers: savedAnswers, email: savedEmail } = JSON.parse(saved);
        setAnswers(savedAnswers);
        setEmail(savedEmail);
      }
    }
  }, [shareableUrl]);

  const loadForm = async () => {
    try {
      const response = await formsApi.getByUrl(shareableUrl!);
      setForm(response.data.form);
    } catch (error: any) {
      toast.error('Form not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const validateForm = (): boolean => {
    if (!form?.questions) return false;

    for (const question of form.questions) {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === '') {
          toast.error(`"${question.title}" is required`);
          return false;
        }
      }
    }

    if (form.collectEmail && !email) {
      toast.error('Email is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await responsesApi.submit({
        formId: form!.id,
        email: form!.collectEmail ? email : undefined,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      });

      // Clear saved data
      if (shareableUrl) {
        localStorage.removeItem(`form_${shareableUrl}`);
      }

      setSubmitted(true);
      toast.success(form!.confirmationMsg || 'Response submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Form not found</h1>
          <p className="mt-2 text-gray-600">The form you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Thank you!</h2>
          <p className="mt-2 text-gray-600">
            {form.confirmationMsg || 'Your response has been recorded successfully.'}
          </p>
        </div>
      </div>
    );
  }

  const totalQuestions = form.questions?.length || 0;
  const answeredQuestions = Object.keys(answers).filter(
    (id) => answers[id] !== '' && answers[id] !== null && answers[id] !== undefined
  ).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600 mb-8">{form.description}</p>
          )}

          {form.showProgress && totalQuestions > 0 && (
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{answeredQuestions} of {totalQuestions} answered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {form.collectEmail && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address {form.collectEmail && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  required={form.collectEmail}
                />
              </div>
            )}

            {form.questions?.map((question) => (
              <QuestionInput
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(value) => handleAnswerChange(question.id, value)}
              />
            ))}

            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn btn-primary py-3 text-lg"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}) {
  const renderInput = () => {
    switch (question.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-2">
            {(question.options?.choices as string[])?.map((choice, index) => (
              <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={choice}
                  checked={value === choice}
                  onChange={() => onChange(choice)}
                  className="mr-3"
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        );

      case 'CHECKBOXES':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {(question.options?.choices as string[])?.map((choice, index) => (
              <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(choice)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, choice]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== choice));
                    }
                  }}
                  className="mr-3"
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        );

      case 'DROPDOWN':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input"
          >
            <option value="">Select an option</option>
            {(question.options?.choices as string[])?.map((choice, index) => (
              <option key={index} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        );

      case 'SHORT_ANSWER':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input"
            maxLength={question.validation?.maxLength}
            minLength={question.validation?.minLength}
          />
        );

      case 'LONG_ANSWER':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input"
            rows={4}
            maxLength={question.validation?.maxLength}
            minLength={question.validation?.minLength}
          />
        );

      case 'LINEAR_SCALE':
        const min = question.options?.min || 1;
        const max = question.options?.max || 5;
        const step = question.options?.step || 1;
        return (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">{question.options?.labels?.left || min}</span>
              <span className="text-sm text-gray-600">{question.options?.labels?.right || max}</span>
            </div>
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
                const scaleValue = min + i * step;
                return (
                  <label key={scaleValue} className="flex-1 text-center">
                    <input
                      type="radio"
                      name={question.id}
                      value={scaleValue}
                      checked={value === scaleValue}
                      onChange={() => onChange(scaleValue)}
                      className="sr-only"
                    />
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        value === scaleValue
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {scaleValue}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input"
          />
        );

      case 'TIME':
        return (
          <input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input"
          />
        );

      case 'DATETIME':
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="input"
          />
        );

      case 'FILE_UPLOAD':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // In production, upload to server and get URL
                onChange(file.name);
              }
            }}
            className="input"
            accept={question.validation?.pattern}
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {question.title}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {question.description && (
        <p className="text-sm text-gray-600 mb-3">{question.description}</p>
      )}
      {renderInput()}
    </div>
  );
}

