import { useState } from "react";
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
// 假设你稍后会把 ChatBox 放在这，现在先用 div 占位
// import { ChatArea } from "./chat-area";

export default function ChatLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* --- 桌面端侧边栏 (Desktop Sidebar) --- */}
      {/* 关键 CSS: hidden (移动端隐藏) md:flex (桌面端显示) */}
      <aside className="hidden w-64 flex-col border-r bg-muted/10 md:flex">
        <SidebarContent />
      </aside>

      {/* --- 移动端侧边栏 (Mobile Drawer) --- */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          {/*为了无障碍访问，Sheet必须包含Title，如果不需要显示可以加上 hidden */}
          <SheetTitle className="hidden">导航菜单</SheetTitle>
          {/* 复用同一个 SidebarContent 组件 */}
          <SidebarContent onNewChat={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* --- 主聊天区域 (Main Chat Area) --- */}
      <main className="flex flex-1 flex-col min-h-0 h-[100dvh] overflow-hidden">
        {/* 顶部导航栏 (仅移动端显示菜单按钮) */}
        <header className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
          </Sheet>
          <span className="font-semibold">Yaya AI</span>
        </header>

        {/* 真正的聊天对话框区域 */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <div className="h-full w-full">
            <ChatArea />
          </div>
        </div>
      </main>
    </div>
  );
}
