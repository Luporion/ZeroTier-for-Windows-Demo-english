# Release Guide

This document explains how to create a new release of ZeroTier for Windows.

## Prerequisites

- Push access to the repository
- Git installed locally
- Latest code merged to main branch

## Creating a Release

### Step 1: Update Version

1. Update the version in `package.json`:
   ```json
   {
     "version": "0.0.1"
   }
   ```

2. Update `CHANGELOG.md` with changes in this release

3. Commit the version bump:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Bump version to 0.0.1"
   git push origin main
   ```

### Step 2: Create and Push Tag

1. Create a git tag matching the version (with 'v' prefix):
   ```bash
   git tag v0.0.1
   ```

2. Push the tag to GitHub:
   ```bash
   git push origin v0.0.1
   ```

### Step 3: Automated Build and Release

Once the tag is pushed, GitHub Actions will automatically:

1. **Build Workflow Triggers** (`.github/workflows/release.yml`):
   - Checks out the code
   - Installs dependencies
   - Builds the Windows installer
   - Creates a GitHub Release
   - Uploads the installer as a release asset

2. **Release Created**:
   - Visit the [Releases page](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/releases)
   - The new release will appear with:
     - Release notes (auto-generated)
     - Downloadable installer: `ZeroTier for Windows-Windows-<version>-Setup.exe`

### Step 4: Verify Release

1. Check the [Actions tab](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/actions) to ensure the workflow completed successfully

2. Visit the [Releases page](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/releases/latest) to verify:
   - Release is published (not draft)
   - Installer is attached
   - Release notes are present

3. Download and test the installer on a Windows machine

## Release Checklist

Before creating a release, ensure:

- [ ] All intended changes are merged to main
- [ ] Version number is updated in `package.json`
- [ ] `CHANGELOG.md` is updated with changes
- [ ] Build passes locally: `npm run build`
- [ ] Application runs correctly: `npm run dev`
- [ ] All tests pass (if applicable)

After creating a release:

- [ ] GitHub Actions workflow completed successfully
- [ ] Release appears on the Releases page
- [ ] Installer downloads correctly
- [ ] Installer runs and installs the application
- [ ] Application launches and works as expected

## Version Numbering

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
  - **MAJOR**: Breaking changes
  - **MINOR**: New features, backwards compatible
  - **PATCH**: Bug fixes, backwards compatible

Examples:
- `v0.0.1` - Initial release
- `v0.1.0` - First feature release
- `v0.1.1` - Bug fix release
- `v1.0.0` - First stable release

## Troubleshooting

### Build Fails in GitHub Actions

1. Check the Actions tab for error logs
2. Ensure the workflow file syntax is correct
3. Verify all secrets are configured (if needed)
4. Test the build locally: `npm run build`

### Release Not Created

1. Ensure the tag follows the pattern `v*.*.*` (e.g., `v0.0.1`)
2. Check that the `release.yml` workflow is enabled
3. Verify you have the necessary permissions
4. Check the Actions tab for errors

### Installer Not Attached

1. Check the build output in the Actions logs
2. Ensure the `release/` directory is being created
3. Verify the path in the `release.yml` workflow matches the actual output path

## Manual Release (if needed)

If automated release fails, you can create a manual release:

1. Build locally:
   ```bash
   npm run build
   ```

2. Go to [Create a new release](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/releases/new)

3. Fill in:
   - Tag version: `v0.0.1`
   - Release title: `ZeroTier for Windows v0.0.1`
   - Description: Copy from CHANGELOG.md

4. Upload the installer from `release/<version>/ZeroTier for Windows-Windows-<version>-Setup.exe`

5. Publish the release

## Support

For issues with the release process, please:
- Check existing [GitHub Issues](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/issues)
- Create a new issue if needed
- Contact the maintainers
