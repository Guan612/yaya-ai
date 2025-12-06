use crate::{
    entities::messages,
    error::AppResult,
    services::{ai::AiService, chat::ChatService},
    state::AppState,
};
use tauri::{AppHandle, State};

// Command 1: 发送消息 (目前只负责存用户的，AI 回复稍后用 Event 流式下发)
#[tauri::command]
pub async fn send_user_message(
    app: AppHandle,
    state: State<'_, AppState>,
    content: String,
) -> AppResult<messages::Model> {
    // 调用 Service
    let saved_msg = ChatService::save_message(&state.db, "user", &content).await?;

    //AI 服务的调用
    let prompt = content.clone();
    let app_handle = app.clone();

    tauri::async_runtime::spawn(async move {
        if let Err(e) = AiService::chat_stream(app_handle, prompt).await {
            eprintln!("AI 生成失败: {}", e);
        }
    });

    Ok(saved_msg)
}

// Command 2: 获取历史记录
#[tauri::command]
pub async fn get_chat_history(state: State<'_, AppState>) -> AppResult<Vec<messages::Model>> {
    let history = ChatService::get_history(&state.db).await?;
    Ok(history)
}

// Command 3: 清空历史
#[tauri::command]
pub async fn clear_chat(state: State<'_, AppState>) -> AppResult<()> {
    ChatService::clear_history(&state.db).await?;
    Ok(())
}
