import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, Trash2 } from "lucide-react";

// 这里我们先定义 props，未来可以传入历史记录列表
interface SidebarContentProps {
  onNewChat?: () => void;
}

export function SidebarContent({ onNewChat }: SidebarContentProps) {
  // 模拟一些历史数据
  const history = [
    "如何用 Rust 写后端？",
    "Tauri vs Electron",
    "今天的晚餐食谱",
    "解释一下量子纠缠",
  ];

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
          <div className="space-y-2 pr-4">
            {history.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left truncate font-normal"
              >
                {item}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 底部：设置或清空 */}
      <div className="mt-4 pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          清空所有记录
        </Button>
      </div>
    </div>
  );
}
