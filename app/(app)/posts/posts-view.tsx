"use client";

import { ErrorBanner, Pagination } from "@/src/core/components/ui";
import { PostFiltersBar } from "@/src/features/posts/presentation/components/PostFiltersBar";
import { PostList } from "@/src/features/posts/presentation/components/PostList";
import { PostResultsSummary } from "@/src/features/posts/presentation/components/PostResultsSummary";
import { usePosts } from "@/src/features/posts/presentation/hooks/use-posts";

export function PostsView() {
  const {
    posts,
    total,
    page,
    limit,
    filters,
    hasFilters,
    isLoading,
    errorMessage,
    applyFilters,
    goToPage,
    filterByAuthor,
    filterByVehicle,
    reload,
  } = usePosts();

  // La paginación está al final de la lista: al cambiar de página se vuelve arriba.
  const handlePageChange = (next: number) => {
    goToPage(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <section className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold md:text-3xl">Comunidad</h1>
        <p className="text-base-content/70">Avances, dudas y recomendaciones de otros aficionados.</p>
      </header>

      <PostFiltersBar value={filters} onChange={applyFilters} />

      {errorMessage ? (
        <ErrorBanner message={errorMessage} onRetry={reload} />
      ) : (
        <>
          <PostResultsSummary page={page} limit={limit} total={total} />
          <PostList
            posts={posts}
            isLoading={isLoading}
            hasFilters={hasFilters}
            onFilterByAuthor={filterByAuthor}
            onFilterByVehicle={filterByVehicle}
            onClearFilters={() => applyFilters({})}
          />
          <Pagination page={page} total={total} limit={limit} onChange={handlePageChange} />
        </>
      )}
    </section>
  );
}
