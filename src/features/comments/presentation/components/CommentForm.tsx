"use client";

import { useRef, useState, type FormEvent } from "react";
import { Alert, Button, TextareaField } from "@/src/core/components/ui";
import {
  COMMENT_CONTENT_MAX_LENGTH,
  validateCommentContent,
} from "../viewmodels/comment.viewmodel";

export type CommentFormProps = {
  isSubmitting: boolean;
  /** Error del servidor (403, 404, validación de la API…). */
  errorMessage: string | null;
  /** Devuelve true si el comentario se publicó: entonces se vacía el campo. */
  onSubmit: (content: string) => Promise<boolean>;
};

/** Formulario para escribir un comentario nuevo en una publicación. */
export function CommentForm({ isSubmitting, errorMessage, onSubmit }: CommentFormProps) {
  const [text, setText] = useState("");
  const [hasTried, setHasTried] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // El aviso aparece tras el primer intento de envío y se actualiza al escribir.
  const error = hasTried ? validateCommentContent(text) : undefined;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (validateCommentContent(text) !== undefined) {
      setHasTried(true);
      // El error se asocia al campo: se lleva el foco ahí para que lo vea quien usa teclado o lector.
      formRef.current?.querySelector("textarea")?.focus();
      return;
    }
    const ok = await onSubmit(text);
    if (ok) {
      setText("");
      setHasTried(false);
    }
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 max-sm:[&_textarea]:text-base"
    >
      <TextareaField
        label="Tu comentario"
        rows={3}
        autoComplete="off"
        value={text}
        onChange={(event) => setText(event.target.value)}
        error={error}
        hint={`${text.length}/${COMMENT_CONTENT_MAX_LENGTH}`}
      />

      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <div>
        <Button type="submit" isLoading={isSubmitting} className="whitespace-nowrap">
          Comentar
        </Button>
      </div>
    </form>
  );
}
