# Building ZeroTier for Windows

This guide explains how to build the ZeroTier for Windows application from source.

## Prerequisites

Before building, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)
- **Windows OS** (required for building Windows installer)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Luporion/ZeroTier-for-Windows-Demo-english.git
cd ZeroTier-for-Windows-Demo-english
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Electron
- Vue 3
- Vite
- electron-builder (for packaging)

### 3. Development Mode

To run the application in development mode:

```bash
npm run dev
```

This will start the Vite development server and launch the Electron application with hot-reload enabled.

### 4. Build the Application

To build the production-ready installer:

```bash
npm run build
```

This command will:
1. Run TypeScript type checking (`vue-tsc --noEmit`)
2. Build the Vue frontend and Electron main/preload scripts (`vite build`)
3. Package the application using electron-builder
4. Create the installer in the `release/` directory

## Build Output

After a successful build, you'll find the following in the `release/` directory:

- **Windows NSIS Installer**: `ZeroTier for Windows-Windows-<version>-Setup.exe`
  - Located in: `release/<version>/`
  - This is the main installer for end users
  
- **Unpacked Application**: 
  - Located in: `release/<version>/win-unpacked/`
  - Can be run directly without installation (for testing)

## Build Configuration

The build is configured through:

- **package.json**: Contains build scripts and dependencies
- **electron-builder.json5**: Electron Builder configuration
  - App name, version, and output directory
  - Windows-specific settings (NSIS installer, admin privileges)
  - Icon and resource configuration

## Troubleshooting

### Build Fails with TypeScript Errors

Make sure all TypeScript types are correct:
```bash
npx vue-tsc --noEmit
```

### Missing Dependencies

If you encounter missing dependencies:
```bash
rm -rf node_modules
npm install
```

### electron-builder Issues

If electron-builder fails, try:
```bash
# Clear electron-builder cache
npx electron-builder install-app-deps
```

### Windows Defender / Antivirus Issues

Some antivirus software may interfere with the build process. You may need to:
- Add the project directory to your antivirus exclusions
- Temporarily disable real-time scanning during build

## Platform-Specific Notes

### Building on Windows

- Requires Administrator privileges for some operations
- The ZeroTier One MSI installer must be present in the project root
- The `bat/` directory contains batch scripts needed at runtime

### Building on macOS/Linux

Currently, the Windows build is optimized for Windows hosts. Cross-platform building may require additional configuration:

```json5
// electron-builder.json5 contains mac and linux targets
// but they may need testing and adjustment
```

## Continuous Integration

This repository includes GitHub Actions workflows for automated building:

- **build.yml**: Builds the application on every push
- **release.yml**: Creates GitHub Releases when a version tag is pushed

See `.github/workflows/` for workflow configurations.

## Advanced Configuration

### Changing the Version

Update the version in `package.json`:
```json
{
  "version": "0.0.2"
}
```

### Customizing the Installer

Edit `electron-builder.json5` to customize:
- App name and ID
- Installer type (NSIS, portable, MSI)
- Icon and branding
- Installation directory options

## Related Files

- `package.json` - Project metadata and build scripts
- `electron-builder.json5` - Electron Builder configuration
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `.github/workflows/build.yml` - CI/CD build workflow

## Getting Help

If you encounter issues building:

1. Check the [GitHub Issues](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/issues)
2. Ensure you're using compatible Node.js and npm versions
3. Review the error messages carefully
4. Create a new issue with build logs if needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.
