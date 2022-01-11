use rust_decimal::Decimal;

use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Split {
    pub tx_id: String,
    pub user: String,
    pub share: Decimal,
}
