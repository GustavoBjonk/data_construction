interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-4 border border-dashed border-line px-6 py-16 text-center"
    >
      <div>
        <p className="text-sm font-medium text-fg">{title}</p>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
