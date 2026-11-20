"use client";

import { useRef, useState, type FormEvent } from "react";
import { Alert, Button, Modal, TextareaField } from "@/src/core/components/ui";
import {
  COMMENT_CONTENT_MAX_LENGTH,
  validateCommentContent,
  type CommentViewModel,
} from "../viewmodels/comment.viewmodel";

export type CommentItemProps = {
  comment: CommentViewModel;
  /** true mientras se guarda o elimina este comentario. */
  isBusy: boolean;
  /** Error de la última acción sobre este comentario. */
  errorMessage?: string;
  /** Devuelve true si se guardó: entonces se sale del modo edición. */
  onUpdate: (content: string) => Promise<boolean>;
  /** Devuelve true si se eliminó. */
  onDelete: () => Promise<boolean>;
};

/** Un comentario con sus acciones (editar y eliminar) solo para quien puede gestionarlo. */
export function CommentItem({
  comment,
  isBusy,
  errorMessage,
  onUpdate,
  onDelete,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const [hasTried, setHasTried] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const error = hasTried ? validateCommentContent(text) : undefined;

  const startEditing = () => {
    setText(comment.content);
    setHasTried(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setHasTried(false);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy) return;
    if (validateCommentContent(text) !== undefined) {
      setHasTried(true);
      formRef.current?.querySelector("textarea")?.focus();
      return;
    }
    const ok = await onUpdate(text);
    if (ok) cancelEditing();
  };

  const handleConfirmDelete = async () => {
    await onDelete();
    setIsDeleteOpen(false);
  };

  return (
    <article className="flex flex-col gap-2 py-4">
      <header className="flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="font-medium">{comment.authorLabel}</span>
        <time dateTime={comment.createdAtIso} className="text-base-content/60">
          {comment.formattedDate}
        </time>
        {comment.isEdited && <span className="text-xs text-base-content/60">(editado)</span>}
      </header>

      {isEditing ? (
        <form
          ref={formRef}
          noValidate
          onSubmit={handleSave}
          className="flex flex-col gap-2 max-sm:[&_textarea]:text-base"
        >
          <TextareaField
            label="Editar comentario"
            rows={3}
            autoComplete="off"
            value={text}
            onChange={(event) => setText(event.target.value)}
            error={error}
            hint={`${text.length}/${COMMENT_CONTENT_MAX_LENGTH}`}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" isLoading={isBusy} className="whitespace-nowrap">
              Guardar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEditing}
              disabled={isBusy}
              className="whitespace-nowrap"
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <p className="whitespace-pre-line break-words">{comment.content}</p>
      )}

      {comment.canManage && !isEditing && (
        <div className="-ml-3 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={startEditing}
            aria-label={`Editar comentario de ${comment.authorLabel}`}
            disabled={isBusy}
            className="whitespace-nowrap"
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            aria-label={`Eliminar comentario de ${comment.authorLabel}`}
            disabled={isBusy}
            className="whitespace-nowrap"
          >
            Eliminar
          </Button>
        </div>
      )}

      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="¿Eliminar el comentario?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isBusy}>
              Cancelar
            </Button>
            <Button
              variant="error"
              onClick={handleConfirmDelete}
              isLoading={isBusy}
              className="whitespace-nowrap"
            >
              Eliminar comentario
            </Button>
          </>
        }
      >
        <p>Esta acción no se puede deshacer.</p>
      </Modal>
    </article>
  );
}
