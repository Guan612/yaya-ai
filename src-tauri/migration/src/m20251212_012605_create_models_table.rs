use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    // Replace the sample below with your own migration scripts
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // 1. 创建 models 表
        manager
            .create_table(
                Table::create()
                    .table(Models::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Models::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Models::Name).string().not_null()) // 显示名称 (如 "GPT-4o")
                    .col(ColumnDef::new(Models::ModelId).string().not_null()) // API传输用的ID (如 "gpt-4o-2024-05-13")
                    .col(ColumnDef::new(Models::BaseUrl).string().not_null()) // 接口地址
                    .col(ColumnDef::new(Models::ApiKey).string()) // API Key (允许为空，比如本地Ollama)
                    .col(ColumnDef::new(Models::Icon).string().default("box")) // 图标
                    .col(ColumnDef::new(Models::Description).string()) // 备注
                    .to_owned(),
            )
            .await?;

        // 2. 修改 conversations 表，添加 model_id
        // (为了演示方便，这里我们假设你是开发环境，用 add_column；生产环境 SQLite 限制较多)
        manager
            .alter_table(
                Table::alter()
                    .table(Conversations::Table)
                    .add_column(
                        ColumnDef::new(Conversations::ModelId).integer().default(1), // 默认指向 ID 1
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Models::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Models {
    Table,
    Id,
    Name,
    ModelId,
    BaseUrl,
    ApiKey,
    Icon,
    Description,
}

#[derive(DeriveIden)]
enum Conversations {
    Table,
    ModelId,
}
