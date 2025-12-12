import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState({
    api_key: "",
    base_url: "",
    model: "",
  });

  // 打开时加载配置
  useEffect(() => {
    if (open) {
      invoke<any>("get_settings").then(setConfig);
    }
  }, [open]);

  const handleSave = async () => {
    await invoke("save_settings", { config });
    setOpen(false);
    // 可选：加个 Toast 提示保存成功
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
        >
          <Settings className="h-4 w-4" />
          <div>会话配置</div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI 设置</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              value={config.api_key}
              onChange={(e) =>
                setConfig({ ...config, api_key: e.target.value })
              }
              type="password"
              placeholder="sk-..."
            />
          </div>
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input
              value={config.base_url}
              onChange={(e) =>
                setConfig({ ...config, base_url: e.target.value })
              }
              placeholder="https://api.openai.com/v1/chat/completions"
            />
          </div>
          <div className="space-y-2">
            <Label>Model Name</Label>
            <Input
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder="gpt-3.5-turbo"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>保存配置</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
