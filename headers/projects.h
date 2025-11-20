/**
 * @file projects.h
 * @brief Manages user projects and workspace listings.
 */

/**
 * @brief Lists available projects for the authenticated user.
 * @param limit Maximum number of results to return.
 * @param offset Offset for pagination.
 * @param buffer Output buffer to store JSON response.
 * @param buffer_size Size of the buffer.
 * @return 0 on success, negative on error.
 */
int list_projects(int limit, int offset, char* buffer, int buffer_size);

/**
 * @brief Creates a new project.
 * @param name Name of the new project.
 * @param description Optional project description.
 * @param buffer Output buffer to store JSON response.
 * @param buffer_size Size of the buffer.
 * @return 0 on success, -1 if creation fails.
 */
int create_project(const char* name, const char* description, char* buffer, int buffer_size);
