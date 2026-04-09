import ReactMarkdown from "react-markdown";

export default function Markdown({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
