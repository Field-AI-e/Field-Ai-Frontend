// components/Markdown.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

type Props = {
  content: string;
  className?: string;
};

export default function Markdown({ content, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        // GitHub tables, strikethrough, task-lists, autolinks
        remarkPlugins={[remarkGfm]}
        // Allow a safe subset of inline HTML inside markdown
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-3" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-5 mb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
          p:  ({node, ...props}) => <p className="leading-7 my-2" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2" {...props} />,
          li: ({node, ...props}) => <li className="my-1" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 pl-4 italic opacity-90 my-3" {...props} />
          ),
          code: ({node, inline, className, children, ...props}: any) => {
            // `rehype-highlight` adds hljs classes automatically
            if (inline) {
              return <code className="px-1 py-0.5 rounded bg-neutral-100" {...props}>{children}</code>;
            }
            return (
              <pre className="overflow-auto rounded-lg p-3 bg-neutral-950 text-neutral-50">
                <code className={className} {...props}>{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
