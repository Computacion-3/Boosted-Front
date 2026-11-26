"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostForm } from "@/src/features/posts/presentation/components/PostForm";
import { usePostEditor } from "@/src/features/posts/presentation/hooks/use-post-editor";
import { EMPTY_POST_FORM } from "@/src/features/posts/presentation/viewmodels/post-form.viewmodel";

export function NewPostView() {
  const router = useRouter();
  const { isSubmitting, errorMessage, create } = usePostEditor();

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link href="/posts" className="link link-hover text-sm">
        <span aria-hidden="true">←</span> Volver a la comunidad
      </Link>

      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Nueva publicación</h1>
        <p className="text-base-content/70">Comparte un avance, una duda o una recomendación con la comunidad.</p>
      </header>

      <PostForm
        initialValues={EMPTY_POST_FORM}
        submitLabel="Publicar"
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onSubmit={async (values) => {
          const post = await create(values);
          if (post) router.push(`/posts/${post.id}`);
        }}
        onCancel={() => router.push("/posts")}
      />
    </section>
  );
}
