// src/assets/js/utils.js

import { HttpAgent } from '@dfinity/agent';
import { canister_id as backend_canister_id } from '../../declarations/recipro_backend'; // Adjust path as needed

// IMPORTANT: Configure your GraphQL endpoint
// For local development, it's typically your DFX host with the canister ID.
// For production (mainnet), it will be https://<canister-id>.raw.ic0.app/graphql
const SUDOGRAPH_GRAPHQL_ENDPOINT = `http://127.0.0.1:8000/?canisterId=${backend_canister_id}&id=${backend_canister_id}`;

// Basic helper to send GraphQL requests to your Sudograph canister
async function sendGraphQLRequest(query, variables = {}) {
    try {
        const response = await fetch(SUDOGRAPH_GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GraphQL request failed: ${response.status} - ${errorText}`);
        }

        const jsonResponse = await response.json();

        if (jsonResponse.errors) {
            console.error("GraphQL Errors:", jsonResponse.errors);
            throw new Error("GraphQL errors occurred.");
        }

        return jsonResponse;
    } catch (error) {
        console.error("Error sending GraphQL request:", error);
        cuteAlert({
            type: "error",
            title: "Network Error",
            message: "Could not connect to the backend. Please try again.",
            buttonText: "Okay"
        });
        throw error;
    }
}

// Function to get the current logged-in user's ID
// This is a placeholder. In a real app, this would come from a secure auth system.
function getCurrentUserId() {
    return localStorage.getItem('currentUserId'); // Retrieve the ID stored after login
}

// Export the helper
export { sendGraphQLRequest, getCurrentUserId };