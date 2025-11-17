# ZeroTier-for-Windows

Demo version - Now fully translated to English

[![GitHub Build](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/actions/workflows/build.yml/badge.svg)](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/actions/workflows/build.yml)
[![GitHub Release](https://img.shields.io/github/v/release/Luporion/ZeroTier-for-Windows-Demo-english)](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/releases/latest)

## 📥 Downloads

**Ready-to-use installer available!**

### Latest Release
Download the latest Windows installer from the [Releases page](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/releases/latest).

1. Download `ZeroTier for Windows-Windows-X.X.X-Setup.exe`
2. Run the installer with Administrator privileges
3. Follow the installation wizard

### Building from Source
If you want to build from source, see the [BUILD.md](BUILD.md) guide for detailed instructions.

## Thanks to
[![ZeroTier](https://avatars.githubusercontent.com/u/4173285?s=60&v=4)](https://github.com/zerotier/ZeroTierOne)
[![electron-vite-vue](https://github.com/electron-vite.png?size=60)](https://github.com/electron-vite/electron-vite-vue)
[![vue3](https://avatars.githubusercontent.com/u/6128107?s=70&v=4)](https://github.com/vuejs/core)
[![Koa](/public/Koa.png?v=2)](https://github.com/koajs/koa)

<!-- [![GitHub Build](https://github.com/electron-vite/electron-vite-vue/actions/workflows/build.yml/badge.svg)](https://github.com/electron-vite/electron-vite-vue/actions/workflows/build.yml)
[![GitHub Discord](https://img.shields.io/badge/chat-discord-blue?logo=discord)](https://discord.gg/sRqjYpEAUK) -->

## Preview

![Preview.mp4](/public/Preview.gif?t=1)

## Currently Implemented Features

- Join Network
  - Automatically install ZeroTier One core
  - Network members can set their own notes
- Network Features
  - Batch Ping members
  - View member ID and IP
  - Default connection and global connection
- Network Management - Networks created on the official platform
  - Set management Token
  - Self-hosted controller support (ZeroUI/ztncui) via custom URLs
  - Configure per-network controller URLs for private admin networks
  - Member authorization
  - Sync member information within the network
- Transit Settings
  - Add transit servers
  - View network members and transit service connection information
- Language Support
  - English (UI fully translated)
- Platform Support
  - Windows
## Planned Features
- Network Features
  - Member file sharing
  - Set open ports for members to access local projects with one click
- Network Creation
  - Support local creation of networks on the official platform
  - Support local creation of networks on personal terminals
- Network Management
  - Delete/add members
  - Manage networks on personal terminals
- Automatic Program Updates
  - Automatically update this program
  - Automatically update ZeroTier One core
- Language Support
  - English
- Platform Support
  - MacOS
## Getting Started

### For End Users

Simply download the latest installer from the [Releases page](https://github.com/Luporion/ZeroTier-for-Windows-Demo-english/releases/latest) and run it.

### For Developers

```sh
# clone the project
git clone https://github.com/Luporion/ZeroTier-for-Windows-Demo-english.git

# enter the project directory
cd ZeroTier-for-Windows-Demo-english

# install dependency
npm install

# develop
npm run dev

# build
npm run build
```

For detailed build instructions, see [BUILD.md](BUILD.md).
