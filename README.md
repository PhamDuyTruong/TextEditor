# 🎨 Editor Canvas Test

A Canvas Editor application built with React + Vite, allowing you to create and edit text elements.

---

## 📦 System Requirements

Before starting, make sure you have installed:

- **Node.js** version 16.x or higher
  - Download: https://nodejs.org/
  - Check version: `node --version`

- **Yarn** (recommended) or **npm**
  - Install Yarn: `npm install -g yarn`
  - Check version: `yarn --version`

---

## 🚀 Installation and Setup

### Step 1: Clone or download project

```bash
# If you have Git
git clone https://github.com/PhamDuyTruong/TextEditor.git
cd EditorCanvasTest

# Or download ZIP and extract
```

### Step 2: Install dependencies

```bash
# Using Yarn (recommended)
yarn install

# Or using npm
npm install
```

> ⏱ Installation time: approximately 2-5 minutes

### Step 3: Run development server

```bash
# Using Yarn
yarn dev

# Or using npm
npm run dev
```

### Step 4: Open browser

The application will automatically open at: **http://localhost:3000**

If it doesn't open automatically, copy the link above into your browser.

---

## 📋 Available Commands

```bash
# Run development server (hot reload)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

---

## 🎯 Quick Usage Guide

1. **Add text**: Click the "T" button on toolbar
2. **Edit text**: Double-click on text
3. **Move**: Click and drag text
4. **Resize**: Drag corners or edges
5. **Rotate**: Drag the circular handle below text
6. **Format**: Click text to show toolbar (font size, color, alignment)
7. **Context menu**: Right-click on text
8. **Undo/Redo**: Ctrl+Z / Ctrl+Y

---

## 🛠 Tech Stack

- **React 18.2** - UI Library
- **Vite 4.4** - Build tool
- **MobX 6.10** - State management
- **SASS** - CSS preprocessor
- **HTML5 Canvas** - Rendering

---

## 📂 Folder Structure

```
EditorCanvasTest/
├── src/
│   ├── components/       # React components
│   ├── common/          # Reusable UI components
│   ├── models/          # Business logic
│   ├── stores/          # MobX stores
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   └── styles/          # Global styles
├── package.json
├── vite.config.js
└── README.md
```

---

## 🐛 Common Issues & Solutions

### Error: Port 3000 is already in use

**Solution:**
- Close the application using port 3000
- Or change the port in `vite.config.js`

### Error: Module not found

**Solution:**
```bash
# Remove node_modules and reinstall
rm -rf node_modules yarn.lock
yarn install
```

### Error: Hot reload not working

**Solution:**
```bash
# Restart server
Ctrl+C
yarn dev
```
