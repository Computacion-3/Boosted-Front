"use client";
import { useState, type FormEvent } from "react";
import type { Mutation, VehicleInput, ModificationInput, JournalInput, Modification } from "../../domain/entities/garage";
type Field = {
    key: string;
    label: string;
    kind?: "number" | "date" | "textarea";
    required?: boolean;
    max?: number;
    options?: {
        value: string;
        label: string;
    }[];
    step?: string;
};
const options = (values: string[], labels: string[]) => values.map((value, i) => ({ value, label: labels[i] }));
const vehicle: Field[] = [{ key: "brand", label: "Marca", required: true, max: 60 }, { key: "model", label: "Modelo", required: true, max: 80 }, { key: "year", label: "Año", kind: "number", required: true }, { key: "version", label: "Versión", max: 80 }, { key: "engine", label: "Motor", max: 100 }, { key: "transmission", label: "Transmisión", max: 60 }, { key: "drivetrain", label: "Tracción", max: 60 }, { key: "color", label: "Color", max: 40 }, { key: "horsepower", label: "Potencia (hp)", kind: "number", step: "any" }, { key: "torque", label: "Torque (Nm)", kind: "number", step: "any" }, { key: "consumption", label: "Consumo (L/100 km)", kind: "number", step: "any" }, { key: "mileage", label: "Kilometraje", kind: "number" }, { key: "description", label: "Descripción", kind: "textarea", max: 2000 }, { key: "visibility", label: "Visibilidad", options: options(["private", "public"], ["Privado", "Público"]) }];
const modification: Field[] = [{ key: "name", label: "Nombre", required: true, max: 120 }, { key: "category", label: "Categoría", required: true, max: 60 }, { key: "brand", label: "Marca", max: 80 }, { key: "partModel", label: "Modelo de pieza", max: 100 }, { key: "status", label: "Estado", options: options(["planned", "in_progress", "installed", "removed"], ["Planeada", "En progreso", "Instalada", "Retirada"]) }, { key: "installationDate", label: "Fecha de instalación", kind: "date" }, { key: "partCost", label: "Costo pieza (COP)", kind: "number" }, { key: "installationCost", label: "Costo instalación (COP)", kind: "number" }, { key: "purchaseLocation", label: "Lugar de compra", max: 150 }, { key: "notes", label: "Notas", kind: "textarea", max: 2000 }];
const journal: Field[] = [{ key: "title", label: "Título", required: true, max: 120 }, { key: "content", label: "Contenido", kind: "textarea", required: true, max: 5000 }, { key: "type", label: "Tipo", options: options(["progress", "purchase", "problem", "goal"], ["Avance", "Compra", "Problema", "Objetivo"]) }, { key: "entryDate", label: "Fecha", kind: "date", required: true }, { key: "expense", label: "Gasto independiente (COP)", kind: "number" }];
export function GarageForm({ kind, id, vehicleId, initial, mods = [], saving, onSave, onCancel }: {
    kind: Mutation["kind"];
    id?: string;
    vehicleId?: string;
    initial?: object;
    mods?: Modification[];
    saving: boolean;
    onSave: (m: Mutation) => Promise<boolean>;
    onCancel: () => void;
}) {
    const fields: Field[] = kind === "vehicle" ? vehicle : kind === "modification" ? modification : [...journal, { key: "modificationId", label: "Modificación vinculada", options: [{ value: "", label: "Ninguna" }, ...mods.map(m => ({ value: m.id, label: m.name }))] }];
    const [error, setError] = useState("");
    const initialValues = Object.fromEntries(Object.entries(initial ?? {}).map(([k, v]) => [k, v == null ? "" : String(v)]));
    const [values, setValues] = useState<Record<string, string>>(() => ({ ...Object.fromEntries(fields.filter(f => f.options).map(f => [f.key, f.options![0].value])), ...initialValues }));
    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        const data: Record<string, string | number | null> = {};
        for (const f of fields) {
            const value = (values[f.key] ?? "").trim();
            if (value !== "")
                data[f.key] = f.kind === "number" ? Number(value) : value;
            else if (f.key === "modificationId")
                data[f.key] = null;
            else if (f.key === "description" || f.key === "notes")
                data[f.key] = "";
            else if (["partCost", "installationCost", "expense"].includes(f.key))
                data[f.key] = 0;
            else if (f.required) {
                setError(`${f.label} es obligatorio.`);
                return;
            }
        }
        if (kind === "journal" && data.modificationId && Number(data.expense ?? 0) > 0) {
            setError("Una entrada vinculada debe tener gasto cero.");
            return;
        }
        const m: Mutation = kind === "vehicle" ? { kind, id, values: data as unknown as VehicleInput } : kind === "modification" ? { kind, id, vehicleId: vehicleId!, values: data as unknown as ModificationInput } : { kind, id, vehicleId: vehicleId!, values: data as unknown as JournalInput };
        if (await onSave(m))
            onCancel();
    }
    return <form className="card bg-base-200 p-4 gap-3" onSubmit={submit}><h2 className="text-xl font-bold">{id ? "Editar" : "Crear"} {kind === "vehicle" ? "vehículo" : kind === "modification" ? "modificación" : "entrada"}</h2><div className="grid gap-3 sm:grid-cols-2">{fields.map(f => { const props = { name: f.key, value: values[f.key] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues(v => ({ ...v, [f.key]: e.target.value })), required: f.required }; return <label key={f.key} className="flex flex-col gap-1"><span>{f.label}</span>{f.options ? <select className="select w-full" {...props}>{f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select> : f.kind === "textarea" ? <textarea className="textarea w-full" maxLength={f.max} {...props}/> : <input className="input w-full" type={f.kind ?? "text"} maxLength={f.max} min={f.kind === "number" ? (f.key === "year" ? 1886 : 0) : undefined} max={f.key === "year" ? new Date().getFullYear() + 1 : undefined} step={f.step ?? (f.kind === "number" ? "1" : undefined)} {...props}/>}</label>; })}</div>{error && <p role="alert" className="text-error">{error}</p>}<div className="flex gap-2"><button className="btn btn-primary" disabled={saving}>Guardar</button><button type="button" className="btn" onClick={onCancel} disabled={saving}>Cancelar</button></div></form>;
}
