use ic_cdk_macros::*;
// use sudograph::graphql_database;

// This macro generates all the necessary Rust code for your GraphQL database.
// It reads your schema.graphql file and creates the types, queries, and mutations.
// graphql_database!("src/my_backend_canister/schema.graphql");

// You can add other standard canister functions if needed,
// but Sudograph handles the core GraphQL API.

// Example: A simple canister info function (not part of Sudograph's auto-gen)

fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}