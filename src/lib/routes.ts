/**
 * Rutas compartidas entre proxy.ts y las pantallas.
 *
 * HOME_ROUTE es la «home privada»: a donde llega quien inicia sesión y a donde
 * se manda a quien ya tiene sesión e intenta abrir /login o /register.
 * Hoy es /events; cuando exista el feed o el garaje, se cambia solo aquí.
 */
export const HOME_ROUTE = "/events";

export const LOGIN_ROUTE = "/login";
