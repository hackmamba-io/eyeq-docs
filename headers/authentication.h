/**
 * @file authentication.h
 * @brief Handles all authentication and token validation logic.
 */

/**
 * @brief Authenticates using an API key.
 * @param api_key The user's API key.
 * @return 0 on success or -1 if the key is invalid.
 * @example
 * int status = authenticate_with_key("sk_12345");
 * if (status == 0) printf("Authenticated!");
 */
int authenticate_with_key(const char* api_key);

/**
 * @brief Initiates the OAuth 2.0 authorization flow.
 * @param client_id The client ID issued to the application.
 * @param redirect_uri The redirect URI for authorization callback.
 * @return 0 on success, or -1 on failure.
 */
int start_oauth_flow(const char* client_id, const char* redirect_uri);

/**
 * @brief Exchanges an OAuth authorization code for an access token.
 * @param code The authorization code returned from OAuth callback.
 * @param token Buffer to store the received access token.
 * @param token_size Size of the token buffer.
 * @return 0 on success or negative on error.
 */
int exchange_oauth_code(const char* code, char* token, int token_size);
