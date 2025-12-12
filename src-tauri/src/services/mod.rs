use sea_orm::DatabaseConnection;

use crate::services::{
    ai::AiService, chat::ChatService, session::SessionService, settings::SettingsService,
};

pub mod ai;
pub mod chat;
pub mod session;
pub mod settings;

#[derive(Clone)] // 因为内部字段都实现了 Clone，所以它可以 Clone
pub struct AppServices {
    pub chat: ChatService,
    pub ai: AiService,
    pub settings: SettingsService,
    pub sessions: SessionService,
}

impl AppServices {
    // 2. 提供一个“一键初始化”方法
    pub fn new(db: &DatabaseConnection) -> Self {
        // 在这里处理依赖关系，lib.rs 就不需要关心谁依赖谁了
        let settings = SettingsService::new(db);
        let chat = ChatService::new(db);
        let sessions = SessionService::new(db);

        // 比如 AI 服务依赖 Chat 和 Settings，在这里组装
        let ai = AiService::new(chat.clone(), settings.clone());

        Self {
            chat,
            ai,
            settings,
            sessions,
        }
    }
}
