/**
 * @file errors.h
 * @brief Error handling helpers and codes.
 */

/**
 * @brief Returns the last error code set by the API.
 * @return Negative error code; 0 if none.
 */
int api_last_error_code(void);

/**
 * @brief Returns a human-readable message for an error code.
 * @param code Error code (negative).
 * @return Constant string describing the error.
 */
const char* api_error_message(int code);

/**
 * @brief Clears the last error state.
 * @return 0 on success.
 */
int api_clear_error(void);

/**
 * @brief Converts HTTP status to canonical API error code.
 * @param http_status HTTP status (e.g., 404).
 * @return Negative API error code or 0 if none.
 */
int api_error_from_http(int http_status);

