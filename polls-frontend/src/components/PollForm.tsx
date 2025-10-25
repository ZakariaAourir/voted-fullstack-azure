import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPollSchema, CreatePollFormData } from '../utils/validators';

interface PollFormProps {
  onSubmit: (data: CreatePollFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CreatePollFormData>;
}

export const PollForm: React.FC<PollFormProps> = ({
  onSubmit,
  isLoading = false,
  defaultValues
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePollFormData>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: '',
      description: '',
      options: [{ text: '' }, { text: '' }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray<CreatePollFormData, 'options'>({
    control,
    name: 'options',
  });

  const addOption = () => {
    if (fields.length < 10) {
      append({ text: '' });
    }
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
          Poll Title
        </label>
        <input
          {...register('title')}
          type="text"
          id="title"
          placeholder="What's your question?"
          className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.title && (
          <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          placeholder="Provide some context for your poll..."
          className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Poll Options
        </label>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start space-x-2">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-medium text-sm">{index + 1}.</span>
                  </div>
                  <input
                    {...register(`options.${index}.text`)}
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {errors.options?.[index]?.text && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.options[index]?.text?.message}
                  </p>
                )}
              </div>
              {fields.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="mt-1 p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Option Button */}
        {fields.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add option
          </button>
        )}

        {errors.options && typeof errors.options === 'object' && 'message' in errors.options && (
          <p className="mt-2 text-sm text-red-600">{errors.options.message as string}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {fields.length} of 10 options
        </p>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Poll'
          )}
        </button>
      </div>
    </form>
  );
};
