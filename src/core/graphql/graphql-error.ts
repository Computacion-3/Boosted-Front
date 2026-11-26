// Por qué una llamada a la API GraphQL no devolvió lo esperado.
export class GraphQLRequestError extends Error {
  /**
   * Código HTTP que habría devuelto la llamada REST equivalente (por ejemplo
   * 404 si el recurso no existe); 0 si no hubo respuesta (red o tiempo de espera).
   */
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GraphQLRequestError";
    this.status = status;
  }
}
