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

/** Lo mínimo que se necesita de la sesión del DAL (getSession) para armar el ViewModel. */
type SessionSource = {
  userId: string;
  name: string;
  role: string;
  permissions: string[];
};

export const AuthUserViewModelMapper = {
  /** Al iniciar sesión: datos del token recién guardado. */
  fromTokenPayload(payload: AuthUserSource): AuthUserViewModel {
    return {
      id: payload.sub,
      name: payload.name ?? "",
      role: payload.role,
      permissions: payload.permissions ?? [],
    };
  },

  /** Al cargar o recargar la página: la sesión que el layout leyó de la cookie. */
  fromSession(session: SessionSource): AuthUserViewModel {
    return {
      id: session.userId,
      name: session.name,
      role: session.role,
      permissions: session.permissions,
    };
  },
};
