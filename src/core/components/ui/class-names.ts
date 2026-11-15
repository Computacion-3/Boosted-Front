/**
 * Une clases de Tailwind/daisyUI ignorando los valores vacíos.
 * Ejemplo: classNames("btn", isLoading && "btn-disabled") -> "btn" o "btn btn-disabled".
 */
export function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
