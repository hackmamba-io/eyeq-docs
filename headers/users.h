/**
 * @file users.h
 * @brief Defines user account operations.
 */

/**
 * @brief Fetches a user's profile by ID.
 * @param user_id The unique identifier of the user.
 * @param buffer Output buffer to store JSON response.
 * @param buffer_size Size of the output buffer.
 * @return 0 on success or negative error code.
 */
int get_user_profile(const char* user_id, char* buffer, int buffer_size);

/**
 * @brief Updates a user's name or email.
 * @param user_id The user's unique ID.
 * @param name New name (nullable).
 * @param email New email (nullable).
 * @return 0 on success, -1 on invalid input.
 */
int update_user_profile(const char* user_id, const char* name, const char* email);
