export default function Card({ children, className = '', as = 'article', ...props }) {
  const Tag = as;
  return <Tag className={`card-ui${className ? ` ${className}` : ''}`} {...props}>{children}</Tag>;
}
