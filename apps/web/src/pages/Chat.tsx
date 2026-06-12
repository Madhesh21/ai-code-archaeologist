import { useState } from 'react';
import { useParams } from 'react-router-dom';

const suggestions = [
  'How is this project structured?',
  'What are the main entities?',
  'Explain the authentication flow.',
  'Which APIs create users?',
];

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const [input, setInput] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-4">
        <p className="font-mono text-xs text-gray-500">Repository: {id}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-center">
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-200">Ask about this repository</h3>
            <p className="mt-2 text-sm text-gray-400">Try one of these questions to get started:</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3 border-t border-gray-800 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this repository..."
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
