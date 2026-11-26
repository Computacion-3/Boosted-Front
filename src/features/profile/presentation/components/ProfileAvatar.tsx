"use client";

import { useState } from "react";

export type ProfileAvatarProps = {
  avatarUrl: string | null;
  initials: string;
  name: string;
};

/** Foto de perfil; si no hay o no carga, muestra las iniciales. */
export function ProfileAvatar({ avatarUrl, initials, name }: ProfileAvatarProps) {
  // Guarda la URL que falló: si la persona pone otra, se vuelve a intentar.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = avatarUrl !== null && avatarUrl !== failedUrl;

  return (
    <div className="avatar avatar-placeholder">
      <div className="w-24 rounded-full bg-neutral text-neutral-content">
        {showImage ? (
          // La URL la escribe la persona y puede ser de cualquier dominio: next/image exigiría
          // declarar cada dominio en next.config, por eso aquí va un <img> normal.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={`Foto de ${name}`} onError={() => setFailedUrl(avatarUrl)} />
        ) : (
          <span className="text-3xl" aria-hidden="true">
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}
