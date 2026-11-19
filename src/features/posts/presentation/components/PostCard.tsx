import type { PostViewModel } from "../viewmodels/post.viewmodel";

export type PostCardProps = {
  post: PostViewModel;
  onFilterByAuthor: (authorId: string) => void;
  onFilterByVehicle: (vehicleId: string) => void;
};

export function PostCard({ post, onFilterByAuthor, onFilterByVehicle }: PostCardProps) {
  return (
    <article className="card h-full bg-base-100 shadow-sm">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="badge badge-primary badge-outline">{post.typeLabel}</span>
          <time dateTime={post.createdAtIso} className="text-sm text-base-content/70">
            {post.formattedDate}
          </time>
        </div>

        <h2 className="card-title text-lg leading-snug text-pretty break-words">{post.title}</h2>

        {post.eventSummary && <p className="text-sm font-medium break-words">{post.eventSummary}</p>}

        <p className="line-clamp-4 break-words text-base-content/80">{post.excerpt}</p>

        <div className="mt-auto flex flex-col gap-1 pt-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium">{post.authorLabel}</span>
            <span className="text-base-content/70 tabular-nums">{post.likesLabel}</span>
          </div>
          <div className="-ml-3 flex flex-wrap">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onFilterByAuthor(post.authorId)}
            >
              {post.isMine ? "Ver mis publicaciones" : "Más de este autor"}
            </button>
            {post.vehicleId && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onFilterByVehicle(post.vehicleId as string)}
              >
                Más de este vehículo
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
