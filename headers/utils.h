
/**
 * @file utils.h
 * @brief Utility helpers (JSON + strings).
 */

/**
 * @brief Extracts a string field from a flat JSON object.
 * @param json JSON string.
 * @param key Field name to extract.
 * @param out Buffer for value.
 * @param out_size Size of buffer.
 * @return 0 on success; -1 missing; -2 buffer too small; -3 invalid JSON.
 */
int json_get_string(const char* json, const char* key, char* out, int out_size);

/**
 * @brief Extracts an integer field from a flat JSON object.
 * @param json JSON string.
 * @param key Field name.
 * @param out_int Pointer to receive value.
 * @return 0 on success; -1 missing; -3 invalid JSON.
 */
int json_get_int(const char* json, const char* key, int* out_int);

/**
 * @brief Simple URL-encodes a string to a buffer.
 * @param src Input string.
 * @param dst Output buffer.
 * @param dst_size Size of output buffer.
 * @return 0 on success; -1 buffer too small.
 */
int url_encode(const char* src, char* dst, int dst_size);

/**
 * @brief Joins base URL and path with a single slash.
 * @param base Base URL (no trailing slash preferred).
 * @param path Path portion (with or without leading slash).
 * @param out Buffer for result.
 * @param out_size Size of buffer.
 * @return 0 on success; -1 buffer too small.
 */
int url_join(const char* base, const char* path, char* out, int out_size);


