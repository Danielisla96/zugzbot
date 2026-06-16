"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const components: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="text-2xl font-bold tracking-tight mt-6 mb-3" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-xl font-semibold tracking-tight mt-5 mb-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-medium mt-4 mb-2" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="text-sm leading-relaxed mb-3 text-muted-foreground" {...props}>
      {children}
    </p>
  ),
  code: ({ children, className: codeClassName, ...props }) => {
    const isInline = !codeClassName;
    if (isInline) {
      return (
        <code
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code {...props}>{children}</code>
      </pre>
    );
  },
  ul: ({ children, ...props }) => (
    <ul className="ml-6 mb-3 space-y-1 list-disc" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="ml-6 mb-3 space-y-1 list-decimal" {...props}>
      {children}
    </ol>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-2 border-primary/30 pl-4 italic text-muted-foreground mb-3"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, ...props }) => (
    <a
      className="text-primary underline underline-offset-2 hover:text-primary/80"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-3">
      <table className="w-full border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border border-border px-3 py-2 bg-muted/30 text-left font-medium text-sm"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-border px-3 py-2 text-sm" {...props}>
      {children}
    </td>
  ),
  li: ({ children, ...props }) => (
    <li className="text-sm text-muted-foreground" {...props}>
      {children}
    </li>
  ),
  hr: (props) => <hr className="border-border my-4" {...props} />,
  pre: ({ children, ...props }) => (
    <pre
      className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-3"
      {...props}
    >
      {children}
    </pre>
  ),
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
