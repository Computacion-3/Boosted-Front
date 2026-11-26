import { Button } from "@/src/core/components/ui";
import type { PostViewModel } from "../viewmodels/post.viewmodel";
import { PostCard } from "./PostCard";

export type PostListProps = {
  posts: PostViewModel[];
  isLoading: boolean;
  /** Si hay algún filtro activo (cambia el texto del estado vacío). */
  hasFilters: boolean;
  onFilterByAuthor: (authorId: string) => void;
  onFilterByVehicle: (vehicleId: string) => void;
  onClearFilters: () => void;
  onToggleLike: (postId: string) => void;
  likingIds: string[];
};

const SKELETON_COUNT = 6;
const LIST_LAYOUT = "grid grid-cols-1 gap-4 md:grid-cols-2";

/** Una tarjeta vacía con la misma forma que PostCard: así la página no salta al cargar. */
function PostCardSkeleton() {
  return (
    <div className="card h-full bg-base-100 shadow-sm">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="skeleton h-4 w-20" />
        </div>
        <div className="skeleton h-6 w-3/4" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
        <div className="skeleton mt-2 h-8 w-40" />
      </div>
    </div>
  );
}

export function PostList({
  posts,
  isLoading,
  hasFilters,
  onFilterByAuthor,
  onFilterByVehicle,
  onClearFilters,
  onToggleLike,
  likingIds,
}: PostListProps) {
  if (isLoading) {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">Cargando publicaciones…</span>
        <div aria-hidden="true" className={LIST_LAYOUT}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-box bg-base-100 p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold">
          {hasFilters ? "Nada coincide con tus filtros" : "Todavía no hay publicaciones"}
        </h2>
        <p className="max-w-[45ch] text-base-content/70">
          {hasFilters
            ? "Prueba con otras palabras o quita algún filtro."
            : "Cuando alguien publique, lo verás aquí."}
        </p>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <ul className={LIST_LAYOUT}>
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard
            post={post}
            onFilterByAuthor={onFilterByAuthor}
            onFilterByVehicle={onFilterByVehicle}
            onToggleLike={onToggleLike}
            isLiking={likingIds.includes(post.id)}
          />
        </li>
      ))}
    </ul>
  );
}
