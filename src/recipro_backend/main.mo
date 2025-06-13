// src/recipro_backend/main.mo

import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Debug "mo:base/Debug"; // For logging in the console (dfx canister call ... --candid)

// Import AuthClient types for identity (though not directly used in post struct)
// Assuming identity is handled by AuthClient on frontend to get principal
// and passed to backend methods.

// Define the structure of a single post
type Post = {
    id: Nat; // Unique ID for the post
    author: Principal; // The Principal (user ID) of the author
    content: Text;     // The actual text of the post
    timestamp: Time.Time; // When the post was created (in nanoseconds)
    likes: Nat;       // Number of likes
    // You could add:
    // comments: [Comment]; // If comments are embedded
    // imageUrl: Opt Text;  // If posts can have images
};

// Define a type for a comment if you want a separate structure
type Comment = {
    id: Nat; // Unique ID for the comment
    post_id: Nat; // ID of the post this comment belongs to
    author: Principal;
    content: Text;
    timestamp: Time.Time;
};

// --- Stable Storage for Posts ---
// StableBTreeMap<Key, Value> allows persistent storage across upgrades.
// We'll use Nat (Natural Number) as the key (post ID) and Post as the value.
stable var posts = new T.StableBTreeMap<Nat, Post>(0); // 0 means initial capacity can be small

// --- Global counter for unique Post IDs ---
stable var nextPostId: Nat = 0;

// --- Backend Canister Public Interface ---
actor {

    // 1. Create a new post
    // This method will be called by the frontend when a user makes a new post.
    public func createPost(content: Text) : async Post {
        let caller = Principal.caller(); // Get the Principal of the user calling this method
        if (caller == Principal.anonymous()) { // Prevent anonymous calls if required
            Debug.print("Anonymous caller tried to create a post.");
            throw Error.reject("Anonymous users cannot create posts.");
        }

        let id = nextPostId;
        nextPostId += 1; // Increment for the next post

        let newPost = {
            id = id;
            author = caller;
            content = content;
            timestamp = Time.now(); // Current time on the IC
            likes = 0;
        };

        // Insert the new post into stable storage
        posts.put(id, newPost);
        Debug.print("New post created by " # Principal.toText(caller) # ": " # content);
        return newPost;
    };

    // 2. Get a specific number of posts (for a feed)
    // You'd typically want pagination here to avoid loading all posts at once.
    // 'limit': how many posts to fetch.
    // 'offset': how many posts to skip (for pagination).
    public func getPosts(limit: Nat, offset: Nat) : async [Post] {
        var result: [Post] = [];
        var count: Nat = 0;
        var skipped: Nat = 0;

        // Iterate through posts in reverse order (newest first)
        // StableBTreeMap doesn't have direct reverse iteration, so we'll fetch all and sort.
        // For a very large number of posts, consider a more efficient index.
        let allPosts = posts.values();

        // Sort posts by timestamp in descending order (newest first)
        // This is inefficient for many posts; a dedicated index would be better.
        allPosts.sort((a, b) => {
            if (a.timestamp > b.timestamp) { return -1; } // b comes after a
            if (a.timestamp < b.timestamp) { return 1; }  // a comes after b
            return 0;
        });

        for (post in allPosts.vals()) { // .vals() returns an iterator over values
            if (skipped < offset) {
                skipped += 1;
                continue;
            };
            if (count < limit) {
                result.add(post);
                count += 1;
            } else {
                break; // Limit reached
            };
        };
        Debug.print("Fetched " # Nat.toText(count) # " posts.");
        return result;
    };

    // 3. Get a single post by ID
    public func getPost(id: Nat) : async Opt Post {
        return posts.get(id); // Returns null if not found
    };

    // 4. Like a post
    public func likePost(post_id: Nat) : async Bool {
        let caller = Principal.caller();
        if (caller == Principal.anonymous()) {
            throw Error.reject("Anonymous users cannot like posts.");
        }

        let postOpt = posts.get(post_id);
        switch (postOpt) {
            case (null) { return false; }; // Post not found
            case (Post_found) {
                let updatedPost = {
                    id = Post_found.id;
                    author = Post_found.author;
                    content = Post_found.content;
                    timestamp = Post_found.timestamp;
                    likes = Post_found.likes + 1; // Increment likes
                };
                posts.put(post_id, updatedPost); // Overwrite with updated post
                Debug.print("Post " # Nat.toText(post_id) # " liked by " # Principal.toText(caller));
                return true;
            };
        };
    };

    // 5. Get total number of posts
    public func getTotalPosts() : async Nat {
        posts.size();
    };

    // --- Optional: Add comment functionality ---
    // This is a simple example. For complex comments, you might need another StableBTreeMap.
    // We'll store comments as part of the Post for simplicity here, but a real app
    // might have a separate comments table linked by post_id.
    // For this example, we won't embed comments directly in the Post struct
    // because updating nested stable structures is complex.
    // Instead, consider a separate `comments` StableBTreeMap.

    // Example of a `comments` map if you wanted to store comments separately
    // stable var comments = new T.StableBTreeMap<Nat, Comment>(0);
    // stable var nextCommentId: Nat = 0;

    // public func addComment(post_id: Nat, content: Text) : async Comment {
    //     let caller = Principal.caller();
    //     let commentId = nextCommentId;
    //     nextCommentId += 1;
    //     let newComment = {
    //         id = commentId;
    //         post_id = post_id;
    //         author = caller;
    //         content = content;
    //         timestamp = Time.now();
    //     };
    //     comments.put(commentId, newComment);
    //     return newComment;
    // };
    // public func getCommentsForPost(post_id: Nat) : async [Comment] {
    //     // Iterate and filter comments by post_id - inefficient for many comments
    //     var result: [Comment] = [];
    //     for (comment in comments.values().vals()) {
    //         if (comment.post_id == post_id) {
    //             result.add(comment);
    //         }
    //     };
    //     return result;
    // };
}