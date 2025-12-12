use std::default;

use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, DatabaseConnection, EntityTrait, Iden,
    QueryFilter,
};

use crate::{
    entities::{prelude::Settings, settings},
    error::AppResult,
};

#[derive(Clone)]
pub struct SettingsService {
    db: DatabaseConnection,
}

impl SettingsService {
    pub fn new(db: &DatabaseConnection) -> Self {
        Self { db: db.clone() }
    }

    //获取默认配置(如果不存在则返回默认值)
    pub async fn get_setting(&self, key: &str, default_val: &str) -> String {
        let res = Settings::find()
            .filter(settings::Column::Key.eq(key))
            .one(&self.db)
            .await;

        match res {
            Ok(Some(model)) => model.value,
            _ => default_val.to_string(),
        }
    }

    //保存配置(存在则更新，不存在则插入)
    pub async fn save_setting(&self, key: &str, value: &str) -> AppResult<()> {
        let setting = Settings::find()
            .filter(settings::Column::Key.eq(key))
            .one(&self.db)
            .await?;
        match setting {
            Some(model) => {
                let mut active: settings::ActiveModel = model.into();
                active.value = Set(value.to_string());
                active.update(&self.db).await?;
            }
            None => {
                let new_setting = settings::ActiveModel {
                    key: Set(key.to_string()),
                    value: Set(value.to_string()),
                    ..Default::default()
                };
                new_setting.insert(&self.db).await?;
            }
        }

        Ok(())
    }
}
