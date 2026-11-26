import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

// Versiones tipadas de useDispatch y useSelector. Úsalas siempre en lugar de
// las originales: así el estado y los thunks quedan tipados sin repetir tipos.
// Solo las importan los hooks fachada de cada feature (presentation/hooks),
// nunca los componentes.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
