use crate::services::settings::SettingsService;
use crate::state::AppState;
use crate::{error::AppResult, services::chat::ChatService};
use futures::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager};

// --- 2. OpenAI 请求结构 ---
#[derive(Serialize)]
struct OpenAIMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    stream: bool,
    // temperature: f32, // 可选
}

// --- 3. OpenAI 响应结构 (流式 Delta) ---
#[derive(Deserialize, Debug)]
struct OpenAIStreamResponse {
    choices: Vec<StreamChoice>,
}

#[derive(Deserialize, Debug)]
struct StreamChoice {
    delta: StreamDelta,
    // finish_reason: Option<String>,
}

#[derive(Deserialize, Debug)]
struct StreamDelta {
    content: Option<String>, // 注意：内容可能是 None (例如结束包)
}

// --- 4. 发送给前端的事件负载 ---
#[derive(Clone, Serialize, Debug)]
struct StreamPayload {
    chunk: String,
    done: bool,
}

#[derive(Clone)]
pub struct AiService {
    chat_service: ChatService,         // 直接包含 ChatService
    settings_service: SettingsService, // 注入 SettingsService
}

impl AiService {
    pub fn new(chat_service: ChatService, settings_service: SettingsService) -> Self {
        Self {
            chat_service,
            settings_service,
        }
    }
    pub async fn chat_stream(
        self,
        app: AppHandle,
        session_id: i64,
        prompt: String,
    ) -> AppResult<()> {
        let client = Client::new();

        // 1. 动态读取配置
        let api_key = self.settings_service.get_setting("api_key", "").await;
        let base_url = self
            .settings_service
            .get_setting("base_url", "https://api.openai.com/v1/chat/completions")
            .await;
        let model = self
            .settings_service
            .get_setting("model", "gpt-3.5-turbo")
            .await;

        //配置api key
        if api_key.is_empty() {
            // 可以在这里 emit 一个错误事件告诉前端“请先配置 API Key”
            let res = app.emit("need-api-key", "需要apikey").unwrap();
            eprintln!("API Key is missing!");
            return Ok(res);
        }

        // 构造请求体
        let request_body = OpenAIRequest {
            model: model.to_string(),
            messages: vec![OpenAIMessage {
                role: "user".to_string(),
                content: prompt, // 这里简化了，实际应该把历史记录 history 传进来
            }],
            stream: true,
        };

        // 发起请求
        let mut stream = client
            .post(base_url)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await?
            .bytes_stream();

        let mut full_response = String::new();

        // 处理流式响应
        while let Some(item) = stream.next().await {
            match item {
                Ok(bytes) => {
                    let chunk_str = String::from_utf8_lossy(&bytes);

                    // OpenAI 的流可能会一次返回多行，也可能被截断，这里做简单的按行处理
                    for line in chunk_str.lines() {
                        let line = line.trim();

                        // 忽略空行和保活注释
                        if line.is_empty() || !line.starts_with("data: ") {
                            continue;
                        }

                        // 去掉 "data: " 前缀
                        let json_str = &line[6..];

                        // 检查结束标记
                        if json_str == "[DONE]" {
                            break;
                        }

                        // 解析 JSON
                        if let Ok(response) = serde_json::from_str::<OpenAIStreamResponse>(json_str)
                        {
                            if let Some(choice) = response.choices.first() {
                                if let Some(content) = &choice.delta.content {
                                    // 1. 推送给前端
                                    let payload = StreamPayload {
                                        chunk: content.clone(),
                                        done: false, // 流还没真正结束
                                    };
                                    app.emit("ai-response", &payload).unwrap();

                                    // 2. 累加
                                    full_response.push_str(content);
                                }
                            }
                        }
                    }
                }
                Err(e) => eprintln!("Stream error: {}", e),
            }
        }

        // --- 流结束处理 ---

        // 保存 AI 的完整回复到数据库
        self.chat_service
            .save_message(session_id, "AI", &full_response)
            .await?;

        // 通知前端结束
        app.emit(
            "ai-response",
            &StreamPayload {
                chunk: "".to_string(),
                done: true,
            },
        )
        .unwrap();

        app.emit("ai-response-complete", ()).unwrap();

        Ok(())
    }
}
