"use client";
import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { loadGarage, loadDetail, saveGarage, removeGarage } from "../store/garage.slice";
import type { Mutation, Removal } from "../viewmodels/garage.viewmodel";
export function useGarage(id?: string) { const dispatch = useAppDispatch(); const state = useAppSelector(s => s.garage); const refresh = useCallback(() => id ? dispatch(loadDetail(id)) : dispatch(loadGarage()), [dispatch, id]); useEffect(() => { void refresh(); }, [refresh]); return { ...state, refresh, save: async (m: Mutation) => { const result = await dispatch(saveGarage(m)); if (saveGarage.fulfilled.match(result)) {
        await refresh();
        return true;
    } return false; }, remove: async (m: Removal) => { const result = await dispatch(removeGarage(m)); if (removeGarage.fulfilled.match(result)) {
        if (m.kind !== "vehicle" || !id)
            await refresh();
        return true;
    } return false; } }; }
