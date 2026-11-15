import type { ReactNode } from "react";
import { classNames } from "./class-names";

export type CardProps = {
  title?: ReactNode;
  /** Botones o enlaces que van al pie de la tarjeta. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function Card({ title, actions, children, className }: CardProps) {
  return (
    <article className={classNames("card bg-base-100 shadow-sm", className)}>
      <div className="card-body">
        {title && <h2 className="card-title">{title}</h2>}
        {children}
        {actions && <div className="card-actions justify-end">{actions}</div>}
      </div>
    </article>
  );
}
