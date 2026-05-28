"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

/**
 * Renders a chat message as GitHub-flavored markdown.
 *
 * Custom component overrides give every element compact, chat-bubble-sized
 * styling that fits inside our glass bubbles without blowing up vertical
 * rhythm. Links open in a new tab. Code blocks scroll horizontally so a
 * long line doesn't break out of the bubble.
 */
export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div
      className={cn(
        "markdown-body text-[14.5px] leading-relaxed text-balance",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

const COMPONENTS: Components = {
  p: ({ children }) => (
    <p className="my-2 first:mt-0 last:mb-0 leading-relaxed">{children}</p>
  ),

  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),

  em: ({ children }) => <em className="italic text-text-primary">{children}</em>,

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-blue-bright underline decoration-accent-blue-bright/40 hover:decoration-accent-blue-bright transition-colors"
    >
      {children}
    </a>
  ),

  ul: ({ children }) => (
    <ul className="my-2 pl-5 list-disc space-y-1 marker:text-accent-purple/70">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="my-2 pl-5 list-decimal space-y-1 marker:text-accent-purple/70">
      {children}
    </ol>
  ),

  li: ({ children }) => <li className="leading-relaxed">{children}</li>,

  h1: ({ children }) => (
    <h1 className="mt-3 mb-1.5 text-base font-semibold text-white tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 mb-1.5 text-[15px] font-semibold text-white tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2.5 mb-1 text-[14px] font-semibold text-white">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-2 mb-1 text-[13px] font-semibold text-white uppercase tracking-wider">
      {children}
    </h4>
  ),

  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-accent-purple/50 pl-3 text-text-secondary italic">
      {children}
    </blockquote>
  ),

  hr: () => <hr className="my-3 border-white/10" />,

  code: (props) => {
    const { className: c, children, ...rest } = props as {
      className?: string;
      children?: React.ReactNode;
    } & React.HTMLAttributes<HTMLElement>;
    const inline = !c?.startsWith("language-");
    if (inline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded-md bg-white/[0.07] text-[0.92em] text-accent-purple-bright font-mono"
          {...rest}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="block font-mono text-[12.5px] leading-relaxed text-text-primary"
        {...rest}
      >
        {children}
      </code>
    );
  },

  pre: ({ children }) => (
    <pre className="my-2 p-3 rounded-2xl bg-black/40 border border-white/8 overflow-x-auto no-scrollbar text-[12.5px]">
      {children}
    </pre>
  ),

  table: ({ children }) => (
    <div className="my-3 overflow-x-auto no-scrollbar -mx-1">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-white/10">{children}</thead>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-white/5 last:border-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-2 py-1.5 text-left text-[11px] uppercase tracking-wider text-text-muted font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 text-text-primary align-top">{children}</td>
  ),
};
