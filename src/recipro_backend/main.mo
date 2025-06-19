import Principal "mo:base/Principal";
import Result "mo:base/Result";
// import Map "mo:base/Map"; // Removed because mo:base/Map does not exist
import Array "mo:base/Array"; 

actor {
  // Define record types to structure your data, similar to JSON objects
  public type User = {
    id: Principal; // ICP's unique identifier for users/canisters
    username: Text;
    email: Text;
    avatar: Text; // URL to an external image store (IPFS/Arweave/S3)
    bg: Text;     // URL to an external image store
    postLiked: [Text]; // Array of Post IDs (Text representation of Nat for simplicity here)
    cmtLiked: [Text];  // Array of Comment IDs (Text representation of Nat)
    // You might add more fields as needed, e.g., 'bio', 'followers', 'following'
  };

  public type Post = {
    id: Nat; // Unique ID for each post (Natural number, auto-incremented by canister)
    authorId: Principal; // Reference to the User's Principal ID
    timestamp: Nat; // Time in nanoseconds (e.g., from ic.time())
    bg: Text;     // URL to an external image store for post background
    content: Text;
    likes: Nat; // Count of likes
    commentsCount: Nat; // Denormalized count of comments for quick display
    shares: Nat;
    deleted: Bool; // Flag for soft deletion
  };

  public type Comment = {
    id: Nat; // Unique ID for each comment
    authorId: Principal; // Reference to the User's Principal ID
    postId: Nat; // Reference to the Post's ID this comment belongs to
    content: Text;
    likes: Nat; // Count of likes on comment
    isSubComment: Bool; // If it's a reply to another comment
    parentCommentId: ?Nat; // Optional reference to the parent comment's ID
    deleted: Bool; // Flag for soft deletion
  };

  // Declare stable variables to store your data collections.
  // 'stable' ensures the data persists across canister upgrades.
  // Using 'Map<KeyType, ValueType>' is highly recommended for collections
  // that need efficient access by ID.

  stable var users: [User] = [];
  stable var posts: [Post] = [];
  stable var comments: [Comment] = [];

  // Variables to track the next available ID for posts and comments
  stable var nextPostId: Nat = 0;
  stable var nextCommentId: Nat = 0;


}