use rust_decimal::Decimal;

pub fn string_to_decimal(number_string: &str) -> rust_decimal::Decimal {
    let scale = get_scale(number_string) as u32;
    let number: i64 = str::replace(number_string, ".", "").parse().unwrap();

    return Decimal::new(number, scale);
}

fn get_scale(number_string: &str) -> usize {
    let maybe_period_index = number_string.find('.');

    match maybe_period_index {
        Some(period_index) => number_string.chars().count() - period_index - 1,
        None => 0,
    }
}
