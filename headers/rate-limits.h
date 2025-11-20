/**
 * @file rate-limit.h
 * @brief Provides rate limiting and quota management utilities.
 */

/**
 * @brief Retrieves the current rate limit for the authenticated user.
 * @param tier Output buffer to store the user's plan tier (e.g. "Free", "Pro").
 * @param tier_size Size of the output buffer.
 * @return The maximum number of allowed requests per hour.
 */
int get_rate_limit(char* tier, int tier_size);

/**
 * @brief Returns the number of remaining API calls before reset.
 * @return Number of remaining calls.
 */
int get_remaining_requests(void);

/**
 * @brief Calculates the time (in seconds) until the next rate limit reset.
 * @return Seconds until reset.
 */
int get_rate_limit_reset_time(void);
