// src/frontend/src/content.js
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as backendIdl, canisterId as backendCanisterId } from "../../declarations/recipro_backend"; // Adjust path if needed

// --- Global State & DOM Elements ---
let authClient;
let backendActor; // Actor to interact with your backend canister
let loggedInPrincipal = null;

const logoutButton = document.getElementById('logoutButton');
const loggedInPrincipalSpan = document.getElementById('loggedInPrincipal');
const postContentInput = document.getElementById('postContent');
const submitPostButton = document.getElementById('submitPostButton');
const postsContainer = document.getElementById('postsContainer');
const loadingMessage = document.getElementById('loadingMessage');

// --- Helper Functions ---

// Function to initialize AuthClient and Actor
async function initializeAuth() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();
        loggedInPrincipal = identity.getPrincipal().toString();
        loggedInPrincipalSpan.textContent = `Logged in as: ${loggedInPrincipal.substring(0, 8)}...`;

        // Create an actor to interact with the backend canister
        // The HttpAgent uses the authenticated identity
        const agent = new HttpAgent({ identity });
        // In local development, you might need to fetch root key for local replica.
        if (process.env.DFX_NETWORK === "local") {
            await agent.fetchRootKey();
        }

        backendActor = Actor.createActor(backendIdl, {
            agent,
            canisterId: backendCanisterId,
        });
        console.log("Backend actor initialized with authenticated identity.");
    } else {
        console.error("Not authenticated. Redirecting to login.");
        window.location.href = "/"; // Redirect to index.html if not authenticated
    }
}

// Function to render a single post card
function renderPost(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card'; // Use your CSS class for styling

    const authorDiv = document.createElement('div');
    authorDiv.className = 'post-author';
    authorDiv.textContent = `Author: ${post.author.toText().substring(0, 8)}...`;

    const contentDiv = document.createElement('p');
    contentDiv.className = 'post-content';
    contentDiv.textContent = post.content;

    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'post-meta';
    const date = new Date(Number(post.timestamp) / 1_000_000); // Motoko Time is nanoseconds
    timestampDiv.textContent = `Posted on: ${date.toLocaleString()}`;

    const likesDiv = document.createElement('div');
    likesDiv.className = 'post-meta mt-2';
    likesDiv.innerHTML = `Likes: <span id="likes-${post.id}">${Number(post.likes)}</span>`;

    const likeButton = document.createElement('button');
    likeButton.className = 'like-button';
    likeButton.textContent = 'Like';
    likeButton.dataset.postId = Number(post.id); // Store post ID for event listener

    likeButton.addEventListener('click', async (event) => {
        const pId = Number(event.target.dataset.postId);
        try {
            // Call the likePost method on your backend canister
            const success = await backendActor.likePost(pId);
            if (success) {
                console.log(`Liked post ${pId}`);
                // Optimistically update UI or re-fetch posts
                const currentLikesSpan = document.getElementById(`likes-${pId}`);
                if (currentLikesSpan) {
                    currentLikesSpan.textContent = Number(currentLikesSpan.textContent) + 1;
                }
                event.target.classList.add('liked'); // Add a class to indicate liked
                event.target.disabled = true; // Prevent multiple likes
            } else {
                alert('Could not like post.');
            }
        } catch (error) {
            console.error('Error liking post:', error);
            alert('Failed to like post: ' + error.message);
        }
    });

    postCard.appendChild(authorDiv);
    postCard.appendChild(contentDiv);
    postCard.appendChild(timestampDiv);
    postCard.appendChild(likesDiv);
    postCard.appendChild(likeButton);
    postsContainer.appendChild(postCard);
}

// Function to fetch and display all posts
async function fetchAndRenderPosts() {
    loadingMessage.textContent = 'Loading posts...';
    try {
        // Fetch posts from your backend canister
        // Using limit/offset for pagination (e.g., fetch 10 posts, starting from 0)
        const posts = await backendActor.getPosts(10, 0); // Fetch first 10 posts
        
        postsContainer.innerHTML = '<h2 class="text-xl font-semibold mb-4">Recent Posts</h2>'; // Clear previous posts
        
        if (posts.length === 0) {
            postsContainer.innerHTML += '<p class="text-gray-500 text-center">No posts yet. Be the first to post!</p>';
        } else {
            posts.forEach(post => renderPost(post));
        }
        loadingMessage.textContent = ''; // Clear loading message
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        loadingMessage.textContent = 'Failed to load posts. Please try again.';
        alert("Error fetching posts: " + error.message);
    }
}

// --- Event Listeners ---

// Handle new post submission
submitPostButton.addEventListener('click', async () => {
    const content = postContentInput.value.trim();
    if (!content) {
        alert("Post content cannot be empty.");
        return;
    }

    submitPostButton.disabled = true; // Disable button to prevent double-click
    submitPostButton.textContent = 'Posting...';

    try {
        const newPost = await backendActor.createPost(content);
        console.log("Post created:", newPost);
        postContentInput.value = ''; // Clear the input field
        await fetchAndRenderPosts(); // Re-fetch and display posts
    } catch (error) {
        console.error("Error creating post:", error);
        alert("Failed to create post: " + error.message);
    } finally {
        submitPostButton.disabled = false;
        submitPostButton.textContent = 'Post';
    }
});

// Handle logout
logoutButton.addEventListener('click', async () => {
    try {
        await authClient.logout();
        console.log("Logged out successfully.");
        window.location.href = "/"; // Redirect to homepage
    } catch (error) {
        console.error("Error during logout:", error);
        alert("Logout failed. Please try again.");
    }
});

// --- Initialization on DOM Load ---
document.addEventListener('DOMContentLoaded', async () => {
    await initializeAuth();
    if (backendActor) { // Only fetch posts if actor is successfully initialized (i.e., authenticated)
        await fetchAndRenderPosts();
    }
});