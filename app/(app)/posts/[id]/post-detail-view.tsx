"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorBanner, ToastContainer } from "@/src/core/components/ui";
import { DeletePostModal } from "@/src/features/posts/presentation/components/DeletePostModal";
import { PostDetail } from "@/src/features/posts/presentation/components/PostDetail";
import { usePostDetail } from "@/src/features/posts/presentation/hooks/use-post-detail";
import { usePostEditor } from "@/src/features/posts/presentation/hooks/use-post-editor";
import { usePostsToast } from "@/src/features/posts/presentation/hooks/use-posts-toast";

function BackLink() {
  return (
    <Link href="/posts" className="link link-hover text-sm font-medium">
      <span aria-hidden="true">←</span> Volver a la comunidad
    </Link>
  );
}

/** Esqueleto con la misma forma que PostDetail. */
function PostDetailSkeleton() {
  return (
    <div role="status" className="card bg-base-100 shadow-sm">
      <span className="sr-only">Cargando publicación…</span>
      <div className="card-body gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-4 w-28" />
        </div>
        <div className="skeleton h-8 w-3/4" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-base-200 pt-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export function PostDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { post, isLoading, errorMessage, isLiking, toggleLike, reload } = usePostDetail(id);
  const { remove, isSubmitting } = usePostEditor();
  const { toasts, dismissToast } = usePostsToast("detail");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleConfirmDelete = async () => {
    if (!post) return;
    const ok = await remove(post.id);
    if (ok) router.push("/posts");
    else setIsDeleteOpen(false); // el toast de error lo emite el store
  };

  return (
    <section className="flex flex-col gap-4">
      <BackLink />

      {isLoading && !post ? (
        <PostDetailSkeleton />
      ) : post ? (
        <>
          <PostDetail
            post={post}
            isLiking={isLiking}
            onToggleLike={toggleLike}
            onDelete={() => setIsDeleteOpen(true)}
          />
          <DeletePostModal
            isOpen={isDeleteOpen}
            postTitle={post.title}
            isDeleting={isSubmitting}
            onConfirm={handleConfirmDelete}
            onClose={() => setIsDeleteOpen(false)}
          />
        </>
      ) : errorMessage ? (
        <ErrorBanner message={errorMessage} onRetry={reload} />
      ) : null}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
}
