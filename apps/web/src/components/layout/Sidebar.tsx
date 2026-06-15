import { NavLink, useParams } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◉' },
  { to: '/upload', label: 'Upload', icon: '⊕' },
];

const repoLinks = [
  { to: '', label: 'Overview', icon: '◉' },
  { to: 'graph', label: 'Graph', icon: '◉' },
  { to: 'flow', label: 'Flows', icon: '◉' },
  { to: 'chat', label: 'Chat', icon: '◉' },
  { to: 'report', label: 'Report', icon: '◉' },
];

export default function Sidebar() {
  const { id } = useParams<{ id: string }>();

  return (
    <aside className="flex w-56 flex-col border-r border-gray-800 bg-gray-900">
      <div className="flex h-14 items-center border-b border-gray-800 px-4">
        <span className="text-sm font-bold tracking-tight text-indigo-400">Archaeologist</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
        {id && (
          <>
            <div className="my-2 border-t border-gray-800" />
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-gray-600">
              Repository
            </p>
            {repoLinks.map((link) => (
              <NavLink
                key={link.to}
                to={`/repositories/${id}/${link.to}`}
                end={link.to === ''}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`
                }
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
