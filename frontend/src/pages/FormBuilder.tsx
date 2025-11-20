import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Eye, Settings, Plus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formsApi, questionsApi } from '../services/api';
import { Form, Question, QuestionType } from '../types';
import QuestionEditor from '../components/QuestionEditor';
import toast from 'react-hot-toast';

function SortableQuestion({
  question,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  question: Question;
  onUpdate: (question: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionEditor
        question={question}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        {...attributes}
        {...listeners}
      />
    </div>
  );
}

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) {
      loadForm();
    } else {
      createNewForm();
    }
  }, [id]);

  const createNewForm = async () => {
    try {
      const response = await formsApi.create({
        title: 'Untitled Form',
        description: '',
      });
      navigate(`/forms/${response.data.form.id}/edit`, { replace: true });
      setForm(response.data.form);
      setQuestions([]);
    } catch (error: any) {
      toast.error('Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  const loadForm = async () => {
    try {
      const [formResponse, questionsResponse] = await Promise.all([
        formsApi.getById(id!),
        questionsApi.getByForm(id!),
      ]);
      setForm(formResponse.data.form);
      setQuestions(questionsResponse.data.questions);
    } catch (error: any) {
      toast.error('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      setQuestions(newQuestions);

      // Update order in backend
      const questionIds = newQuestions.map((q) => q.id);
      try {
        await questionsApi.reorder(id!, questionIds);
      } catch (error: any) {
        toast.error('Failed to reorder questions');
        loadForm(); // Revert on error
      }
    }
  };

  const addQuestion = async () => {
    try {
      const response = await questionsApi.create(id!, {
        type: 'MULTIPLE_CHOICE',
        title: 'New Question',
        required: false,
        order: questions.length,
        options: { choices: ['Option 1', 'Option 2'] },
      });
      setQuestions([...questions, response.data.question]);
    } catch (error: any) {
      toast.error('Failed to add question');
    }
  };

  const updateQuestion = async (questionId: string, updates: Partial<Question>) => {
    try {
      const response = await questionsApi.update(questionId, updates);
      setQuestions(
        questions.map((q) => (q.id === questionId ? response.data.question : q))
      );
    } catch (error: any) {
      toast.error('Failed to update question');
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      await questionsApi.delete(questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
      toast.success('Question deleted');
    } catch (error: any) {
      toast.error('Failed to delete question');
    }
  };

  const duplicateQuestion = async (questionId: string) => {
    try {
      const response = await questionsApi.duplicate(questionId);
      const questionIndex = questions.findIndex((q) => q.id === questionId);
      const newQuestions = [...questions];
      newQuestions.splice(questionIndex + 1, 0, response.data.question);
      setQuestions(newQuestions);
    } catch (error: any) {
      toast.error('Failed to duplicate question');
    }
  };

  const saveForm = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await formsApi.update(form.id, {
        title: form.title,
        description: form.description,
      });
      toast.success('Form saved');
    } catch (error: any) {
      toast.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const publishForm = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const response = await formsApi.update(form.id, {
        status: 'PUBLISHED',
      });
      setForm(response.data.form);
      toast.success('Form published');
    } catch (error: any) {
      toast.error('Failed to publish form');
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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            placeholder="Form Title"
          />
          <textarea
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-2 w-full text-sm text-gray-600 bg-transparent border-none focus:outline-none resize-none"
            placeholder="Form description (optional)"
            rows={2}
          />
        </div>
        <div className="flex space-x-2 ml-4">
          <button onClick={saveForm} disabled={saving} className="btn btn-secondary">
            <Save className="h-4 w-4 mr-2" />
            Save
          </button>
          {form.status !== 'PUBLISHED' && (
            <button onClick={publishForm} disabled={saving} className="btn btn-primary">
              Publish
            </button>
          )}
          {form.status === 'PUBLISHED' && (
            <a
              href={`/form/${form.shareableUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </a>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {questions.map((question) => (
              <SortableQuestion
                key={question.id}
                question={question}
                onUpdate={(updates) => updateQuestion(question.id, updates)}
                onDelete={() => deleteQuestion(question.id)}
                onDuplicate={() => duplicateQuestion(question.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-6">
        <button
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
        >
          <Plus className="h-5 w-5 mx-auto mb-1" />
          Add Question
        </button>
      </div>
    </div>
  );
}

