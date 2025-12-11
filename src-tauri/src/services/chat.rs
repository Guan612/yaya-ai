use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter,
    QueryOrder,
};

use crate::entities::{messages, prelude::Messages};

use crate::error::AppResult;

// 1. 变成一个持有 db 的结构体，并派生 Clone
#[derive(Clone)]
pub struct ChatService {
    db: DatabaseConnection,
}

impl ChatService {
    pub fn new(db: &DatabaseConnection) -> Self {
        Self { db: db.clone() }
    }
    // 1. 获取聊天历史记录
    pub async fn get_history(&self, session_id: i32) -> AppResult<Vec<messages::Model>> {
        let messages = Messages::find()
            .filter(messages::Column::ConversationId.eq(session_id))
            .order_by_asc(messages::Column::CreatedAt) // 按时间正序
            .all(&self.db)
            .await?;
        Ok(messages)
    }

    // 2. 保存一条新消息 (无论是用户发的还是 AI 回的)
    pub async fn save_message(
        &self,
        session_id: i64, // 新增参数
        role: &str,
        content: &str,
    ) -> AppResult<messages::Model> {
        let new_msg = messages::ActiveModel {
            role: Set(role.to_string()),
            conversation_id: Set(session_id),
            content: Set(content.to_string()),
            // created_at 会由数据库默认值自动生成，或者你也可以在这里 Set(Utc::now())
            ..Default::default()
        };

        let saved_msg = new_msg.insert(&self.db).await?;
        Ok(saved_msg)
    }

    // 3. 获取指定会话的消息 (不再是获取所有消息)
    pub async fn get_messages_by_session(&self, session_id: i32) -> AppResult<Vec<messages::Model>> {
        let messages = Messages::find()
            .filter(messages::Column::ConversationId.eq(session_id)) // 过滤条件
            .order_by_asc(messages::Column::CreatedAt)
            .all(&self.db)
            .await?;
        Ok(messages)
    }

    // 3. (预留) 清空历史
    pub async fn clear_history(&self) -> AppResult<()> {
        Messages::delete_many().exec(&self.db).await?;
        Ok(())
    }
}
