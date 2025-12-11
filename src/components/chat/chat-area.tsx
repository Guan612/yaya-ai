import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core"; // Tauri 2.0 的 API 路径
import { listen } from "@tauri-apps/api/event"; // 引入监听器
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble, Message } from "./message-bubble";

// 定义事件 Payload 类型
interface StreamPayload {
  chunk: string;
  done: boolean;
}

export function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 用于自动滚动到底部
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 初始化：加载历史记录
  useEffect(() => {
    async function loadHistory() {
      try {
        // 调用 Rust command: get_chat_history
        const history = await invoke<Message[]>("get_chat_history");
        setMessages(history);
      } catch (error) {
        console.error("加载历史失败:", error);
      }
    }
    loadHistory();
  }, []);

  // --- 新增：专门用于监听 AI 消息的 useEffect ---
  useEffect(() => {
    // 监听 "ai-response" 事件 (流式传输)
    const unlistenPromise = listen<StreamPayload>("ai-response", (event) => {
      const { chunk, done } = event.payload;

      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];

        // 如果最后一条消息已经是 AI 的，就追加内容
        if (lastMsg && lastMsg.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, content: lastMsg.content + chunk },
          ];
        }
        // 否则（这是 AI 的第一个字），新建一条 AI 消息
        else {
          return [
            ...prev,
            {
              id: Date.now(), // 临时 ID
              role: "assistant",
              content: chunk,
            },
          ];
        }
      });
    });

    // 监听 "ai-response-complete" (可选：用于刷新真实 ID 等)
    // ...

    // 清理监听器
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  // 2. 监听消息变化，自动滚动
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 3. 发送消息逻辑
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    setInput(""); // 清空输入框
    setIsLoading(true); // 进入加载状态

    try {
      // 乐观更新 UI (Optimistic UI): 先把用户的消息显示出来，不需要等数据库返回
      // 这里的 id 只是临时占位，刷新后会用数据库真实的 id
      const optimisticMsg: Message = {
        id: Date.now(),
        role: "user",
        content: userContent,
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      // 调用 Rust 保存消息
      // 注意：这里我们还没做 AI 回复，所以只会保存用户消息
      await invoke("send_user_message", { content: userContent });

      // TODO: 下一步我们会在这里监听 AI 的流式回复
    } catch (error) {
      console.error("发送失败:", error);
      // 实际项目中这里应该弹出 Toast 提示
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 处理按 Enter 发送 (Shift+Enter 换行)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    // 1. 外层容器：h-full 撑满高度，overflow-hidden 禁止外层滚动
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto overflow-hidden">
      {/* 2. 消息列表区：flex-1 自动占据所有剩余空间 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="h-full w-full px-4">
          <div className="space-y-6 py-6">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-20">
                <p>暂无消息，开始一段新的对话吧！</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))
            )}
            {/* 锚点：用于自动滚动到底部 */}
            <div ref={scrollRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      {/* 3. 输入框区：shrink-0 防止被压缩，z-10 确保层级 */}
      <div className="shrink-0 p-4 border-t bg-background z-10">
        <div className="relative flex items-end gap-2 bg-muted/30 p-2 rounded-xl border focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="min-h-[50px] max-h-[150px] w-full resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
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
        <div className="text-[10px] text-muted-foreground text-center mt-2">
          由 Tauri + Rust + React 驱动
        </div>
      </div>
    </div>
  );
}
