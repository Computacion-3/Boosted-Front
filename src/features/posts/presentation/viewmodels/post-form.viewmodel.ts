import {
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  type PostType,
} from "../../domain/entities/post";
import { getVehicleIdError, type PostViewModel } from "./post.viewmodel";

// Los componentes no importan el dominio: reciben los límites desde el ViewModel.
export { POST_CONTENT_MAX_LENGTH, POST_TITLE_MAX_LENGTH };

/** Valores del formulario de publicación: todo texto plano, salvo el tipo. */
export interface PostFormValues {
  title: string;
  content: string;
  type: PostType;
  vehicleId: string;
  questionDetails: string;
  eventDate: string;
  eventCity: string;
  eventLocation: string;
}

export const EMPTY_POST_FORM: PostFormValues = {
  title: "",
  content: "",
  type: "general",
  vehicleId: "",
  questionDetails: "",
  eventDate: "",
  eventCity: "",
  eventLocation: "",
};

/** Rellena el formulario de edición desde una publicación (los null pasan a texto vacío). */
export function toPostFormValues(post: PostViewModel): PostFormValues {
  return {
    title: post.title,
    content: post.content,
    type: post.type,
    vehicleId: post.vehicleId ?? "",
    questionDetails: post.questionDetails ?? "",
    eventDate: post.eventDate ?? "",
    eventCity: post.eventCity ?? "",
    eventLocation: post.eventLocation ?? "",
  };
}

export type PostFormErrors = Partial<Record<keyof PostFormValues, string>>;

/**
 * Validación inmediata para el formulario. La regla autoritativa vive en el dominio
 * (`sanitizePostDraft`); esto solo da retroalimentación sin esperar al servidor.
 */
export function validatePostForm(values: PostFormValues): PostFormErrors {
  const errors: PostFormErrors = {};

  const title = values.title.trim();
  if (title === "") errors.title = "Escribe un título";
  else if (title.length > POST_TITLE_MAX_LENGTH) {
    errors.title = `El título no puede superar ${POST_TITLE_MAX_LENGTH} caracteres`;
  }

  const content = values.content.trim();
  if (content === "") errors.content = "Escribe el contenido";
  else if (content.length > POST_CONTENT_MAX_LENGTH) {
    errors.content = `El contenido no puede superar ${POST_CONTENT_MAX_LENGTH} caracteres`;
  }

  const vehicleIdError = getVehicleIdError(values.vehicleId);
  if (vehicleIdError) errors.vehicleId = vehicleIdError;

  return errors;
}
