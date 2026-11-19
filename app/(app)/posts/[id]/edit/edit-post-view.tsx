"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, ErrorBanner } from "@/src/core/components/ui";
import { PostForm } from "@/src/features/posts/presentation/components/PostForm";
import { usePostDetail } from "@/src/features/posts/presentation/hooks/use-post-detail";
import { usePostEditor } from "@/src/features/posts/presentation/hooks/use-post-editor";
import { toPostFormValues } from "@/src/features/posts/presentation/viewmodels/post-form.viewmodel";

export function EditPostView({ id }: { id: string }) {
  const router = useRouter();
  const { post, isLoading, errorMessage: loadError, reload } = usePostDetail(id);
  const { isSubmitting, errorMessage, update } = usePostEditor();

  const backLink = (
    <Link href={`/posts/${id}`} className="link link-hover text-sm">
      <span aria-hidden="true">←</span> Volver a la publicación
    </Link>
  );

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {backLink}

      {isLoading ? (
        <div role="status" className="flex flex-col gap-4">
          <span className="sr-only">Cargando publicación…</span>
          <div className="skeleton h-9 w-2/3" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-40 w-full" />
          <div className="flex gap-2">
            <div className="skeleton h-10 w-28" />
            <div className="skeleton h-10 w-24" />
          </div>
        </div>
      ) : loadError && !post ? (
        <ErrorBanner message={loadError} onRetry={reload} />
      ) : post && !post.canManage ? (
        <Alert variant="error">No tienes permiso para editar esta publicación</Alert>
      ) : post ? (
        <>
          <header>
            <h1 className="text-2xl font-bold md:text-3xl">Editar publicación</h1>
          </header>
          <PostForm
            key={post.id}
            initialValues={toPostFormValues(post)}
            submitLabel="Guardar cambios"
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onSubmit={async (values) => {
              const updated = await update(post.id, values);
              if (updated) router.push(`/posts/${post.id}`);
            }}
            onCancel={() => router.push(`/posts/${post.id}`)}
          />
        </>
      ) : null}
    </section>
  );
}
