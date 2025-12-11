use crate::{
    entities::{conversations, messages},
    error::AppResult,
    state::AppState,
};
use tauri::{AppHandle, State};

// Command 1: 发送消息 (目前只负责存用户的，AI 回复稍后用 Event 流式下发)
#[tauri::command]
pub async fn send_user_message(
    app: AppHandle,
    state: State<'_, AppState>,
    session_id: i64,
    content: String,
) -> AppResult<messages::Model> {
    // 调用 Service
    let saved_msg = state
        .chat_service
        .save_message(session_id, "user", &content)
        .await?;

    //AI 服务的调用
    let ai_service = state.ai_service.clone();
    let prompt = content.clone();

    tauri::async_runtime::spawn(async move {
        if let Err(e) = ai_service.chat_stream(app, session_id, prompt).await {
            eprintln!("AI 生成失败: {}", e);
        }
    });

    Ok(saved_msg)
}

// Command 2: 获取历史记录
#[tauri::command]
pub async fn get_chat_history(
    state: State<'_, AppState>,
    session_id: i32,
) -> AppResult<Vec<messages::Model>> {
    let history = state.chat_service.get_history(session_id).await?;
    Ok(history)
}

// Command 3: 清空历史
#[tauri::command]
pub async fn clear_chat(state: State<'_, AppState>) -> AppResult<()> {
    state.chat_service.clear_history().await?;
    Ok(())
}

//创建会话
#[tauri::command]
pub async fn create_new_chat(
    state: State<'_, AppState>,
    title: String,
) -> AppResult<conversations::Model> {
    let session = state.session_service.create_session(&title).await?;
    Ok(session)
}

//获取会话列表
#[tauri::command]
pub async fn get_sessions(state: State<'_, AppState>) -> AppResult<Vec<conversations::Model>> {
    let sessions = state.session_service.get_all_sessions().await?;
    Ok(sessions)
}
