"use client";

import { useRouter } from "next/navigation";
import { ToastContainer } from "@/src/core/components/ui";
import { useAuth } from "@/src/features/auth/presentation/hooks/use-auth";
import { NotificationBell } from "@/src/features/notifications/presentation/components/NotificationBell";
import { useNotifications } from "@/src/features/notifications/presentation/hooks/use-notifications";
import { useNotificationToasts } from "@/src/features/notifications/presentation/hooks/use-notification-toasts";
import { Header, type HeaderProps } from "@/src/shared/components/Header";

/**
 * Header de las secciones de la aplicación con el cierre de sesión y la campana de
 * notificaciones conectados. Existe porque el layout de (app) es un Server Component y no
 * puede usar hooks: el layout le pasa los datos y este componente agrega `onLogout`, la
 * campana y los avisos flotantes de las notificaciones nuevas.
 */
export function AppHeader({ user, navItems }: Omit<HeaderProps, "onLogout" | "notificationsSlot">) {
  const router = useRouter();
  const { logout } = useAuth();
  const { items, unreadCount, connection, errorMessage, markAllRead } = useNotifications();
  const { toasts, dismissToast } = useNotificationToasts();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
    // Vuelve a pedir los Server Components: los layouts leen la cookie (ya borrada)
    // y dejan de mostrar a la persona.
    router.refresh();
  };

  return (
    <>
      <Header
        user={user}
        navItems={navItems}
        onLogout={handleLogout}
        notificationsSlot={
          user ? (
            <NotificationBell
              items={items}
              unreadCount={unreadCount}
              connection={connection}
              errorMessage={errorMessage}
              onMarkAllRead={markAllRead}
            />
          ) : undefined
        }
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
