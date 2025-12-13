#!/bin/bash
# Script to copy PFC SDK content from content/docs to content/pfc-sdk

cd /home/inistack/Dev/EyeQ/eyeq-docs

# Copy api-reference content
echo "Copying api-reference..."
mkdir -p content/pfc-sdk/api-reference/data-structures
mkdir -p content/pfc-sdk/api-reference/namespaces
mkdir -p content/pfc-sdk/api-reference/files

# Data structures
cp content/docs/api-reference/data-structures/*.mdx content/pfc-sdk/api-reference/data-structures/
cp content/docs/api-reference/data-structures/_meta.json content/pfc-sdk/api-reference/data-structures/

# Namespaces
cp content/docs/api-reference/namespaces/*.mdx content/pfc-sdk/api-reference/namespaces/
cp content/docs/api-reference/namespaces/_meta.json content/pfc-sdk/api-reference/namespaces/

# Files
cp content/docs/api-reference/files/*.mdx content/pfc-sdk/api-reference/files/
cp content/docs/api-reference/files/_meta.json content/pfc-sdk/api-reference/files/

# API reference root files
cp content/docs/api-reference/_meta.json content/pfc-sdk/api-reference/
cp content/docs/api-reference/index.mdx content/pfc-sdk/api-reference/
cp content/docs/api-reference/overview.mdx content/pfc-sdk/api-reference/
cp content/docs/api-reference/c-api.mdx content/pfc-sdk/api-reference/
cp content/docs/api-reference/csharp-api.mdx content/pfc-sdk/api-reference/

# Copy examples
echo "Copying examples..."
cp content/docs/examples/*.mdx content/pfc-sdk/examples/
cp content/docs/examples/_meta.json content/pfc-sdk/examples/

# Copy tools
echo "Copying tools..."
mkdir -p content/pfc-sdk/tools
cp content/docs/tools/*.mdx content/pfc-sdk/tools/
cp content/docs/tools/_meta.json content/pfc-sdk/tools/

# Copy legal
echo "Copying legal..."
mkdir -p content/pfc-sdk/legal
cp content/docs/legal/*.mdx content/pfc-sdk/legal/
cp content/docs/legal/_meta.json content/pfc-sdk/legal/

# Copy changelog
echo "Copying changelog..."
cp content/docs/changelog.mdx content/pfc-sdk/

echo "Done! Now update the links in the copied files to use /docs/pfc-sdk/ instead of /docs/"
