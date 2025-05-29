// recipro/src/recipro_backend/src/lib.rs

use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::storage;
use ic_cdk_macros::{query, update};
use std::collections::BTreeMap;
use std::ops::Deref; // <--- ADD THIS LINE to use .deref()

// Define the Post struct.
#[derive(CandidType, Deserialize, Clone, Debug, serde::Serialize)]
pub struct Post {
    pub id: u64,
    pub author: Principal,
    pub content: String,
    pub timestamp: u64, // Time in nanoseconds since the UNIX epoch
}

// Define a struct to hold the canister's state.
#[derive(CandidType, Deserialize, serde::Serialize, Default, Clone)] // <--- ADD CLONE HERE
struct CanisterState {
    posts: BTreeMap<u64, Post>,
    next_post_id: u64,
}

// Use `thread_local!` to create a static mutable variable for the canister state.
thread_local! {
    static STATE: std::cell::RefCell<CanisterState> = std::cell::RefCell::new(CanisterState::default());
}

// --- Public Functions (Candid Interface) ---

/// Creates a new post.
#[update]
fn create_post(content: String) -> Post {
    STATE.with(|s| {
        let mut state = s.borrow_mut();

        let new_post_id = state.next_post_id;
        state.next_post_id += 1;

        let post = Post {
            id: new_post_id,
            author: ic_cdk::api::caller(),
            content,
            timestamp: time(),
        };

        state.posts.insert(new_post_id, post.clone());
        ic_cdk::println!("New post created by {}: {}", post.author, post.content);
        post
    })
}

/// Retrieves a specific post by its ID.
#[query]
fn get_post(id: u64) -> Option<Post> {
    STATE.with(|s| {
        let state = s.borrow();
        state.posts.get(&id).cloned()
    })
}

/// Retrieves all posts.
#[query]
fn get_all_posts() -> Vec<Post> {
    STATE.with(|s| {
        let state = s.borrow();
        state.posts.values().cloned().collect()
    })
}

// --- Canister Lifecycle Hooks ---

/// This function is called when the canister is initialized or re-initialized.
#[ic_cdk_macros::init]
fn init() {
    ic_cdk::println!("Canister initialized!");
}

/// This function is called before a canister upgrade.
/// It serializes the current state and saves it to stable memory.
#[ic_cdk_macros::pre_upgrade]
fn pre_upgrade() {
    STATE.with(|s| {
        let state = s.borrow();
        // Corrected clone: Dereference the Ref to get the inner CanisterState, then clone it.
        storage::stable_save((state.deref().clone(),)).expect("failed to save stable state"); // <--- FIX IS HERE
        ic_cdk::println!("State saved to stable memory before upgrade.");
    });
}

/// This function is called after a canister upgrade.
/// It loads the state from stable memory.
#[ic_cdk_macros::post_upgrade]
fn post_upgrade() {
    STATE.with(|s| {
        let mut state = s.borrow_mut();
        let (restored_state,): (CanisterState,) =
            storage::stable_restore().expect("failed to restore stable state");
        *state = restored_state;
        ic_cdk::println!("State restored from stable memory after upgrade.");
    });
}

candid::export_service!();
#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    __export_service()
}
