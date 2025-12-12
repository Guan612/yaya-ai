import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { Message } from "@/types/types";

// 接收 sessionId 参数
interface ChatAreaProps {
  sessionId: number | null;
}

interface StreamPayload {
  chunk: string;
  done: boolean;
}

export function ChatArea({ sessionId }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 监听 sessionId 变化，加载对应的历史记录
  useEffect(() => {
    if (sessionId === null) {
      setMessages([]); // 没有选中会话时，清空
      return;
    }

    async function loadHistory() {
      try {
        // 调用后端：get_chat_history (带 session_id 参数)
        // 注意：这里参数名要跟 Rust Command 定义的参数名一致 (snake_case)
        const history = await invoke<Message[]>("get_chat_history", {
          sessionId: sessionId,
        });
        setMessages(history);
      } catch (error) {
        console.error("加载历史失败:", error);
      }
    }

    // 切换会话时，先清空旧消息，避免闪烁
    setMessages([]);
    loadHistory();
  }, [sessionId]); // <--- 关键依赖

  // 2. 自动滚动 (保持不变)
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. 监听 AI 回复 (逻辑保持不变，因为是全局事件)
  // 如果你想做得更细，可以在 event payload 里带上 sessionId，前端判断是否匹配当前 ID
  useEffect(() => {
    const unlistenPromise = listen<StreamPayload>("ai-response", (event) => {
      const { chunk } = event.payload;
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, content: lastMsg.content + chunk },
          ];
        } else {
          return [
            ...prev,
            { id: Date.now(), role: "assistant", content: chunk },
          ];
        }
      });
    });
    return () => {
      unlistenPromise.then((f) => f());
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || sessionId === null) return; // 如果没有 ID，不能发送

    const userContent = input.trim();
    setInput("");
    setIsLoading(true);

    // 乐观更新
    const optimisticMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userContent,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // 调用后端：send_user_message (带 session_id)
      await invoke("send_user_message", {
        sessionId: sessionId,
        content: userContent,
      });
    } catch (error) {
      console.error("发送失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 如果没有选中 Session，显示欢迎页
  if (sessionId === null) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        请点击左侧“新建聊天”开始对话
      </div>
    );
  }

  return (
    // ... JSX 结构保持不变，直接 copy 之前的 return 部分 ...
    // 记得保留外层的 overflow-hidden 等样式
    <div className="flex flex-col h-full w-full mx-auto overflow-hidden">
      {/* ... Message List ... */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <ScrollArea className="h-full w-full px-4">
          <div className="flex flex-col gap-4 px-3 py-4 md:px-4 md:py-6 w-full">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-20">
                <p>暂无消息，开始一段新的对话吧！</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))
            )}
            <div ref={scrollRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      {/* ... Input Area ... */}
      <div className="shrink-0 p-4 border-t bg-background z-10">
        {/* Input 组件代码 ... */}
        <div className="relative flex items-end gap-2 bg-muted/30 p-2 rounded-xl border focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="min-h-[50px] max-h-[150px] w-full resize-none border-0 bg-transparent focus-visible:ring-0 shadow-none"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="mb-0.5 shrink-0 rounded-lg"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
        {/* Footer Text */}
      </div>
    </div>
  );
}
