// 定义消息类型 (对应 Rust 的实体)
export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

//会话类型
export interface Conversation {
  id: number;
  title: string;
  created_at: string;
}
