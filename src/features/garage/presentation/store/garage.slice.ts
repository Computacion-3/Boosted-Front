import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { GarageList, GarageDetail, Mutation, Removal } from "../../domain/entities/garage";
import { listGarageAction, detailGarageAction, saveGarageAction, removeGarageAction } from "../actions/garage.actions";
export const loadGarage = createAsyncThunk("garage/list", async (_: void, a) => { const r = await listGarageAction(); return r.ok ? r.data : a.rejectWithValue(r.message); });
export const loadDetail = createAsyncThunk("garage/detail", async (id: string, a) => { const r = await detailGarageAction(id); return r.ok ? r.data : a.rejectWithValue(r.message); });
export const saveGarage = createAsyncThunk("garage/save", async (m: Mutation, a) => { const r = await saveGarageAction(m); return r.ok ? r.data : a.rejectWithValue(r.message); });
export const removeGarage = createAsyncThunk("garage/remove", async (m: Removal, a) => { const r = await removeGarageAction(m); return r.ok ? r.data : a.rejectWithValue(r.message); });
interface State {
    list: GarageList | null;
    detail: GarageDetail | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
    requestId: string | null;
}
const initialState: State = { list: null, detail: null, loading: false, saving: false, error: null, requestId: null };
const slice = createSlice({ name: "garage", initialState, reducers: {}, extraReducers: b => { b.addCase(loadGarage.pending, (s, a) => { s.loading = true; s.error = null; s.requestId = a.meta.requestId; }).addCase(loadDetail.pending, (s, a) => { s.loading = true; s.detail = null; s.error = null; s.requestId = a.meta.requestId; }).addCase(loadGarage.fulfilled, (s, a) => { if (s.requestId === a.meta.requestId) {
        s.list = a.payload;
        s.loading = false;
    } }).addCase(loadDetail.fulfilled, (s, a) => { if (s.requestId === a.meta.requestId) {
        s.detail = a.payload;
        s.loading = false;
    } }).addMatcher(isAnyOf(loadGarage.rejected, loadDetail.rejected), (s, a) => { if (s.requestId === a.meta.requestId) {
        s.loading = false;
        s.error = typeof a.payload === "string" ? a.payload : "No se pudo cargar el garaje.";
    } }).addMatcher(isAnyOf(saveGarage.pending, removeGarage.pending), s => { s.saving = true; s.error = null; }).addMatcher(isAnyOf(saveGarage.fulfilled, removeGarage.fulfilled), s => { s.saving = false; }).addMatcher(isAnyOf(saveGarage.rejected, removeGarage.rejected), (s, a) => { s.saving = false; s.error = typeof a.payload === "string" ? a.payload : "No se pudo guardar el cambio."; }); } });
export const garageReducer = slice.reducer;
