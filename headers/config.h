
/**
 * @file config.h
 * @brief Runtime configuration management.
 */

/**
 * @brief Sets the API base URL.
 * @param url Null-terminated base URL.
 * @return 0 on success; -1 invalid URL.
 */
int cfg_set_base_url(const char* url);

/**
 * @brief Gets the current API base URL.
 * @param out Buffer for URL string.
 * @param out_size Size of buffer.
 * @return 0 on success; -1 buffer too small.
 */
int cfg_get_base_url(char* out, int out_size);

/**
 * @brief Sets a numeric config option by key.
 * @param key Option name (e.g., "timeout_ms").
 * @param value Integer value.
 * @return 0 on success; -1 unknown key.
 */
int cfg_set_int(const char* key, int value);

/**
 * @brief Gets a numeric config option by key.
 * @param key Option name.
 * @param out_value Pointer to receive value.
 * @return 0 on success; -1 unknown key.
 */
int cfg_get_int(const char* key, int* out_value);

/**
 * @brief Resets all runtime config to defaults.
 * @return 0 on success.
 */
int cfg_reset_defaults(void);

