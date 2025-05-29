// recipro/src/recipro_frontend/app.js

// IMPORTANT: The import path for your backend canister.
// After `dfx deploy`, dfx generates JavaScript "declarations" for your backend
// in a directory like `.dfx/local/canisters/<backend_canister_name>/`.
// For local development, the path from `recipro/src/recipro_frontend/app.js`
// to the generated `recipro_backend.js` (or `index.js` in newer dfx versions)
// will typically be `../../declarations/recipro_backend`.
// This assumes your backend canister is named `recipro_backend` in dfx.json.
import { recipro_backend } from '../../declarations/recipro_backend';
import { Principal } from '@dfinity/principal'; // Import Principal for handling user IDs

// Get references to the HTML elements where we'll display and create posts
const postsContainer = document.getElementById('posts-container');
const postForm = document.getElementById('post-form');
const postContentInput = document.getElementById('post-content');

/**
 * Fetches all posts from the backend canister and displays them on the page.
 */
async function fetchAndDisplayPosts() {
    // Show a loading message while posts are being fetched
    postsContainer.innerHTML = '<p style="text-align: center; color: #aaa;">Loading posts...</p>';

    try {
        // Call the `getAllPosts` query function on your Motoko backend canister
        const posts = await recipro_backend.getAllPosts();
        console.log("Fetched posts:", posts);

        // If no posts are returned, display a message
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p style="text-align: center; color: #aaa;">No posts yet. Be the first to post!</p>';
            return;
        }

        // Clear the loading message to make way for the posts
        postsContainer.innerHTML = '';

        // Sort posts by timestamp in descending order (newest first)
        // `timestamp` from Motoko is a `nat64`, which JavaScript treats as a BigInt.
        // We convert it to a Number for sorting, assuming it fits within JS's safe integer limits.
        posts.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

        // Iterate over each post and create its HTML representation
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-card'; // Assign a class for styling (e.g., in posts.css)

            // Convert the nanosecond timestamp (from Motoko) to milliseconds for JavaScript Date object
            const date = new Date(Number(post.timestamp) / 1_000_000);
            const formattedDate = date.toLocaleString(); // Format the date and time for display

            // Construct the inner HTML for a single post card
            // Includes inline styles for basic appearance, which you can move to CSS
            postElement.innerHTML = `
                <p class="post-content" style="color: #eee;">${post.content}</p>
                <p class="post-meta" style="font-size: 0.8em; color: #bbb; text-align: right;">
                    Posted by:
                    <span class="post-author" style="font-weight: bold; color: #007bff;">${Principal.fromUint8Array(post.author._arr).toText()}</span>
                    on <span class="post-date">${formattedDate}</span>
                </p>
            `;
            // Append the newly created post element to the posts container
            postsContainer.appendChild(postElement);
        });

    } catch (error) {
        // Log and display an error message if fetching posts fails
        console.error("Error fetching posts:", error);
        postsContainer.innerHTML = '<p style="color: red; text-align: center;">Error loading posts. Please try again.</p>';
    }
}

/**
 * Handles the submission of the new post form.
 * Calls the backend to create a post and then refreshes the display.
 */
postForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior (page reload)

    const content = postContentInput.value.trim(); // Get the content from the textarea, trim whitespace
    if (!content) {
        // Simple client-side validation: don't allow empty posts
        alert("Post content cannot be empty.");
        return;
    }

    try {
        // Disable the form elements to prevent multiple submissions and give feedback
        postContentInput.disabled = true;
        postForm.querySelector('button').disabled = true;
        postForm.querySelector('button').textContent = 'Posting...'; // Change button text

        // Call the `createPost` update function on your Motoko backend canister
        const newPost = await recipro_backend.createPost(content);
        console.log("New post created:", newPost);

        postContentInput.value = ''; // Clear the input field after successful post
        alert("Post created successfully!"); // Provide user feedback
        await fetchAndDisplayPosts(); // Refresh the list of posts to show the new one

    } catch (error) {
        // Log and alert if there's an error during post creation
        console.error("Error creating post:", error);
        alert("Failed to create post. See console for details.");
    } finally {
        // Re-enable the form elements regardless of success or failure
        postContentInput.disabled = false;
        postForm.querySelector('button').disabled = false;
        postForm.querySelector('button').textContent = 'Post'; // Restore button text
    }
});

// Add an event listener to fetch and display posts once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);

