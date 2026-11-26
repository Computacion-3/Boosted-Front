"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorBanner, ToastContainer } from "@/src/core/components/ui";
import { CommentForm } from "@/src/features/comments/presentation/components/CommentForm";
import { CommentList } from "@/src/features/comments/presentation/components/CommentList";
import { useComments } from "@/src/features/comments/presentation/hooks/use-comments";
import { DeletePostModal } from "@/src/features/posts/presentation/components/DeletePostModal";
import { ModerationBar } from "@/src/features/posts/presentation/components/ModerationBar";
import { PostDetail } from "@/src/features/posts/presentation/components/PostDetail";
import { usePostDetail } from "@/src/features/posts/presentation/hooks/use-post-detail";
import { usePostEditor } from "@/src/features/posts/presentation/hooks/use-post-editor";
import { usePostModeration } from "@/src/features/posts/presentation/hooks/use-post-moderation";
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

/** Comentarios de la publicación: se monta solo cuando la publicación ya cargó. */
function CommentsSection({ postId }: { postId: string }) {
  const {
    comments,
    count,
    isLoading,
    errorMessage,
    isAdding,
    addError,
    busyIds,
    itemErrors,
    add,
    update,
    remove,
    reload,
  } = useComments(postId);

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-4">
      <h2 id="comments-heading" className="text-lg font-semibold">
        {isLoading || errorMessage ? "Comentarios" : `Comentarios (${count})`}
      </h2>
      <CommentForm isSubmitting={isAdding} errorMessage={addError} onSubmit={add} />
      <CommentList
        comments={comments}
        isLoading={isLoading}
        errorMessage={errorMessage}
        busyIds={busyIds}
        itemErrors={itemErrors}
        onUpdate={update}
        onDelete={remove}
        onRetry={reload}
      />
    </section>
  );
}

export function PostDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { post, isLoading, errorMessage, isLiking, toggleLike, reload } = usePostDetail(id);
  const { remove, isSubmitting } = usePostEditor();
  const { hide, restore, isSubmitting: isModerating } = usePostModeration();
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
          {post.canModerate && (
            <ModerationBar
              postTitle={post.title}
              isHidden={post.isHidden}
              isSubmitting={isModerating}
              onHide={() => hide(post.id)}
              onRestore={() => restore(post.id)}
            />
          )}
          <DeletePostModal
            isOpen={isDeleteOpen}
            postTitle={post.title}
            isDeleting={isSubmitting}
            onConfirm={handleConfirmDelete}
            onClose={() => setIsDeleteOpen(false)}
          />
          <CommentsSection postId={post.id} />
        </>
      ) : errorMessage ? (
        <ErrorBanner message={errorMessage} onRetry={reload} />
      ) : null}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
}
