"use client";

import { useState } from "react";
import { Button, ErrorBanner, ToastContainer } from "@/src/core/components/ui";
import { useToast } from "@/src/core/hooks/use-toast";
import { ProfileCard } from "@/src/features/profile/presentation/components/ProfileCard";
import { ProfileForm } from "@/src/features/profile/presentation/components/ProfileForm";
import { useProfile } from "@/src/features/profile/presentation/hooks/use-profile";
import { profileToFormValues } from "@/src/features/profile/presentation/viewmodels/profile-form.viewmodel";

export function ProfileView() {
  const { profile, isLoading, errorMessage, reload, saveProfile, isSaving, saveError, clearSaveError } =
    useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();

  const startEditing = () => {
    clearSaveError();
    setIsEditing(true);
  };

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {isLoading && (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" aria-label="Cargando perfil" />
        </div>
      )}
      {!profile && errorMessage && <ErrorBanner message={errorMessage} onRetry={reload} />}

      {profile && !isEditing && (
        <ProfileCard profile={profile} actions={<Button onClick={startEditing}>Editar perfil</Button>} />
      )}

      {profile && isEditing && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h1 className="text-2xl font-bold">Editar perfil</h1>
            <ProfileForm
              initialValues={profileToFormValues(profile)}
              email={profile.email}
              isSaving={isSaving}
              errorMessage={saveError}
              onCancel={() => setIsEditing(false)}
              onSubmit={async (values) => {
                if (await saveProfile(values)) {
                  setIsEditing(false);
                  showToast("Perfil actualizado", "success");
                }
              }}
            />
            <p className="text-base-content/60 mt-2 text-xs">
              El nombre del menú superior se actualiza la próxima vez que inicies sesión.
            </p>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
}
