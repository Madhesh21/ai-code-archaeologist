const CATEGORY_COLORS: Record<string, string> = {
  frontend: 'border-blue-500/30 text-blue-400',
  backend: 'border-green-500/30 text-green-400',
  database: 'border-purple-500/30 text-purple-400',
  infrastructure: 'border-orange-500/30 text-orange-400',
};

interface TechBadgeProps {
  name: string;
  category: string;
}

export default function TechBadge({ name, category }: TechBadgeProps) {
  const colorClasses = CATEGORY_COLORS[category] || 'border-gray-500/30 text-gray-400';

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${colorClasses}`}
    >
      {name}
    </span>
  );
}
