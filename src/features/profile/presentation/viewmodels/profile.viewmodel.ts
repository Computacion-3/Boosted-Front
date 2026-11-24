import type { UserProfile } from "../../domain/entities/user-profile";

/** El perfil listo para pintar: datos planos y serializables (van a Redux). */
export interface ProfileViewModel {
  readonly id: string;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly bio: string | null;
  readonly city: string | null;
  readonly country: string | null;
  readonly avatarUrl: string | null;
  /** "Cali, Colombia" o null. */
  readonly location: string | null;
  readonly roleLabel: string;
  /** Iniciales para el avatar cuando no hay foto ("JR"). */
  readonly initials: string;
  /** "noviembre de 2026" */
  readonly memberSince: string;
}

const ROLE_LABELS: Record<string, string> = {
  aficionado: "Aficionado",
  moderador: "Moderador",
  administrador: "Administrador",
};

const memberSinceFormat = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  year: "numeric",
  timeZone: "America/Bogota",
});

/** "Juan Sebastián Romero" -> "JR": primera letra de la primera y de la última palabra (como el menú). */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return (words[0].charAt(0) + last).toUpperCase();
}

export class ProfileViewModelMapper {
  static toViewModel(profile: UserProfile): ProfileViewModel {
    return {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      email: profile.email,
      bio: profile.bio,
      city: profile.city,
      country: profile.country,
      avatarUrl: profile.avatarUrl,
      location: profile.location(),
      roleLabel: ROLE_LABELS[profile.role] ?? profile.role,
      initials: getInitials(profile.name),
      memberSince: memberSinceFormat.format(profile.createdAt),
    };
  }
}
