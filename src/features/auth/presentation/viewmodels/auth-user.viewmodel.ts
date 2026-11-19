/**
 * La persona con sesión, lista para la interfaz. Va al estado de Redux, así que
 * es un objeto plano. Nunca lleva el token: ese se queda en la cookie httpOnly.
 */
export interface AuthUserViewModel {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly permissions: string[];
}

/** Lo mínimo que se necesita del token para armar el ViewModel. */
type AuthUserSource = {
  sub: string;
  name?: string;
  role: string;
  permissions?: string[];
};

export const AuthUserViewModelMapper = {
  fromTokenPayload(payload: AuthUserSource): AuthUserViewModel {
    return {
      id: payload.sub,
      name: payload.name ?? "",
      role: payload.role,
      permissions: payload.permissions ?? [],
    };
  },
};
