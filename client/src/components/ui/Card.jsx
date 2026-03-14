/**
 * Card — base UI component.
 * TODO: implement with Tailwind styling and accessibility.
 */
export default function Card({ children, ...props }) {
  return <div {...props}>{children}</div>;
}
