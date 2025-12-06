import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

// 定义消息类型 (对应 Rust 的实体)
export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 p-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* 头像 */}
      <Avatar className="h-8 w-8">
        {/* 如果你有图片资源，可以用 AvatarImage */}
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* 气泡本体 */}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground" // 用户：深色背景白字
            : "bg-muted text-foreground"           // AI：灰色背景黑字
        )}
      >
        {/* 这里未来可以用 Markdown 渲染器包裹 content */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
}