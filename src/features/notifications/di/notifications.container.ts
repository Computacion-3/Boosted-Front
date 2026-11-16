import { ConnectNotificationsUseCase } from "../domain/usecases/connect-notifications.usecase";
import { DisconnectNotificationsUseCase } from "../domain/usecases/disconnect-notifications.usecase";
import { NotificationsSocketIoDatasource } from "../infrastructure/datasources/notifications-socket-io-datasource";
import { requestSocketTicket } from "../infrastructure/datasources/socket-ticket-datasource";
import { NotificationsRepositoryImpl } from "../infrastructure/repositories/notifications.repository.impl";

// Excepción a la regla de los contenedores `server-only`: el socket vive en el
// navegador y no pasa por el servidor de Next, así que este contenedor también
// se carga allí. Solo el Route Handler del ticket corre en el servidor.
//
// `NEXT_PUBLIC_WS_URL` se lee con su nombre literal: Next la sustituye al construir.
const datasource = new NotificationsSocketIoDatasource({
  url: process.env.NEXT_PUBLIC_WS_URL ?? "",
  getTicket: requestSocketTicket,
});
const repository = new NotificationsRepositoryImpl(datasource);

export const notificationsContainer = {
  connectNotifications: new ConnectNotificationsUseCase(repository),
  disconnectNotifications: new DisconnectNotificationsUseCase(repository),
};

export type NotificationsContainer = typeof notificationsContainer;
