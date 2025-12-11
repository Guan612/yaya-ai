use sea_orm::{ActiveModelTrait, ActiveValue::Set, DatabaseConnection, EntityTrait, QueryOrder};

use crate::{
    entities::{conversations, prelude::Conversations},
    error::AppResult,
};

#[derive(Clone)]
pub struct SessionService {
    db: DatabaseConnection,
}

impl SessionService {
    pub fn new(db: &DatabaseConnection) -> Self {
        Self { db: db.clone() }
    }

    // 1. 创建新会话
    pub async fn create_session(&self, title: &str) -> AppResult<conversations::Model> {
        let new_session = conversations::ActiveModel {
            title: Set(title.to_string()),
            ..Default::default()
        };
        let session = new_session.insert(&self.db).await?;
        Ok(session)
    }

    //获取所有会话列表
    pub async fn get_all_sessions(&self) -> AppResult<Vec<conversations::Model>> {
        let sessions = Conversations::find()
            .order_by_desc(conversations::Column::CreatedAt) // 最新创建的在上面
            .all(&self.db)
            .await?;

        Ok(sessions)
    }
}
