"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import type { EventFilters } from "../../domain/repositories/event.repository";
import { fetchEventById, fetchEvents } from "../store/events.slice";

/**
 * Hook fachada del listado de eventos. Los componentes no ven Redux: reciben
 * los eventos y funciones para filtrar, paginar y recargar.
 */
export function useEvents() {
  const dispatch = useAppDispatch();
  const { query, items, total, status, errorMessage } = useAppSelector(
    (state) => state.events.list,
  );

  // Primera carga (y recarga cuando otra pantalla deja el listado en "idle").
  useEffect(() => {
    if (status === "idle") dispatch(fetchEvents(query));
  }, [dispatch, status, query]);

  /** Cambiar filtros vuelve a la página 1. */
  const applyFilters = useCallback(
    (filters: EventFilters) => {
      dispatch(fetchEvents({ ...filters, page: 1, limit: query.limit }));
    },
    [dispatch, query.limit],
  );

  const goToPage = useCallback(
    (page: number) => {
      dispatch(fetchEvents({ ...query, page }));
    },
    [dispatch, query],
  );

  const reload = useCallback(() => {
    dispatch(fetchEvents(query));
  }, [dispatch, query]);

  const filters: EventFilters = {
    city: query.city,
    type: query.type,
    startDate: query.startDate,
    endDate: query.endDate,
  };

  return {
    events: items,
    total,
    page: query.page,
    limit: query.limit,
    filters,
    isLoading: status === "loading" || status === "idle",
    errorMessage,
    applyFilters,
    goToPage,
    reload,
  };
}

/** Hook fachada del detalle de un evento. */
export function useEventDetail(id: string) {
  const dispatch = useAppDispatch();
  const { item, status, errorMessage } = useAppSelector((state) => state.events.detail);

  useEffect(() => {
    dispatch(fetchEventById(id));
  }, [dispatch, id]);

  const reload = useCallback(() => {
    dispatch(fetchEventById(id));
  }, [dispatch, id]);

  return {
    // Mientras carga otro evento, no se muestra el anterior.
    event: item?.id === id ? item : null,
    isLoading: status === "loading" || status === "idle",
    errorMessage,
    reload,
  };
}
