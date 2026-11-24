import type { ReactNode } from "react";
import type { ProfileViewModel } from "../viewmodels/profile.viewmodel";
import { ProfileAvatar } from "./ProfileAvatar";

export type ProfileCardProps = {
  profile: ProfileViewModel;
  /** Botones al pie (por ejemplo, «Editar perfil»). */
  actions?: ReactNode;
};

/** Vista de solo lectura del perfil. */
export function ProfileCard({ profile, actions }: ProfileCardProps) {
  return (
    <article className="card bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <ProfileAvatar avatarUrl={profile.avatarUrl} initials={profile.initials} name={profile.name} />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold break-words">{profile.name}</h1>
            <p className="text-base-content/70">@{profile.username}</p>
            <span className="badge badge-primary badge-outline mt-2">{profile.roleLabel}</span>
          </div>
        </div>

        {profile.bio ? (
          <p className="whitespace-pre-line">{profile.bio}</p>
        ) : (
          <p className="text-base-content/60 italic">Aún no has escrito una biografía.</p>
        )}

        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-base-content/60">Correo</dt>
            <dd className="break-all">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-base-content/60">Ubicación</dt>
            <dd>{profile.location ?? "Sin indicar"}</dd>
          </div>
          <div>
            <dt className="text-base-content/60">Miembro desde</dt>
            <dd>{profile.memberSince}</dd>
          </div>
        </dl>

        {actions && <div className="card-actions justify-end">{actions}</div>}
      </div>
    </article>
  );
}
