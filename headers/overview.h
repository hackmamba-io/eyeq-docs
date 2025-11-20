/**
 * @file overview.h
 * @brief General API overview and helper utilities.
 */

/**
 * @brief Prints the API version string.
 * @return A constant string representing the current API version.
 * @example
 * const char* version = get_api_version();
 * printf("API Version: %s\n", version);
 */
const char* get_api_version(void);

/**
 * @brief Initializes the API environment.
 * @return 0 on success, or a negative error code on failure.
 * @error -1 Initialization failed
 * @since 1.0.0
 */
int initialize_api(void);

/**
 * @brief Cleans up and shuts down the API.
 * @return 0 on success.
 */
int shutdown_api(void);
