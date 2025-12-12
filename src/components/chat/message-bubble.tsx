import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "@/types/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 md:gap-3 py-1", // 稍微减小 py 使布局更紧凑
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          // 1. 布局核心：w-fit (自适应宽度) + max-w (最大限制) + grid (强制约束内部元素)
          "relative grid grid-cols-1 w-fit max-w-[85%] md:max-w-[85%]",
          "rounded-2xl px-3 py-2 md:px-4 md:py-3 text-sm shadow-sm",
          // 2. 溢出处理：hidden 防止圆角溢出
          "overflow-hidden",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted text-foreground rounded-tl-none"
        )}
      >
        {isUser ? (
          // 用户消息：强制打断长单词 (break-all 或 break-words)
          // min-w-0 是配合外层 grid 使用的，确保 flex/grid 子项能缩小
          <div className="whitespace-pre-wrap wrap-break-word min-w-0">
            {message.content}
          </div>
        ) : (
          // AI 消息：Markdown
          // 这里的 min-w-0 非常关键，它告诉浏览器 "这个容器可以无限小"，从而触发滚动条
          <div className="markdown-body min-w-0 w-full wrap-break-word">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-all"
                  />
                ),
                // 代码块处理
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    // 代码块容器
                    <div className="w-full my-2 overflow-hidden rounded-md">
                      {/* 这里的 overflow-x-auto 必须配合外层的限制才能生效 */}
                      <div className="overflow-x-auto w-full">
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          // 强制去除默认边距，防止撑开
                          customStyle={{
                            margin: 0,
                            padding: "1rem",
                            borderRadius: 0,
                          }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  ) : (
                    <code
                      className={cn(
                        "bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 font-mono text-xs break-all",
                        className
                      )}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                // 列表和段落
                ul: ({ children }) => (
                  <ul className="list-disc ml-4 my-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 my-1">{children}</ol>
                ),
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                // 表格支持 (防止表格撑爆布局)
                table: ({ children }) => (
                  <div className="overflow-x-auto w-full my-2">
                    <table className="w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border px-2 py-1 bg-muted/50 text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-2 py-1">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
