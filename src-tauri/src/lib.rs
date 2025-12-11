// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod commands;
pub mod db;
pub mod entities;
pub mod error;
pub mod services;
pub mod state;

use tauri::Manager;

use crate::{
    services::{ai::AiService, chat::ChatService, session::SessionService},
    state::AppState,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::send_user_message,
            commands::get_chat_history,
            commands::clear_chat,
            commands::create_new_chat,
            commands::get_sessions
        ])
        .setup(|app| {
            // --- 数据库初始化开始 ---
            let handle = app.handle().clone();

            // 因为数据库连接是异步的，我们需要用 tauri::async_runtime
            tauri::async_runtime::block_on(async move {
                match db::establish_connection(&handle).await {
                    Ok(db) => {
                        println!("数据库连接成功！");
                        // 将数据库连接由 Tauri 管理 (Manage State)
                        // 1. 初始化 ChatService
                        let chat_service = ChatService::new(&db);

                        // 2. 初始化 AiService (注入 ChatService)
                        let ai_service = AiService::new(chat_service.clone());

                        let session_service = SessionService::new(&db);

                        // 3. 存入 State
                        handle.manage(AppState {
                            chat_service,
                            ai_service,
                            session_service,
                        });
                    }
                    Err(e) => {
                        eprintln!("数据库初始化失败: {}", e);
                        // 在生产环境中，这里应该发送一个前端事件通知用户
                        panic!("无法初始化数据库: {}", e);
                    }
                }
            });
            // --- 数据库初始化结束 ---

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
