"use client";

import { type ReactNode } from "react";

interface DynamicListProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  minItems?: number;
  addLabel: string;
  emptyMessage: string;
}

export function DynamicList<T>({
  items,
  onAdd,
  onRemove,
  renderItem,
  minItems = 0,
  addLabel,
  emptyMessage,
}: DynamicListProps<T>) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-ink-secondary text-center py-6 text-lg">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="relative border-3 border-border-soft rounded-xl bg-surface p-4"
            >
              {items.length > minItems && (
                <button
                  onClick={() => onRemove(i)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-brick-light text-brick border-2 border-brick font-bold text-sm hover:bg-brick hover:text-white transition-colors flex items-center justify-center"
                  aria-label={`Remove item ${i + 1}`}
                >
                  ×
                </button>
              )}
              {renderItem(item, i)}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onAdd}
        className="w-full min-h-[56px] rounded-xl border-3 border-dashed border-border-soft bg-surface text-ink font-bold text-lg hover:border-border hover:bg-surface-muted transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-2xl">+</span>
        {addLabel}
      </button>
    </div>
  );
}
