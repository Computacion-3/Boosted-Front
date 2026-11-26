/**
 * Error de regla de negocio: lo lanzan las entidades y los casos de uso cuando
 * se rompe una invariante (por ejemplo, "La fecha inicial no puede ser posterior a la final").
 * Su mensaje ya está en español y es seguro mostrarlo tal cual.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}
