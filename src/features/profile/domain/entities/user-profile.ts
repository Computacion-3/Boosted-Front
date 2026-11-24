import { DomainError } from "@/src/core/errors/domain-error";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
export const PROFILE_LIMITS = { name: 100, usernameMin: 3, usernameMax: 30, bio: 500 } as const;

/** true si es una dirección http(s) válida (como pide la API para la foto). */
export function isValidAvatarUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Campos del perfil que la persona puede editar. El correo y la contraseña no se editan aquí. */
export interface ProfileFields {
  name: string;
  username: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
}

/**
 * Reglas del perfil (las mismas del backend). Revisa solo los campos presentes,
 * así sirve para la entidad completa y para una edición parcial.
 */
export function validateProfileFields(fields: Partial<ProfileFields>): void {
  if (fields.name !== undefined) {
    const name = fields.name.trim();
    if (name === "") throw new DomainError("El nombre es obligatorio");
    if (name.length > PROFILE_LIMITS.name) {
      throw new DomainError(`El nombre puede tener máximo ${PROFILE_LIMITS.name} caracteres`);
    }
  }
  if (fields.username !== undefined) {
    const username = fields.username.trim();
    if (username.length < PROFILE_LIMITS.usernameMin || username.length > PROFILE_LIMITS.usernameMax) {
      throw new DomainError(
        `El nombre de usuario debe tener entre ${PROFILE_LIMITS.usernameMin} y ${PROFILE_LIMITS.usernameMax} caracteres`,
      );
    }
    if (!USERNAME_PATTERN.test(username)) {
      throw new DomainError("El nombre de usuario solo puede tener letras, números y guion bajo");
    }
  }
  if (fields.bio && fields.bio.length > PROFILE_LIMITS.bio) {
    throw new DomainError(`La biografía puede tener máximo ${PROFILE_LIMITS.bio} caracteres`);
  }
  if (fields.avatarUrl && !isValidAvatarUrl(fields.avatarUrl)) {
    throw new DomainError("La foto de perfil debe ser una URL que empiece por http:// o https://");
  }
}

export interface UserProfileProps extends ProfileFields {
  id: string;
  email: string;
  /** aficionado | moderador | administrador */
  role: string;
  createdAt: Date;
}

/** El perfil de la persona que inició sesión. */
export class UserProfile {
  readonly id: string;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly bio: string | null;
  readonly city: string | null;
  readonly country: string | null;
  readonly avatarUrl: string | null;
  readonly role: string;
  readonly createdAt: Date;

  constructor(props: UserProfileProps) {
    if (props.id.trim() === "") throw new DomainError("El perfil no tiene id");
    validateProfileFields(props);

    this.id = props.id;
    this.name = props.name.trim();
    this.username = props.username.trim();
    this.email = props.email;
    this.bio = props.bio?.trim() || null;
    this.city = props.city?.trim() || null;
    this.country = props.country?.trim() || null;
    this.avatarUrl = props.avatarUrl?.trim() || null;
    this.role = props.role;
    this.createdAt = props.createdAt;
  }

  /** "Cali, Colombia", solo uno de los dos, o null si no hay ninguno. */
  location(): string | null {
    const parts = [this.city, this.country].filter((part): part is string => part !== null);
    return parts.length > 0 ? parts.join(", ") : null;
  }
}
