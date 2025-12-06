use migration::{Migrator, MigratorTrait};
use sea_orm::{Database, DatabaseConnection, DbErr};
use std::fs;
use tauri::{AppHandle, Manager, Runtime};
pub async fn establish_connection<R: Runtime>(
    app: &AppHandle<R>,
) -> Result<DatabaseConnection, DbErr> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("failed to get app data dir");

    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).expect("failed to create app data dir");
    }

    //拼接数据库路径
    let db_path = app_dir.join("chat.db");
    let db_url = format!("sqlite://{}?mode=rwc", db_path.to_string_lossy());

    println!("正在连接数据库: {}", db_url);

    let db = Database::connect(&db_url).await?;

    Migrator::up(&db, None).await?;

    Ok(db)
}
