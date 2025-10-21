import { ExternalLink } from 'lucide-react';

interface DataSourceLinkProps {
  href: string;
  label?: string;
}

export function DataSourceLink({ href, label = 'Data source' }: DataSourceLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      aria-label={`${label} (opens in a new tab)`}
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

