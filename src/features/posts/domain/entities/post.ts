import { DomainError } from "@/src/core/errors/domain-error";

/** Tipos de publicación que acepta la API. */
export const POST_TYPES = [
  "avance",
  "compra",
  "pregunta",
  "recomendacion",
  "comparacion",
  "evento",
  "experiencia",
  "general",
] as const;

export type PostType = (typeof POST_TYPES)[number];

/** Límites de la API (igual que en el backend). */
export const POST_TITLE_MAX_LENGTH = 120;
export const POST_CONTENT_MAX_LENGTH = 5000;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPostType(value: string): value is PostType {
  return (POST_TYPES as readonly string[]).includes(value);
}

/** true si el texto es un UUID: así identifica la API a los vehículos. */
export function isVehicleId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export interface PostProps {
  id: string;
  title: string;
  content: string;
  type: PostType;
  authorId: string;
  /** Vehículo al que se asocia la publicación (opcional). */
  vehicleId: string | null;
  likeCount: number;
  /** Ids de quienes dieron like. */
  likedBy: string[];
  /** Oculta por moderación. */
  hidden: boolean;
  /** Solo type=pregunta. */
  questionDetails: string | null;
  /** Solo type=evento. Texto libre; el backend guarda lo que le llegue. */
  eventDate: string | null;
  eventCity: string | null;
  eventLocation: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Una publicación de la comunidad (avance, pregunta, evento…). */
export class Post {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly type: PostType;
  readonly authorId: string;
  readonly vehicleId: string | null;
  readonly likeCount: number;
  readonly likedBy: string[];
  readonly hidden: boolean;
  readonly questionDetails: string | null;
  readonly eventDate: string | null;
  readonly eventCity: string | null;
  readonly eventLocation: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: PostProps) {
    if (props.id.trim() === "") {
      throw new DomainError("La publicación no tiene id");
    }
    if (props.authorId.trim() === "") {
      throw new DomainError("La publicación no tiene autor");
    }

    const title = props.title.trim();
    if (title === "") {
      throw new DomainError("El título de la publicación es obligatorio");
    }
    if (title.length > POST_TITLE_MAX_LENGTH) {
      throw new DomainError(`El título no puede superar ${POST_TITLE_MAX_LENGTH} caracteres`);
    }

    const content = props.content.trim();
    if (content === "") {
      throw new DomainError("El contenido de la publicación es obligatorio");
    }
    if (content.length > POST_CONTENT_MAX_LENGTH) {
      throw new DomainError(`El contenido no puede superar ${POST_CONTENT_MAX_LENGTH} caracteres`);
    }

    if (!isPostType(props.type)) {
      throw new DomainError("El tipo de publicación no es válido");
    }
    if (!Number.isInteger(props.likeCount) || props.likeCount < 0) {
      throw new DomainError("El número de likes no es válido");
    }

    const vehicleId = props.vehicleId?.trim() || null;
    if (vehicleId !== null && !isVehicleId(vehicleId)) {
      throw new DomainError("El id del vehículo no es válido");
    }

    this.id = props.id;
    this.title = title;
    this.content = content;
    this.type = props.type;
    this.authorId = props.authorId;
    this.vehicleId = vehicleId;
    this.likeCount = props.likeCount;
    this.likedBy = [...props.likedBy];
    this.hidden = props.hidden;
    this.questionDetails = props.questionDetails?.trim() || null;
    this.eventDate = props.eventDate?.trim() || null;
    this.eventCity = props.eventCity?.trim() || null;
    this.eventLocation = props.eventLocation?.trim() || null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Las publicaciones ocultas por moderación no se muestran en el feed. */
  isVisible(): boolean {
    return !this.hidden;
  }

  /** true si `userId` es quien la escribió. Sin sesión (null) nunca es el autor. */
  isAuthoredBy(userId: string | null): boolean {
    return userId !== null && userId === this.authorId;
  }
}
