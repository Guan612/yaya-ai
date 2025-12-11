use crate::services::{ai::AiService, chat::ChatService, session::SessionService};

pub struct AppState {
    pub chat_service: ChatService,
    pub ai_service: AiService,
    pub session_service: SessionService,
}
