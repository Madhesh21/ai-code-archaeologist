import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  repositoryId?: string;
  error?: string;
}

export default function RepositoryUpload() {
  const [githubUrl, setGithubUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleGithubSubmit(e: FormEvent) {
    e.preventDefault();
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  }

  async function handleZipSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadState({ status: 'uploading' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/v1/repositories/upload', {
        method: 'POST',
        body: formData,
      });

      const body = await response.json();

      if (!response.ok || !body.success) {
        throw new Error(body.error?.message || 'Upload failed');
      }

      setUploadState({
        status: 'success',
        repositoryId: body.data.repositoryId,
      });
    } catch (err) {
      setUploadState({
        status: 'error',
        error: err instanceof Error ? err.message : 'Upload failed',
      });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">Upload Repository</h2>
        <p className="mt-1 text-gray-400">
          Provide a public GitHub URL or upload a ZIP archive of your repository.
        </p>
      </div>

      <section className="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-100">GitHub Repository</h3>
        <form onSubmit={handleGithubSubmit} className="flex gap-3">
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/user/repo"
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!githubUrl}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Import
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-gray-800 bg-gray-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-100">ZIP Upload</h3>
        {uploadState.status === 'success' ? (
          <div className="rounded-lg border border-emerald-800 bg-emerald-900/30 p-6 text-center">
            <p className="text-lg font-medium text-emerald-400">Upload Successful</p>
            <p className="mt-2 text-sm text-gray-400">
              Repository ID:{' '}
              <span className="font-mono text-gray-300">{uploadState.repositoryId}</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleZipSubmit}>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => uploadState.status !== 'uploading' && fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              } ${uploadState.status === 'uploading' ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploadState.status === 'uploading'}
              />
              {uploadState.status === 'uploading' ? (
                <div className="text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  <p className="text-sm text-gray-400">Uploading...</p>
                </div>
              ) : selectedFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-200">{selectedFile.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    Drag and drop your ZIP file here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-gray-600">Maximum file size: 500 MB</p>
                </div>
              )}
            </div>
            {uploadState.status === 'error' && (
              <p className="mt-3 text-sm text-red-400">{uploadState.error}</p>
            )}
            {selectedFile && uploadState.status !== 'uploading' && (
              <button
                type="submit"
                className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Upload & Analyze
              </button>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
