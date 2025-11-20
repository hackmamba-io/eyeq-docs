
/**
 * @file network.h
 * @brief HTTP transport (simple request helpers).
 */

/**
 * @brief Sets default request timeout (milliseconds).
 * @param timeout_ms Timeout value in ms.
 * @return 0 on success; -1 invalid value.
 */
int net_set_timeout(int timeout_ms);

/**
 * @brief Sets retry attempts for idempotent requests.
 * @param retries Number of retries (>=0).
 * @return 0 on success; -1 invalid value.
 */
int net_set_retries(int retries);

/**
 * @brief Performs a GET request and returns raw JSON.
 * @param path Path portion (e.g., "/users").
 * @param query Optional query string (nullable).
 * @param json_out Buffer to receive body.
 * @param json_out_size Size of buffer.
 * @return 0 on success; negative on network or HTTP error.
 */
int net_get(const char* path, const char* query, char* json_out, int json_out_size);

/**
 * @brief Performs a POST request with JSON body.
 * @param path Path portion.
 * @param json_body JSON string to send.
 * @param json_out Buffer to receive response body.
 * @param json_out_size Size of buffer.
 * @return 0 on success; negative on error.
 */
int net_post(const char* path, const char* json_body, char* json_out, int json_out_size);

/**
 * @brief Performs a PUT request with JSON body.
 * @param path Path portion.
 * @param json_body JSON string to send.
 * @param json_out Buffer to receive response body.
 * @param json_out_size Size of buffer.
 * @return 0 on success; negative on error.
 */
int net_put(const char* path, const char* json_body, char* json_out, int json_out_size);

/**
 * @brief Performs a DELETE request.
 * @param path Path portion.
 * @return 0 on success; negative on error.
 */
int net_delete(const char* path);


