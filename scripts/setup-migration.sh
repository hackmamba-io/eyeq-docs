#!/bin/bash
# Migration Setup Script for Doxygen to Fumadocs
# Run this from the eyeq-docs directory

set -e

echo "🚀 Setting up Fumadocs structure for PFC SDK Documentation..."

# Base paths
FUMADOCS_ROOT="$(pwd)"
CONTENT_DIR="$FUMADOCS_ROOT/content/docs"
DOXYGEN_ROOT="../PFC-SDK-docs/Docs"

# Create directory structure
echo "📁 Creating directory structure..."

mkdir -p "$CONTENT_DIR/getting-started"
mkdir -p "$CONTENT_DIR/guides"
mkdir -p "$CONTENT_DIR/examples"
mkdir -p "$CONTENT_DIR/api-reference/c-api"
mkdir -p "$CONTENT_DIR/api-reference/csharp-api"
mkdir -p "$CONTENT_DIR/tools"
mkdir -p "$CONTENT_DIR/legal"
mkdir -p "$CONTENT_DIR/_assets"
mkdir -p "$FUMADOCS_ROOT/public/images"

# Copy static assets
echo "📷 Copying static assets..."

if [ -d "$DOXYGEN_ROOT" ]; then
    cp -f "$DOXYGEN_ROOT/logo.png" "$FUMADOCS_ROOT/public/images/" 2>/dev/null || echo "  - logo.png not found"
    cp -f "$DOXYGEN_ROOT/sdk-icon.png" "$FUMADOCS_ROOT/public/images/" 2>/dev/null || echo "  - sdk-icon.png not found"
    cp -f "$DOXYGEN_ROOT/scenes.png" "$FUMADOCS_ROOT/public/images/" 2>/dev/null || echo "  - scenes.png not found"
    cp -f "$DOXYGEN_ROOT/favicon.png" "$FUMADOCS_ROOT/public/" 2>/dev/null || echo "  - favicon.png not found"
    cp -f "$DOXYGEN_ROOT/wasm.png" "$FUMADOCS_ROOT/public/images/" 2>/dev/null || echo "  - wasm.png not found"
    echo "  ✅ Assets copied"
else
    echo "  ⚠️  Doxygen source directory not found at $DOXYGEN_ROOT"
fi

# Create root meta.json
echo "📝 Creating navigation structure..."

cat > "$CONTENT_DIR/meta.json" << 'EOF'
{
  "title": "PFC SDK Documentation",
  "pages": [
    "---Getting Started---",
    "getting-started",
    "---Guides---",
    "guides",
    "---Examples---",
    "examples",
    "---API Reference---",
    "api-reference",
    "---Tools---",
    "tools",
    "---Other---",
    "changelog",
    "legal"
  ]
}
EOF

# Create section meta files
cat > "$CONTENT_DIR/getting-started/_meta.json" << 'EOF'
{
  "title": "Getting Started",
  "pages": [
    "quickstart",
    "requirements",
    "installation",
    "licensing",
    "configuration"
  ]
}
EOF

cat > "$CONTENT_DIR/guides/_meta.json" << 'EOF'
{
  "title": "Guides",
  "pages": [
    "ai-preset-selection",
    "parameters",
    "looks",
    "pdf-processing",
    "color-management",
    "face-detection"
  ]
}
EOF

cat > "$CONTENT_DIR/examples/_meta.json" << 'EOF'
{
  "title": "Examples",
  "pages": [
    "linux-osx",
    "windows",
    "csharp",
    "ios",
    "android"
  ]
}
EOF

cat > "$CONTENT_DIR/api-reference/_meta.json" << 'EOF'
{
  "title": "API Reference",
  "pages": [
    "overview",
    "c-api",
    "csharp-api"
  ]
}
EOF

cat > "$CONTENT_DIR/tools/_meta.json" << 'EOF'
{
  "title": "Tools",
  "pages": [
    "cli",
    "docker"
  ]
}
EOF

cat > "$CONTENT_DIR/legal/_meta.json" << 'EOF'
{
  "title": "Legal",
  "pages": [
    "third-party-licenses"
  ]
}
EOF

echo "  ✅ Navigation structure created"

# Create placeholder MDX files with frontmatter
echo "📄 Creating placeholder MDX files..."

# Index page
cat > "$CONTENT_DIR/index.mdx" << 'EOF'
---
title: Perfectly Clear SDK v10
description: Welcome to the Perfectly Clear SDK documentation - AI-powered image correction
---

import { Cards, Card } from 'fumadocs-ui/components/card';

# Perfectly Clear SDK v10

![SDK Icon](/images/sdk-icon.png)

Welcome to the Perfectly Clear SDK! This guide explains how to use the SDK, Command Line application, or Docker solution to enable fully-automatic or interactive image corrections in your applications.

<Callout type="info">
This version of the SDK requires using Presets from Workbench v4.6 or newer.
</Callout>

## SDK Components

1. **[Command Line Application](/docs/tools/cli)** - Ready-for-production for Linux, Windows, and Mac OS
2. **[Docker Container](/docs/tools/docker)** - Self-hosted HTTP API
3. **C and C# SDK** - Libraries for custom integration
4. **iOS and Android SDKs** - Mobile platform support

## Quick Links

<Cards>
  <Card
    title="Quick Start"
    href="/docs/getting-started/quickstart"
    description="Get up and running in minutes"
  />
  <Card
    title="AI Preset Selection"
    href="/docs/guides/ai-preset-selection"
    description="AI-powered automatic corrections"
  />
  <Card
    title="API Reference"
    href="/docs/api-reference"
    description="Complete API documentation"
  />
  <Card
    title="Examples"
    href="/docs/examples/linux-osx"
    description="Sample code for all platforms"
  />
</Cards>
EOF

# Getting Started - Quick Start
cat > "$CONTENT_DIR/getting-started/quickstart.mdx" << 'EOF'
---
title: Quick Start
description: Get started with the Perfectly Clear SDK in minutes
---

# Quick Start

{/* TODO: Migrate content from mainpage.md general-usage section */}

Applying Perfectly Clear corrections requires these steps:

1. Enable license setup with `PFC_SetProtectionPath`
2. Load AI models for AI Preset Selection and corrections
3. Load image data into a `PFCIMAGE`
4. Set correction parameters in `PFCPARAM`
5. Apply corrections with `PFC_AutoCorrect()` or `PFC_Calc()` + `PFC_Apply()`
6. Read corrected data or write to file

## Basic Example

```cpp
#include "PerfectlyClearPro.h"
#include "PFCImageFile.h"

int main() {
    // Setup license
    PFC_SetProtectionPath("/path/to/license");
    
    // Load image
    PFCImageFile imageFile;
    imageFile.LoadImage("/path/to/input.jpg");
    
    // Create AI engine
    PFCENGINE engine;
    PFC_CreateEngine(&engine, "/path/to/models", PFCFEATURE_ALL);
    
    // Apply corrections
    PFCIMAGE* pImage = imageFile.PFCImageGet();
    PFCPARAM param;
    PFC_AutoCorrect(pImage, NULL, &param, &engine, NULL, 0, 0);
    
    // Save result
    imageFile.SaveImage("/path/to/output.jpg", 95);
    
    return 0;
}
```
EOF

# Getting Started - Requirements
cat > "$CONTENT_DIR/getting-started/requirements.mdx" << 'EOF'
---
title: System Requirements
description: Hardware and software requirements for the Perfectly Clear SDK
---

# System Requirements

{/* TODO: Migrate content from mainpage.md limitations section */}

## Supported Platforms

- **Windows**: Windows 10 or later (64-bit)
- **macOS**: 10.6 (Snow Leopard) or later
- **Linux**: 64-bit distributions

## Hardware Requirements

- Recommended: 1GB RAM per CPU core
- AVX instruction set support recommended for optimal performance
- AVX2 required for license-protected SDKs

## Image Format Support

- **Supported**: RGB and RGBA formats
- **Not supported**: CMYK, single-channel monochrome, indexed color, 32-bit HDR

## Image Size Limits

- Minimum: 32 pixels on shorter side
- Maximum aspect ratio: 21:1
EOF

# Getting Started - Installation
cat > "$CONTENT_DIR/getting-started/installation.mdx" << 'EOF'
---
title: Installation
description: How to install and set up the Perfectly Clear SDK
---

# Installation

{/* TODO: Migrate installation steps */}

## Prerequisites

### Linux

```bash
# Ubuntu/Debian
sudo apt-get install --no-install-recommends libcurl4 build-essential

# Red Hat/CentOS
sudo yum -y install gcc gcc-c++ make libcurl
```

### Windows

- vcruntime140.dll must be present
- ONNX runtime DLL in PATH for AI features

## SDK Installation

1. Extract the SDK package to your project directory
2. Add include paths to your build system
3. Link against the SDK libraries
EOF

# Getting Started - Licensing
cat > "$CONTENT_DIR/getting-started/licensing.mdx" << 'EOF'
---
title: License Setup
description: How to configure SDK license protection
---

# License Setup

{/* TODO: Migrate content from mainpage.md licensing section */}

## Required Files

| File | Purpose |
|------|---------|
| `license.key` | Valid license key |
| `registration_email.txt` | Registration email |
| `ShaferFilechck.*` | License handling library |
| `PFCAppTrack.*` | App tracking library |

## Setup Steps

1. Create a writable folder accessible to the SDK
2. Copy license files to that folder
3. Call `PFC_SetProtectionPath()` with the folder path

```cpp
int ret = PFC_SetProtectionPath("/path/to/sdk_license");
if (ret != 0) {
    printf("License setup failed: %d\n", ret);
}
```

<Callout type="info">
The SDK validates the license every 12 hours via network connection to my.nalpeiron.com (184.106.60.185).
</Callout>
EOF

# Getting Started - Configuration
cat > "$CONTENT_DIR/getting-started/configuration.mdx" << 'EOF'
---
title: Configuration
description: Configure the SDK for your use case
---

# Configuration

{/* TODO: Add configuration content */}

## Loading AI Models

AI models are distributed as `.pnn` files and must be loaded before use:

```cpp
PFCENGINE engine;
int ret = PFC_CreateEngine(&engine, 
    pathToModels,
    PFCFEATURE_ALL
);
```

## Setting Parameters

Parameters can be set in two ways:

1. **Load from preset file**:
```cpp
PFCPARAM param;
PFC_ReadPresets(param, "/path/to/preset.preset");
```

2. **Set programmatically** (see Parameters guide)
EOF

# Guides - AI Preset Selection
cat > "$CONTENT_DIR/guides/ai-preset-selection.mdx" << 'EOF'
---
title: AI Preset Selection
description: Automatic preset selection using AI scene detection
---

# AI Preset Selection

{/* TODO: Migrate content from mainpage.md scene_detection section */}

![Scene Detection](/images/scenes.png)

AI Preset Selection applies different presets based on image content, lighting, and subject matter.

## Available Preset Groups

| Group | Server SDK | Mobile SDK |
|-------|-----------|------------|
| Universal | `pro_and_universal_*.pnn` | `sd_*_tflite.pnn` |
| Pro | `pro_and_universal_*.pnn` | `sd_*_tflite.pnn` |
| School/Sports | `school_and_sports_*.pnn` | `sd_*_tflite.pnn` |

## Using AI Preset Selection

```cpp
// Create AI Engine
PFCENGINE engine;
PFC_CreateEngine(&engine, modelPath, PFCFEATURE_ALL);

// Load custom presets (optional)
PFC_LoadScenePresets(&engine, "/path/to/custom.preset");

// Process with AI-selected preset
PFC_AutoCorrect(pImage, NULL, &param, &engine, NULL, 0, 0);

// Get detected scene
const char* scene = PFC_GetSceneLabel(&engine);
```
EOF

# Guides - Parameters
cat > "$CONTENT_DIR/guides/parameters.mdx" << 'EOF'
---
title: Correction Parameters
description: Understanding and configuring image correction parameters
---

# Correction Parameters

{/* TODO: Migrate content from mainpage.md parameters section */}

## Available Corrections

1. **Perfectly Clear Core** - Exposure, contrast, color
2. **Noise Corrections** - Noise reduction
3. **Red-eye Removal** - Automatic red-eye fix
4. **Retouching** - Face beautification (optional)
5. **V3 LOOKs** - Creative filters and finishes

## Setting Parameters

### Using Preset Files

```cpp
PFCPARAM param;
PFC_ReadPresets(param, "/path/to/preset.preset");
```

### Manual Configuration

```cpp
param.core.bEnabled = true;
param.core.bUseAutomaticStrengthSelection = true;
param.core.eAggressiveness = AGGRESSIVENESS_CONSERVATIVE;
param.core.bSharpen = true;
param.core.fSharpenScale = 1.0f;
// ... more parameters
```
EOF

# Guides - LOOKs
cat > "$CONTENT_DIR/guides/looks.mdx" << 'EOF'
---
title: LOOKs Reference
description: Available creative LOOKs in the SDK
---

# LOOKs Reference

{/* TODO: Migrate content from mainpage.md looks section */}

## Input Color Correction

- Blue, Cyan, Dark Blue, Dark Gold
- Dark Green, Dark Red, Green, Magenta
- Orange, Red, Sepia, Violet, Yellow

## Output B&W Film Stocks

- Burnt Black and White
- Classic Black and White
- Crisp Black and White
- Dingy Black and White Film
- Newsprint Black and White
- Rough Sepia
- Tritone

## Output Color Film Stocks

- Bleached Film, Blue Pop Film
- Double Dip, Light Film
- Pop Film, Simple Film, Warm Film

## Output Color Grades

- Autumn, Bleached, Candlelight
- Cold Steel, Cool Blue HiCon
- Dark Moody, Deep Blue, Night Shift
- Pink Shadows, Stonewashed
EOF

# Guides - PDF Processing
cat > "$CONTENT_DIR/guides/pdf-processing.mdx" << 'EOF'
---
title: PDF Processing
description: Correct images embedded in PDF documents
---

# PDF Processing

{/* TODO: Migrate content from examples_pdf.md */}

The SDK can extract, correct, and replace JPEG images in PDF files.

## Example

```cpp
// Load PDF
PFCPDFImage pdf;
pdf.Open("/path/to/document.pdf");

// Iterate over images
PFCPDFImageIterator iter(&pdf);
while (iter.Next()) {
    PFCIMAGE* pImage = iter.GetImage();
    
    // Apply corrections
    PFC_AutoCorrect(pImage, NULL, &param, &engine, NULL, 0, 0);
    
    // Replace image in PDF
    iter.ReplaceImage(pImage);
}

// Save corrected PDF
pdf.Save("/path/to/output.pdf");
```
EOF

# Guides - Color Management
cat > "$CONTENT_DIR/guides/color-management.mdx" << 'EOF'
---
title: Color Management
description: How the SDK handles color profiles and color spaces
---

# Color Management

{/* TODO: Migrate from limitations section */}

## Overview

- CLI and Docker solutions are fully color managed
- Input profile is preserved as output profile by default
- Optional conversion to any output profile (e.g., sRGB)

## Important Notes

<Callout type="warn">
When loading RGB data directly via `PFCIMAGE` structure, data must be in sRGB format.
</Callout>

- Only RGB and RGBA data supported
- CMYK not supported
- Unassigned color space defaults to sRGB
EOF

# Guides - Face Detection
cat > "$CONTENT_DIR/guides/face-detection.mdx" << 'EOF'
---
title: Face Detection
description: Using face detection features in the SDK
---

# Face Detection

The SDK provides robust face detection with detailed face information.

## Available Data

- Blink and smile detection
- Face rotation and yaw angles
- Face and eye position/size
- Confidence values

## PFCFaceRect Structure

```c
typedef struct _PFCFaceRect {
    int left, top, right, bottom;  // Face bounds
    int leftEyeX, leftEyeY;        // Left eye position
    int rightEyeX, rightEyeY;      // Right eye position
    float confidence;               // Detection confidence
    bool blinkDetected;            // Blink status
    bool smileDetected;            // Smile status
    float yaw, pitch, roll;        // Face rotation
} PFCFaceRect;
```
EOF

# Examples
cat > "$CONTENT_DIR/examples/linux-osx.mdx" << 'EOF'
---
title: Linux & macOS Examples
description: Sample code for Linux and macOS platforms
---

# Linux & macOS Examples

{/* TODO: Migrate content from examples_unix.md */}

## Simple AI Sample

```cpp
// 1. Setup license
PFC_SetProtectionPath(protectionPath);

// 2. Load image
PFCImageFile imageFile;
imageFile.LoadImage(inputPath);

// 3. Initialize AI engine
PFCENGINE engine;
PFC_CreateEngine(&engine, modelPath, PFCFEATURE_ALL);

// 4. Apply corrections
PFCIMAGE* pImage = imageFile.PFCImageGet();
PFC_AutoCorrect(pImage, NULL, &param, &engine, NULL, 0, 0);

// 5. Save result
imageFile.SaveImage(outputPath, quality);
```

## Detailed AI Sample

See the `DetailedAiSample` in the SDK for loading custom presets and reading detected scenes.

## Building Samples

```bash
cd SampleProjects/Linux/SimpleAiSample
make -f makefile.linux
./SimpleAiSample input.jpg output.jpg
```
EOF

cat > "$CONTENT_DIR/examples/windows.mdx" << 'EOF'
---
title: Windows Examples
description: Sample code for Windows platforms
---

# Windows Examples

{/* TODO: Migrate content from examples_win.md */}

Sample projects are in `SampleProjects/Win/`:

- `SimpleAiSample` - Basic AI correction
- `DetailedAiSample` - Advanced AI with scene detection
- `PresetSample` - Loading custom presets
- `PDFSample` - PDF image correction

## Building

Open the `.sln` file in Visual Studio and build.
EOF

cat > "$CONTENT_DIR/examples/csharp.mdx" << 'EOF'
---
title: C# Examples
description: Sample code for .NET development
---

# C# Examples

{/* TODO: Migrate content from examples_csharp.md */}

## Basic Usage

```csharp
using PerfectlyClearAdapter;

// Initialize
var pfc = new PerfectlyClear(licensePath);

// Load image
var imageFile = new PFCImageFile();
imageFile.LoadImage(inputPath);

// Apply corrections
var param = new PFCPARAM();
pfc.ReadPresets(ref param, presetPath);
pfc.AutoCorrect(imageFile.PFCImageGet(), param);

// Save
imageFile.SaveImage(outputPath, 95);
```
EOF

cat > "$CONTENT_DIR/examples/ios.mdx" << 'EOF'
---
title: iOS Examples
description: Sample code for iOS development
---

# iOS Examples

{/* TODO: Migrate content from examples_ios.md */}

See `SampleProjects/IOS_new/` for the complete iOS sample project.
EOF

cat > "$CONTENT_DIR/examples/android.mdx" << 'EOF'
---
title: Android Examples
description: Sample code for Android development
---

# Android Examples

{/* TODO: Migrate content from Android sample }

See `SampleProjects/AndroidKotlin/` for the Kotlin sample project.

## Dependencies

Add the PFC SDK AAR to your project's dependencies.
EOF

# API Reference
cat > "$CONTENT_DIR/api-reference/overview.mdx" << 'EOF'
---
title: API Overview
description: Overview of the Perfectly Clear SDK API
---

# API Overview

The SDK provides APIs for:

- **C/C++**: `PerfectlyClearPro.h`
- **C#/.NET**: `PerfectlyClearAdapter.cs`

## Key Structures

| Structure | Purpose |
|-----------|---------|
| `PFCIMAGE` | Image data container |
| `PFCPARAM` | Correction parameters |
| `PFCENGINE` | AI engine instance |
| `PFCIMAGEPROFILE` | Image analysis data |

## Key Functions

| Function | Purpose |
|----------|---------|
| `PFC_SetProtectionPath` | License setup |
| `PFC_CreateEngine` | Create AI engine |
| `PFC_AutoCorrect` | Apply all corrections |
| `PFC_Calc` | Calculate image profile |
| `PFC_Apply` | Apply corrections |
EOF

cat > "$CONTENT_DIR/api-reference/c-api.mdx" << 'EOF'
---
title: C/C++ API
description: C/C++ API reference
---

# C/C++ API Reference

{/* TODO: Generate from PerfectlyClearPro.h */}

## Functions

### PFC_SetProtectionPath

```c
int PFC_SetProtectionPath(const char* path);
```

Sets the path to the license files.

### PFC_CreateEngine

```c
int PFC_CreateEngine(
    PFCENGINE* engine,
    const char* modelPath,
    int features
);
```

Creates an AI engine instance.

### PFC_AutoCorrect

```c
PFCAPPLYSTATUS PFC_AutoCorrect(
    PFCIMAGE* pImage,
    PFCIMAGE* pReducedImage,
    PFCPARAM* pParam,
    PFCENGINE* pEngine,
    PFCIMAGEPROFILE* pProfile,
    int iRejectOption,
    int iFAEOption
);
```

Applies all corrections in one call.
EOF

cat > "$CONTENT_DIR/api-reference/csharp-api.mdx" << 'EOF'
---
title: C# API
description: .NET API reference
---

# C# API Reference

{/* TODO: Generate from PerfectlyClearAdapter.cs */}

## PerfectlyClear Class

```csharp
public class PerfectlyClear : IDisposable
{
    public PerfectlyClear(string protectionPath);
    public int ReadPresets(ref PFCPARAM param, string presetPath);
    public PFCAPPLYSTATUS AutoCorrect(IntPtr pImage, PFCPARAM param);
    // ...
}
```

## PFCImageFile Class

```csharp
public class PFCImageFile : IDisposable
{
    public bool LoadImage(string path);
    public bool SaveImage(string path, int quality);
    public IntPtr PFCImageGet();
    // ...
}
```
EOF

# Tools
cat > "$CONTENT_DIR/tools/cli.mdx" << 'EOF'
---
title: Command Line Interface
description: Using the Perfectly Clear CLI application
---

# Command Line Interface

{/* TODO: Migrate from Internal/cmd/README.html */}

The CLI provides ready-for-production image correction for Linux, Windows, and macOS.

## Basic Usage

```bash
pfccli --input input.jpg --output output.jpg --preset auto
```

## Options

| Option | Description |
|--------|-------------|
| `--input` | Input file or directory |
| `--output` | Output file or directory |
| `--preset` | Preset file or "auto" |
| `--quality` | JPEG quality (1-100) |
| `--threads` | Number of processing threads |
EOF

cat > "$CONTENT_DIR/tools/docker.mdx" << 'EOF'
---
title: Docker Container
description: Using the Perfectly Clear Docker solution
---

# Docker Container

{/* TODO: Migrate from Container/Docs/README.html */}

The Docker container provides a self-hosted HTTP API for image corrections.

## Quick Start

```bash
docker pull eyeq/perfectlyclear
docker run -p 8080:8080 eyeq/perfectlyclear
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/correct` | POST | Correct an image |
| `/health` | GET | Health check |
| `/status` | GET | Server status |
EOF

# Changelog
cat > "$CONTENT_DIR/changelog.mdx" << 'EOF'
---
title: Changelog
description: Version history and release notes
---

# Changelog

{/* TODO: Migrate content from mainpage.md whats_new section */}

## Version 10.7.2 (Nov 7, 2025)

- Dramatic speed improvement in Docker solution (up to 25% faster)
- Better handling of corrupt input image color profiles
- Limit upscaling to 1.5x original size
- Improved Scene Detection for clipart images
- Updated Android SDK for 16KB page size support

## Version 10.7.1 (May 5, 2025)

- New "Objects - White Background" scene detection
- Improved color correction for highly saturated colors
- Fixed issue in license-protected Container solution

[See full history](https://eyeq.photos/business/perfectly-clear-sdks/sdk-version-history/)
EOF

# Legal
cat > "$CONTENT_DIR/legal/third-party-licenses.mdx" << 'EOF'
---
title: Third-Party Licenses
description: Open source licenses used in the SDK
---

# Third-Party Licenses

{/* TODO: Migrate content from 3rd_party_licenses.md */}

This page lists the open source components used in the Perfectly Clear SDK.
EOF

echo "  ✅ Placeholder MDX files created"

echo ""
echo "✅ Migration setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and edit the generated MDX files in content/docs/"
echo "2. Migrate content from the Doxygen source files"
echo "3. Run 'npm run dev' to preview the documentation"
echo "4. Check for broken links and missing content"
echo ""
echo "📖 See DOXYGEN_TO_FUMADOCS_MIGRATION.md for detailed instructions"
