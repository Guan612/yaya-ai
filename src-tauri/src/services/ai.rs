use futures::StreamExt;
use reqwest::Client;
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager};

use crate::{
    db,
    error::AppResult,
    services::chat::ChatService,
    state::{self, AppState},
};

// 定义 Ollama 的请求结构 (或是 OpenAI)
#[derive(Serialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
}

// 定义 Ollama 的响应结构 (片段)
#[derive(Deserialize)]
struct OllamaResponse {
    response: String,
    done: bool,
}

// 定义发送给前端的事件负载
#[derive(Clone, Serialize, Debug)]
struct StreamPayload {
    chunk: String,
    done: bool,
}

pub struct AiService;

impl AiService {
    pub async fn chat_stream(app: AppHandle, prompt: String) -> AppResult<()> {
        let client = Client::new();

        let request_body = OllamaRequest {
            model: "qwen2.5-coder:latest".to_string(), // ⚠️ 记得改成你本地有的模型名
            prompt,
            stream: true,
        };

        let mut stream = client
            .post("http://localhost:11434/api/generate")
            .json(&request_body)
            .send()
            .await?
            .bytes_stream();

        // 收集完整的回复用于存库
        let mut full_response = String::new();

        while let Some(item) = stream.next().await {
            match item {
                Ok(bytes) => {
                    if let Ok(text) = String::from_utf8(bytes.to_vec()) {
                        if let Ok(json) = serde_json::from_str::<OllamaResponse>(&text) {
                            let payload = StreamPayload {
                                chunk: json.response.clone(),
                                done: json.done,
                            };

                            app.emit("ai-response", &payload).unwrap();

                            full_response.push_str(&json.response);
                        }
                    }
                }
                Err(e) => eprintln!("Stream error: {}", e),
            }
        }

        // 流结束：保存完整的 AI 回复到数据库
        // 这里我们需要一个新的 Service 方法来保存 "assistant" 的消息
        // 为了简单，我们直接在这里调用 ChatService

        // 获取数据库连接 (从 app handle 拿 state 有点麻烦，这里简化处理)
        // 在实际架构中，建议把 db 传入或者通过 AppState 获取
        let state = app.state::<AppState>();
        ChatService::save_message(&state.db, "assistant", &full_response).await?;
        app.emit("ai-response-complete", ()).unwrap();
        Ok(())
    }
}
