# JavaScript Concepts Explained

## 🎯 What We Did

1. **Moved Right Panel to Top**: The exchange rates and history sections are now at the top of the main content area
2. **Settings at Bottom**: Settings link stays at the bottom of the sidebar
3. **Active Page Highlighting**: The current page is highlighted with a blue background

## 📚 Key JavaScript Concepts Used

### 1. **DOM Selection** (Selecting HTML Elements)
```javascript
// Get element by ID
document.getElementById('main-content')

// Get first matching element
document.querySelector('.nav-item')

// Get ALL matching elements (returns array-like NodeList)
document.querySelectorAll('.nav-item')
```

### 2. **DOM Manipulation** (Changing HTML Content)
```javascript
// Change the HTML content inside an element
element.innerHTML = '<p>New content</p>'

// Add a CSS class
element.classList.add('nav-item-active')

// Remove a CSS class
element.classList.remove('nav-item-active')
```

### 3. **Event Listeners** (Responding to User Actions)
```javascript
// Listen for click events
element.addEventListener('click', function(e) {
    e.preventDefault();  // Stop default behavior
    // Do something when clicked
})
```

### 4. **Fetch API** (Loading External Files)
```javascript
// Load a file asynchronously
fetch('home.html')
    .then(response => response.text())  // Convert to text
    .then(html => {
        // Use the HTML content
    })
    .catch(error => {
        // Handle errors
    })
```

### 5. **Template Literals** (String Interpolation)
```javascript
const page = 'home';
const url = `${page}.html`;  // Results in: "home.html"
```

### 6. **Array Methods**
```javascript
// Loop through array
array.forEach(item => {
    // Do something with each item
})

// Transform array
const newArray = array.map(item => {
    return item * 2;  // Transform each item
})
```

## 🔍 How Active Page Highlighting Works

```javascript
// Step 1: Remove active class from ALL links
document.querySelectorAll('.nav-item').forEach(link => {
    link.classList.remove('nav-item-active');
});

// Step 2: Find the link for current page
const activeLink = document.querySelector(`[data-name="${page}"]`);

// Step 3: Add active class to current page link
if (activeLink) {
    activeLink.classList.add('nav-item-active');
}
```

The CSS then styles `.nav-item-active` with a blue background to show which page is active.

## 🎨 CSS Class Toggle Pattern

This is a common pattern in web development:
- **Remove** the active class from all items
- **Add** the active class to the selected item
- CSS handles the visual styling

## 🚀 Try It Yourself

1. Open the browser console (F12)
2. Try selecting elements:
   ```javascript
   document.querySelectorAll('.nav-item')
   ```
3. Try adding/removing classes:
   ```javascript
   document.querySelector('.nav-item').classList.add('test')
   ```

## 📖 Further Learning

- **MDN Web Docs**: Best resource for JavaScript documentation
- **DOM Manipulation**: Learn about querySelector, getElementById, etc.
- **Event Handling**: Understanding addEventListener and event objects
- **Fetch API**: Modern way to load data asynchronously
