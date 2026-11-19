import Link from "next/link";
import { Alert } from "@/src/core/components/ui";
import type { PostViewModel } from "../viewmodels/post.viewmodel";
import { LikeButton } from "./LikeButton";

export type PostDetailProps = {
  post: PostViewModel;
  isLiking: boolean;
  onToggleLike: () => void;
  onDelete: () => void;
};

export function PostDetail({ post, isLiking, onToggleLike, onDelete }: PostDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      {post.isHidden && <Alert variant="warning">Esta publicación está oculta por moderación</Alert>}

      <article className="card bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="badge badge-primary badge-outline">{post.typeLabel}</span>
            <time dateTime={post.createdAtIso} className="text-sm text-base-content/70">
              {post.formattedDate}
            </time>
          </div>

          <h1 className="text-2xl font-semibold leading-snug text-pretty break-words">
            {post.title}
          </h1>

          {post.eventSummary && (
            <p className="text-sm font-medium break-words">{post.eventSummary}</p>
          )}

          {post.questionDetails && (
            <section className="rounded-box bg-base-200 p-4">
              <h2 className="text-sm font-semibold">Detalles de la pregunta</h2>
              <p className="mt-1 max-w-[65ch] whitespace-pre-line break-words text-base-content/80">
                {post.questionDetails}
              </p>
            </section>
          )}

          <p className="max-w-[65ch] whitespace-pre-line break-words">{post.content}</p>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-base-200 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{post.authorLabel}</span>
              <LikeButton
                liked={post.likedByMe}
                label={post.likesLabel}
                disabled={isLiking}
                onToggle={onToggleLike}
              />
            </div>

            {post.canManage && (
              <div className="flex flex-wrap gap-2">
                <Link href={`/posts/${post.id}/edit`} className="btn btn-outline btn-sm">
                  Editar
                </Link>
                <button type="button" className="btn btn-outline btn-error btn-sm" onClick={onDelete}>
                  Eliminar publicación
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
