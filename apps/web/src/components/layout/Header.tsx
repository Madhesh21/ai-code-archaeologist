import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/upload': 'Upload Repository',
};

export default function Header() {
  const location = useLocation();
  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const title = routeTitles[basePath] || 'Repository';

  return (
    <header className="flex h-14 items-center border-b border-gray-800 px-6">
      <h1 className="text-lg font-semibold text-gray-100">{title}</h1>
    </header>
  );
}
