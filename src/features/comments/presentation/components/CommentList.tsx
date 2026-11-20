"use client";

import { ErrorBanner } from "@/src/core/components/ui";
import type { CommentViewModel } from "../viewmodels/comment.viewmodel";
import { CommentItem } from "./CommentItem";

export type CommentListProps = {
  comments: CommentViewModel[];
  isLoading: boolean;
  errorMessage: string | null;
  /** Ids de los comentarios que se están guardando o eliminando. */
  busyIds: string[];
  /** Error de la última acción, por id de comentario. */
  itemErrors: Record<string, string>;
  onUpdate: (id: string, content: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onRetry: () => void;
};

const SKELETON_ROWS = 3;

/** Listado de comentarios con sus estados: cargando, error, vacío y con datos. */
export function CommentList({
  comments,
  isLoading,
  errorMessage,
  busyIds,
  itemErrors,
  onUpdate,
  onDelete,
  onRetry,
}: CommentListProps) {
  if (isLoading) {
    return (
      <div role="status" className="divide-y divide-base-300">
        <span className="sr-only">Cargando comentarios…</span>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <div key={index} aria-hidden="true" className="flex flex-col gap-2 py-4">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (errorMessage) {
    return <ErrorBanner message={errorMessage} onRetry={onRetry} />;
  }

  if (comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="font-medium">Todavía no hay comentarios.</p>
        <p className="mt-1 text-sm text-base-content/60">
          Escribe el primero para empezar la conversación.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-base-300">
      {comments.map((comment) => (
        <li key={comment.id}>
          <CommentItem
            comment={comment}
            isBusy={busyIds.includes(comment.id)}
            errorMessage={itemErrors[comment.id]}
            onUpdate={(content) => onUpdate(comment.id, content)}
            onDelete={() => onDelete(comment.id)}
          />
        </li>
      ))}
    </ul>
  );
}
