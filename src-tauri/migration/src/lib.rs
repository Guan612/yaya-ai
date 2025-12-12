pub use sea_orm_migration::prelude::*;

mod m20220101_000001_create_table;
mod m20251211_021108_create_settings_table;
mod m20251212_012605_create_models_table;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20220101_000001_create_table::Migration),
            Box::new(m20251211_021108_create_settings_table::Migration),
            Box::new(m20251212_012605_create_models_table::Migration),
        ]
    }
}
