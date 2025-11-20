import { useState } from 'react';
import { Question, QuestionType } from '../types';
import { X, GripVertical, Copy, Trash2 } from 'lucide-react';

interface QuestionEditorProps {
  question: Question;
  onUpdate: (question: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'CHECKBOXES', label: 'Checkboxes' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
  { value: 'LONG_ANSWER', label: 'Long Answer' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'LINEAR_SCALE', label: 'Linear Scale' },
  { value: 'DATE', label: 'Date' },
  { value: 'TIME', label: 'Time' },
  { value: 'DATETIME', label: 'Date & Time' },
  { value: 'FILE_UPLOAD', label: 'File Upload' },
];

export default function QuestionEditor({
  question,
  onUpdate,
  onDelete,
  onDuplicate,
}: QuestionEditorProps) {
  const [localQuestion, setLocalQuestion] = useState(question);

  const updateField = (field: keyof Question, value: any) => {
    const updated = { ...localQuestion, [field]: value };
    setLocalQuestion(updated);
    onUpdate({ [field]: value });
  };

  const updateOptions = (field: string, value: any) => {
    const updated = {
      ...localQuestion,
      options: { ...localQuestion.options, [field]: value },
    };
    setLocalQuestion(updated);
    onUpdate({ options: updated.options });
  };

  const updateChoices = (choices: string[]) => {
    updateOptions('choices', choices);
  };

  const addChoice = () => {
    const choices = (localQuestion.options?.choices as string[]) || [];
    updateChoices([...choices, '']);
  };

  const updateChoice = (index: number, value: string) => {
    const choices = [...((localQuestion.options?.choices as string[]) || [])];
    choices[index] = value;
    updateChoices(choices);
  };

  const removeChoice = (index: number) => {
    const choices = [...((localQuestion.options?.choices as string[]) || [])];
    choices.splice(index, 1);
    updateChoices(choices);
  };

  const hasChoices = ['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(
    localQuestion.type
  );
  const isScale = localQuestion.type === 'LINEAR_SCALE';

  return (
    <div className="card">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 pt-2">
          <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Type
            </label>
            <select
              value={localQuestion.type}
              onChange={(e) => updateField('type', e.target.value)}
              className="input"
            >
              {questionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Title *
            </label>
            <input
              type="text"
              value={localQuestion.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="input"
              placeholder="Enter your question"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={localQuestion.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              className="input"
              rows={2}
              placeholder="Add a description or instructions"
            />
          </div>

          {hasChoices && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choices
              </label>
              <div className="space-y-2">
                {(localQuestion.options?.choices as string[])?.map((choice, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => updateChoice(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`Choice ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeChoice(index)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addChoice}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add choice
                </button>
              </div>
            </div>
          )}

          {isScale && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min
                </label>
                <input
                  type="number"
                  value={localQuestion.options?.min || 1}
                  onChange={(e) => updateOptions('min', Number(e.target.value))}
                  className="input"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max
                </label>
                <input
                  type="number"
                  value={localQuestion.options?.max || 5}
                  onChange={(e) => updateOptions('max', Number(e.target.value))}
                  className="input"
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step
                </label>
                <input
                  type="number"
                  value={localQuestion.options?.step || 1}
                  onChange={(e) => updateOptions('step', Number(e.target.value))}
                  className="input"
                  min={1}
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localQuestion.required}
                onChange={(e) => updateField('required', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Required</span>
            </label>
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col space-y-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-red-600 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

