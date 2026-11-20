import { DomainError } from "@/src/core/errors/domain-error";
import {
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  isPostType,
  isVehicleId,
  type PostType,
} from "./post";

/**
 * Borrador de una publicación: lo que el usuario escribe antes de enviarlo.
 * Todavía no ha pasado por las reglas del dominio.
 */
export interface PostDraft {
  title: string;
  content: string;
  type: PostType;
  vehicleId?: string | null;
  /** Solo type=pregunta. */
  questionDetails?: string | null;
  /** Solo type=evento. */
  eventDate?: string | null;
  eventCity?: string | null;
  eventLocation?: string | null;
}

/** Texto recortado; vacío o ausente pasa a `null`. */
function optionalText(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

/**
 * Valida y normaliza un borrador. Esta es la regla autoritativa: usa los mismos
 * límites y mensajes que el constructor de `Post`; el formulario solo la replica
 * para dar respuesta inmediata al usuario, pero no la sustituye.
 *
 * Devuelve un objeto NUEVO con todos los campos presentes: los textos recortados,
 * los opcionales vacíos como `null`, y los campos que no corresponden al tipo
 * (detalle de pregunta fuera de "pregunta", datos de evento fuera de "evento")
 * descartados.
 *
 * @throws DomainError si el borrador rompe alguna regla.
 */
export function sanitizePostDraft(draft: PostDraft): PostDraft {
  const title = draft.title.trim();
  if (title === "") {
    throw new DomainError("El título de la publicación es obligatorio");
  }
  if (title.length > POST_TITLE_MAX_LENGTH) {
    throw new DomainError(`El título no puede superar ${POST_TITLE_MAX_LENGTH} caracteres`);
  }

  const content = draft.content.trim();
  if (content === "") {
    throw new DomainError("El contenido de la publicación es obligatorio");
  }
  if (content.length > POST_CONTENT_MAX_LENGTH) {
    throw new DomainError(`El contenido no puede superar ${POST_CONTENT_MAX_LENGTH} caracteres`);
  }

  if (!isPostType(draft.type)) {
    throw new DomainError("El tipo de publicación no es válido");
  }

  const vehicleId = optionalText(draft.vehicleId);
  if (vehicleId !== null && !isVehicleId(vehicleId)) {
    throw new DomainError("El id del vehículo no es válido");
  }

  const isQuestion = draft.type === "pregunta";
  const isEvent = draft.type === "evento";

  return {
    title,
    content,
    type: draft.type,
    vehicleId,
    questionDetails: isQuestion ? optionalText(draft.questionDetails) : null,
    eventDate: isEvent ? optionalText(draft.eventDate) : null,
    eventCity: isEvent ? optionalText(draft.eventCity) : null,
    eventLocation: isEvent ? optionalText(draft.eventLocation) : null,
  };
}
