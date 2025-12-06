use sea_orm::{
    dynamic::Column, ActiveModelTrait, ActiveValue::Set, DatabaseConnection, DbErr, EntityTrait,
    QueryOrder,
};

use crate::entities::{messages, prelude::Messages};

use crate::error::AppResult;

pub struct ChatService;

impl ChatService {
    // 1. 获取聊天历史记录
    pub async fn get_history(db: &DatabaseConnection) -> AppResult<Vec<messages::Model>> {
        let messages = Messages::find()
            .order_by_asc(messages::Column::CreatedAt) // 按时间正序
            .all(db)
            .await?;
        Ok(messages)
    }

    // 2. 保存一条新消息 (无论是用户发的还是 AI 回的)
    pub async fn save_message(
        db: &DatabaseConnection,
        role: &str,
        content: &str,
    ) -> AppResult<messages::Model> {
        let new_msg = messages::ActiveModel {
            role: Set(role.to_string()),
            content: Set(content.to_string()),
            // created_at 会由数据库默认值自动生成，或者你也可以在这里 Set(Utc::now())
            ..Default::default()
        };

        let saved_msg = new_msg.insert(db).await?;
        Ok(saved_msg)
    }

    // 3. (预留) 清空历史
    pub async fn clear_history(db: &DatabaseConnection) -> AppResult<()> {
        Messages::delete_many().exec(db).await?;
        Ok(())
    }
}
