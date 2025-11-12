# NED Bank Clone - Banking Application

A single-page banking application with dynamic content loading.

## 🚀 How to Run

### Option 1: Using Python (Recommended)
If you have Python installed:
```bash
python -m http.server 8000
```
Then open your browser to: `http://localhost:8000`

### Option 2: Using Node.js
If you have Node.js installed:
```bash
npx http-server -p 8000
```
Then open your browser to: `http://localhost:8000`

### Option 3: Using VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: Using PHP (if installed)
```bash
php -S localhost:8000
```

## ⚠️ Important
**DO NOT** open `index.html` directly in the browser (double-clicking). It won't work because browsers block `fetch()` requests for security reasons when using the `file://` protocol.

You MUST use a web server (one of the options above).

## 📁 Project Structure
- `index.html` - Main layout with sidebar
- `home.html` - Home page content
- `payments.html` - Payments page
- `history.html` - History page
- `helper.html` - Helper/Support page
- `script.js` - Navigation and dynamic loading logic
- `styles.css` - All styling

## 🎯 Features
- Static sidebar navigation
- Dynamic content loading
- Interactive charts (home page)
- Responsive design

