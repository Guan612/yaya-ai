import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { SidebarContent } from "./sidebar-content";
import { ChatArea } from "./chat-area";
import { Conversation } from "@/types/types";
import { SettingsDialog } from "./settings-dialog";

export default function ChatLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // --- 状态提升 ---
  const [sessions, setSessions] = useState<Conversation[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  // 1. 初始化：获取会话列表
  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const data = await invoke<Conversation[]>("get_sessions");
      setSessions(data);
      // 如果有会话且当前没选中，默认选中第一个
      if (data.length > 0 && currentSessionId === null) {
        setCurrentSessionId(data[0].id);
      }
    } catch (e) {
      console.error("获取会话失败", e);
    }
  }

  // 2. 新建会话逻辑
  async function handleNewChat() {
    try {
      // 简单起见，标题先用时间或者固定文本，未来可以让 AI 自动总结标题
      const newSession = await invoke<Conversation>("create_new_chat", {
        title: `新对话 ${new Date().toLocaleTimeString()}`,
      });

      // 更新列表并自动选中新建的
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newSession.id);

      // 移动端体验：新建后自动关闭抽屉
      setIsMobileOpen(false);
    } catch (e) {
      console.error("新建会话失败", e);
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* 桌面端侧边栏 */}
      <aside className="hidden w-64 flex-col border-r bg-muted/10 md:flex">
        <SidebarContent
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          onNewChat={handleNewChat}
        />
      </aside>

      {/* 移动端侧边栏 */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SheetTitle className="hidden">菜单</SheetTitle>
          <SidebarContent
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={(id) => {
              setCurrentSessionId(id);
              setIsMobileOpen(false); // 选中后关闭抽屉
            }}
            onNewChat={handleNewChat}
          />
        </SheetContent>
      </Sheet>

      {/* 主区域 */}
      <main className="flex flex-1 flex-col min-h-0 h-[100dvh] overflow-hidden">
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <span className="font-semibold">Yaya AI</span>
        </header>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <div className="h-full w-full">
            {/* 传入 currentSessionId */}
            <ChatArea sessionId={currentSessionId} />
          </div>
        </div>
      </main>
    </div>
  );
}
