import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/types";
import { MessageSquare, MessageSquarePlus, Trash2 } from "lucide-react";
import { SettingsDialog } from "./settings-dialog";

interface SidebarContentProps {
  sessions: Conversation[]; // 会话列表
  currentSessionId: number | null; // 当前选中的 ID
  onSelectSession: (id: number) => void; // 选中事件
  onNewChat: () => void; // 新建事件
  onDeleteSession?: (id: number) => void; // 删除事件 (暂留接口)
}

export function SidebarContent({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
}: SidebarContentProps) {
  // 模拟一些历史数据

  return (
    <div className="flex h-full flex-col p-4 bg-muted/30">
      {/* 顶部：新建聊天按钮 */}
      <Button
        onClick={onNewChat}
        className="w-full justify-start gap-2 mb-4"
        variant="default"
      >
        <MessageSquarePlus className="h-4 w-4" />
        新建聊天
      </Button>

      {/* 中间：历史记录列表 (可滚动) */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 pr-4">
            {sessions.map((session) => (
              <Button
                key={session.id}
                variant={
                  currentSessionId === session.id ? "secondary" : "ghost"
                } // 选中高亮
                className={cn(
                  "w-full justify-start text-left truncate font-normal",
                  currentSessionId === session.id &&
                    "bg-accent text-accent-foreground"
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare className="h-4 w-4 mr-2 opacity-70" />
                <span className="truncate">{session.title}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 底部：设置或清空 */}
      <div className="mt-4 pt-4 border-t">
        <SettingsDialog />
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
        >
          <Trash2 className="h-4 w-4" />
          清空所有记录
        </Button>
      </div>
    </div>
  );
}
