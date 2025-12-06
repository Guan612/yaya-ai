use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    // 升级：建表
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Messages::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Messages::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Messages::Role).string().not_null()) // user 或 assistant
                    .col(ColumnDef::new(Messages::Content).text().not_null()) // 聊天内容
                    .col(
                        ColumnDef::new(Messages::CreatedAt)
                            .timestamp()
                            .default(Expr::current_timestamp()),
                    )
                    .to_owned(),
            )
            .await
    }

    // 降级：删表
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Messages::Table).to_owned())
            .await
    }
}

// 定义表名和列名的枚举，防止手写字符串出错
#[derive(DeriveIden)]
enum Messages {
    Table,
    Id,
    Role,
    Content,
    CreatedAt,
}
