/**
 * Button — base UI component.
 * TODO: implement with Tailwind styling and accessibility.
 */
export default function Button({ children, ...props }) {
  return <div {...props}>{children}</div>;
}
