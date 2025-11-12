// ============================================
// JAVASCRIPT CONCEPTS EXPLAINED
// ============================================
// This file demonstrates several important JavaScript concepts:
// 1. DOM Manipulation (selecting and modifying HTML elements)
// 2. Event Listeners (responding to user clicks)
// 3. Fetch API (loading external files)
// 4. Promises and Async/Await (handling asynchronous operations)
// 5. CSS Class Manipulation (adding/removing classes for styling)
// ============================================

// ============================================
// FUNCTION: drawChart
// ============================================
// Concept: Canvas API for drawing graphics
// This function draws a line chart on an HTML canvas element
function drawChart(canvasId, data) {
  // DOM Selection: getElementById() finds an element by its ID
  const canvas = document.getElementById(canvasId);
  
  // Early Return: if canvas doesn't exist, exit the function
  if (!canvas) return;
  
  // Canvas Context: getContext('2d') gives us drawing tools
  const ctx = canvas.getContext('2d');
  const padding = 30;
  const w = canvas.width;
  const h = canvas.height;
  
  // Clear the canvas before drawing
  ctx.clearRect(0,0,w,h);

  // Draw background grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i=0;i<=5;i++){
    const y = padding + (h - padding*2) * (i/5);
    ctx.beginPath(); 
    ctx.moveTo(padding, y); 
    ctx.lineTo(w-padding, y); 
    ctx.stroke();
  }

  // Calculate chart points from data
  const max = Math.max(...data);  // Spread operator: converts array to arguments
  const min = Math.min(...data);
  
  // Array.map(): transforms each data point into x,y coordinates
  const points = data.map((v, i) => {
    const x = padding + ( (w - padding*2) * (i / (data.length-1)) );
    const y = padding + ( (h - padding*2) * (1 - (v - min) / (max - min || 1)) );
    return {x,y,v};  // Return an object with x, y, and value
  });

  // Draw the line chart
  ctx.strokeStyle = '#6b7df6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  
  // Array.forEach(): loops through each point
  points.forEach((p, i)=> {
    if (i===0) ctx.moveTo(p.x, p.y);  // First point: move to position
    else ctx.lineTo(p.x, p.y);         // Other points: draw line to position
  });
  ctx.stroke();

  // Fill area under the line
  ctx.lineTo(points[points.length-1].x, h - padding);
  ctx.lineTo(points[0].x, h - padding);
  ctx.closePath();
  ctx.fillStyle = 'rgba(107,125,246,0.1)';
  ctx.fill();
  
  // Draw points on the line
  ctx.fillStyle = '#cfe0ff';
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI*2);  // Draw a circle
    ctx.fill();
  });
}

// ============================================
// FUNCTION: moveRightPanelContent
// ============================================
// Concept: DOM Manipulation - Moving elements between containers
// This function extracts right panel content from home page and moves it to fixed right panel
function moveRightPanelContent() {
  const rightPanel = document.getElementById('right-panel');
  const rightPanelContent = document.getElementById('home-right-panel-content');
  
  if (!rightPanel || !rightPanelContent) return;
  
  // Move the content from home page to fixed right panel
  // cloneNode(true) creates a deep copy of the element
  const contentClone = rightPanelContent.cloneNode(true);
  contentClone.style.display = 'block'; // Show it in the right panel
  contentClone.removeAttribute('id'); // Remove the ID so we don't have duplicates
  
  rightPanel.innerHTML = ''; // Clear previous content
  rightPanel.appendChild(contentClone); // Add the content
  
  // Remove the hidden content from main content area
  rightPanelContent.remove();
}

// ============================================
// FUNCTION: loadPage
// ============================================
// Concept: Fetch API + Promises + DOM Manipulation
// This function loads HTML content from a file and displays it
function loadPage(page) {
  // Fetch API: makes an HTTP request to get a file
  // Returns a Promise (an object representing a future value)
  fetch(`${page}.html`)  // Template literal: `${variable}` inserts the variable
    .then(res => {  // .then() handles the response when it arrives
      // Check if the request was successful
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.text();  // Convert response to text (HTML string)
    })
    .then(html => {  // This .then() receives the HTML text
      // DOM Manipulation: innerHTML replaces the content of an element
      document.getElementById('main-content').innerHTML = html;

      // ============================================
      // ACTIVE PAGE HIGHLIGHTING - KEY CONCEPT!
      // ============================================
      // Step 1: Remove 'nav-item-active' class from ALL navigation items
      // querySelectorAll() returns a NodeList (like an array) of all matching elements
      document.querySelectorAll('.nav-item').forEach(a => {
        // classList.remove() removes a CSS class from an element
        a.classList.remove('nav-item-active');
      });
      
      // Step 2: Find the link that matches the current page
      // Template literal with attribute selector: [data-name="home"]
      const activeLink = document.querySelector(`[data-name="${page}"]`);
      
      // Step 3: Add 'nav-item-active' class to highlight the active page
      if (activeLink) {
        // classList.add() adds a CSS class to an element
        activeLink.classList.add('nav-item-active');
      }
      // ============================================

      // Handle right panel content for home page
      if (page === 'home') {
        // Move right panel content from home page to fixed right panel
        // setTimeout ensures DOM is ready before we try to move elements
        setTimeout(async () => {
          moveRightPanelContent();
          
          // Load real data from backend
          await loadDashboardData();
          
          // Draw chart after content is loaded
          const costs = [12, 30, 22, 25, 18, 20, 12];
          drawChart('costChart', costs);
        }, 100);  // Wait 100ms for DOM to be ready
      } else {
        // Clear right panel for other pages
        const rightPanel = document.getElementById('right-panel');
        if (rightPanel) {
          rightPanel.innerHTML = '';
        }
      }

      // Reinitialize page-specific handlers after content loads
      setTimeout(() => {
        if (page === 'login') initLoginPage();
        if (page === 'payments') initPaymentsPage();
        if (page === 'history') initHistoryPage();
      }, 150);
    })
    .catch(err => {  // .catch() handles any errors that occur
      console.error('Error loading page:', err);
      document.getElementById('main-content').innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h3>⚠️ Error Loading Page</h3>
          <p>Could not load ${page}.html</p>
          <p style="color: #a8b3cf; font-size: 0.9em;">
            Make sure you're running the app through a web server.<br>
            Use Python: <code>python -m http.server 8000</code> or<br>
            Use VS Code Live Server extension
          </p>
        </div>`;
    });
}

// ============================================
// EVENT LISTENERS - KEY CONCEPT!
// ============================================
// Concept: Event-driven programming
// We attach "listeners" to elements that wait for user interactions

// Step 1: Select ALL navigation links
// querySelectorAll('.nav-item') finds all elements with class "nav-item"
document.querySelectorAll('.nav-item').forEach(link => {
  // Step 2: Add an event listener to each link
  // addEventListener('click', function) listens for click events
  link.addEventListener('click', async (e) => {
    // e.preventDefault() stops the default link behavior (preventing page reload)
    e.preventDefault();
    
    // Step 3: Get which page to load
    // getAttribute() reads the value of the data-name attribute
    const page = link.getAttribute('data-name');
    
    // Step 4: Check auth and load that page
    await checkAuthAndLoadPage(page);
  });
});
// ============================================

// ============================================
// FUNCTION: loadDashboardData
// ============================================
// Concept: Fetching real data from backend API
// This function loads dashboard stats and transactions from the backend
async function loadDashboardData() {
  try {
    // Import API functions (using dynamic import for ES modules)
    const api = await import('./api.js');
    
    // Fetch dashboard stats
    const stats = await api.getDashboardStats();
    
    // Fetch recent transactions
    const transactions = await api.getRecentTransactions();
    
    // Update the UI with real data
    updateDashboardUI(stats, transactions);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Show error message to user
    showErrorMessage('Failed to load dashboard data. Make sure the backend server is running.');
  }
}

// ============================================
// FUNCTION: updateDashboardUI
// ============================================
// Updates the dashboard UI with real data from backend
function updateDashboardUI(stats, transactions) {
  // Update stats display
  updateDashboardStats(stats);
  
  // Update recent transactions in the right panel
  updateRecentTransactions(transactions);
}

// ============================================
// FUNCTION: updateDashboardStats
// ============================================
// Updates the dashboard statistics display
function updateDashboardStats(stats) {
  // Create or update stats cards in the popular section
  const popularSection = document.querySelector('.popular');
  if (!popularSection) return;
  
  // Update or create stats display
  let statsContainer = document.getElementById('dashboard-stats');
  if (!statsContainer) {
    statsContainer = document.createElement('div');
    statsContainer.id = 'dashboard-stats';
    statsContainer.className = 'dashboard-stats';
    popularSection.insertBefore(statsContainer, popularSection.querySelector('.cards'));
  }
  
  statsContainer.innerHTML = `
    <div class="stat-card">
      <h4>Total Customers</h4>
      <p class="stat-value">${stats.total_customers || 0}</p>
    </div>
    <div class="stat-card">
      <h4>Total Accounts</h4>
      <p class="stat-value">${stats.total_accounts || 0}</p>
    </div>
    <div class="stat-card">
      <h4>Total Balance</h4>
      <p class="stat-value">${(stats.total_balance || 0).toFixed(2)} BYN</p>
    </div>
  `;
}

// ============================================
// FUNCTION: updateRecentTransactions
// ============================================
// Updates the history section with real transactions
function updateRecentTransactions(transactions) {
  const historyList = document.querySelector('.right-panel .history ul');
  if (!historyList) return;
  
  // Clear existing items
  historyList.innerHTML = '';
  
  // Add real transactions
  transactions.slice(0, 5).forEach(transaction => {
    const li = document.createElement('li');
    const amount = parseFloat(transaction.amount);
    const sign = amount >= 0 ? '+' : '';
    const amountText = `${sign}${amount.toFixed(2)} BYN`;
    
    li.innerHTML = `
      ${transaction.first_name || 'Unknown'} ${transaction.last_name || ''} 
      <span>${amountText}</span>
    `;
    historyList.appendChild(li);
  });
}

// ============================================
// FUNCTION: showErrorMessage
// ============================================
// Shows error messages to the user
function showErrorMessage(message) {
  // You can create a toast notification or alert here
  console.error(message);
  // For now, just log to console
}

// ============================================
// FUNCTION: initLoginPage
// ============================================
// Sets up login form event handlers
function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');
    
    // Show loading state
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    errorDiv.style.display = 'none';
    
    try {
      const { handleLogin } = await import('./auth.js');
      const result = await handleLogin(username, password);
      
      if (result.success) {
        // Login successful - reload to show dashboard
        window.location.reload();
      } else {
        // Show error
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
      }
    } catch (error) {
      errorDiv.textContent = 'An unexpected error occurred. Please try again.';
      errorDiv.style.display = 'block';
    } finally {
      // Reset button state
      loginBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  });
}

// ============================================
// FUNCTION: checkAuthAndLoadPage
// ============================================
// Checks authentication before loading pages
async function checkAuthAndLoadPage(page) {
  // Pages that don't require authentication
  const publicPages = ['login'];
  
  if (publicPages.includes(page)) {
    loadPage(page);
    return;
  }
  
  // Check authentication for protected pages
  try {
    const { isAuthenticated } = await import('./auth.js');
    if (!isAuthenticated()) {
      loadPage('login');
      return;
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
  
  loadPage(page);
}

// ============================================
// PAGE LOAD EVENT
// ============================================
// Concept: DOMContentLoaded event
// This fires when the HTML is fully loaded (but images might still be loading)
window.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  try {
    const { isAuthenticated } = await import('./auth.js');
    if (isAuthenticated()) {
      // User is logged in - load home page
      checkAuthAndLoadPage('home');
    } else {
      // User not logged in - show login page
      checkAuthAndLoadPage('login');
    }
  } catch (error) {
    // If auth check fails, show login page
    checkAuthAndLoadPage('login');
  }
  
  // Initialize page-specific handlers
  setTimeout(() => {
    initLoginPage();
    initPaymentsPage();
    initHistoryPage();
    initLogout();
  }, 100);
});

// ============================================
// FUNCTION: initLogout
// ============================================
// Sets up logout functionality
function initLogout() {
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const { handleLogout } = await import('./auth.js');
      await handleLogout();
    });
  }
}

// ============================================
// FUNCTION: initPaymentsPage
// ============================================
// Sets up payment forms (deposit, withdraw, transfer)
function initPaymentsPage() {
  // Deposit form
  const depositForm = document.getElementById('deposit-form');
  if (depositForm) {
    depositForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleDeposit();
    });
  }

  // Withdraw form
  const withdrawForm = document.getElementById('withdraw-form');
  if (withdrawForm) {
    withdrawForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleWithdraw();
    });
  }

  // Transfer form
  const transferForm = document.getElementById('transfer-form');
  if (transferForm) {
    transferForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleTransfer();
    });
  }
}

// ============================================
// FUNCTION: handleDeposit
// ============================================
async function handleDeposit() {
  const accountId = document.getElementById('deposit-account')?.value;
  const amount = parseFloat(document.getElementById('deposit-amount')?.value);
  const errorDiv = document.getElementById('deposit-error');
  const successDiv = document.getElementById('payment-success');
  const btn = document.getElementById('deposit-btn');
  const btnText = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');

  if (!accountId || !amount || amount <= 0) {
    if (errorDiv) {
      errorDiv.textContent = 'Please enter valid account ID and amount';
      errorDiv.style.display = 'block';
    }
    return;
  }

  // Show loading
  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoader) btnLoader.style.display = 'inline';
  if (errorDiv) errorDiv.style.display = 'none';
  if (successDiv) successDiv.style.display = 'none';

  try {
    const api = await import('./api.js');
    const result = await api.depositMoney(accountId, amount);
    
    if (successDiv) {
      successDiv.textContent = `✅ Deposit successful! New balance: ${result.account.balance} BYN`;
      successDiv.style.display = 'block';
      successDiv.className = 'success-message';
    }
    
    // Clear form
    document.getElementById('deposit-form')?.reset();
  } catch (error) {
    if (errorDiv) {
      errorDiv.textContent = error.message || 'Deposit failed. Please try again.';
      errorDiv.style.display = 'block';
    }
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

// ============================================
// FUNCTION: handleWithdraw
// ============================================
async function handleWithdraw() {
  const accountId = document.getElementById('withdraw-account')?.value;
  const amount = parseFloat(document.getElementById('withdraw-amount')?.value);
  const errorDiv = document.getElementById('withdraw-error');
  const successDiv = document.getElementById('payment-success');
  const btn = document.getElementById('withdraw-btn');
  const btnText = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');

  if (!accountId || !amount || amount <= 0) {
    if (errorDiv) {
      errorDiv.textContent = 'Please enter valid account ID and amount';
      errorDiv.style.display = 'block';
    }
    return;
  }

  // Show loading
  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoader) btnLoader.style.display = 'inline';
  if (errorDiv) errorDiv.style.display = 'none';
  if (successDiv) successDiv.style.display = 'none';

  try {
    const api = await import('./api.js');
    const result = await api.withdrawMoney(accountId, amount);
    
    if (successDiv) {
      successDiv.textContent = `✅ Withdrawal successful! New balance: ${result.account.balance} BYN`;
      successDiv.style.display = 'block';
      successDiv.className = 'success-message';
    }
    
    // Clear form
    document.getElementById('withdraw-form')?.reset();
  } catch (error) {
    if (errorDiv) {
      errorDiv.textContent = error.message || 'Withdrawal failed. Please check your balance.';
      errorDiv.style.display = 'block';
    }
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

// ============================================
// FUNCTION: handleTransfer
// ============================================
async function handleTransfer() {
  const fromAccountId = document.getElementById('from-account')?.value;
  const toAccountId = document.getElementById('to-account')?.value;
  const amount = parseFloat(document.getElementById('transfer-amount')?.value);
  const errorDiv = document.getElementById('transfer-error');
  const successDiv = document.getElementById('payment-success');
  const btn = document.getElementById('transfer-btn');
  const btnText = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');

  if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
    if (errorDiv) {
      errorDiv.textContent = 'Please enter valid account IDs and amount';
      errorDiv.style.display = 'block';
    }
    return;
  }

  if (fromAccountId === toAccountId) {
    if (errorDiv) {
      errorDiv.textContent = 'Cannot transfer to the same account';
      errorDiv.style.display = 'block';
    }
    return;
  }

  // Show loading
  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoader) btnLoader.style.display = 'inline';
  if (errorDiv) errorDiv.style.display = 'none';
  if (successDiv) successDiv.style.display = 'none';

  try {
    const api = await import('./api.js');
    const result = await api.transferMoney(fromAccountId, toAccountId, amount);
    
    if (successDiv) {
      successDiv.textContent = `✅ Transfer successful! From: ${result.from_account.balance} BYN, To: ${result.to_account.balance} BYN`;
      successDiv.style.display = 'block';
      successDiv.className = 'success-message';
    }
    
    // Clear form
    document.getElementById('transfer-form')?.reset();
  } catch (error) {
    if (errorDiv) {
      errorDiv.textContent = error.message || 'Transfer failed. Please check account IDs and balance.';
      errorDiv.style.display = 'block';
    }
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

// ============================================
// FUNCTION: initHistoryPage
// ============================================
// Sets up history page to load transactions
function initHistoryPage() {
  const loadBtn = document.getElementById('load-history-btn');
  if (loadBtn) {
    loadBtn.addEventListener('click', async () => {
      await loadTransactionHistory();
    });
  }

  // Auto-load on page load
  const historyPage = document.querySelector('.history-page');
  if (historyPage) {
    setTimeout(() => {
      loadTransactionHistory();
    }, 200);
  }
}

// ============================================
// FUNCTION: loadTransactionHistory
// ============================================
async function loadTransactionHistory() {
  const accountFilter = document.getElementById('account-filter')?.value;
  const transactionsList = document.getElementById('transactions-list');
  const errorDiv = document.getElementById('history-error');
  const loadingDiv = document.getElementById('history-loading');
  const loadBtn = document.getElementById('load-history-btn');
  const btnText = loadBtn?.querySelector('.btn-text');
  const btnLoader = loadBtn?.querySelector('.btn-loader');

  // Show loading
  if (loadingDiv) loadingDiv.style.display = 'block';
  if (errorDiv) errorDiv.style.display = 'none';
  if (transactionsList) transactionsList.innerHTML = '';
  if (loadBtn) loadBtn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoader) btnLoader.style.display = 'inline';

  try {
    const api = await import('./api.js');
    let transactions;

    if (accountFilter) {
      // Load transactions for specific account
      transactions = await api.getAccountTransactions(accountFilter);
    } else {
      // Load recent transactions
      transactions = await api.getRecentTransactions();
    }

    if (transactionsList) {
      if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="no-transactions">No transactions found.</p>';
      } else {
        transactionsList.innerHTML = transactions.map(tx => {
          const amount = parseFloat(tx.amount);
          const sign = amount >= 0 ? '+' : '';
          const date = new Date(tx.created_at).toLocaleString();
          const typeColors = {
            'deposit': '#4ade80',
            'withdraw': '#ff6b6b',
            'transfer_in': '#60a5fa',
            'transfer_out': '#f59e0b'
          };
          const color = typeColors[tx.type] || '#a8b3cf';
          
          return `
            <div class="transaction-item">
              <div class="tx-info">
                <span class="tx-type" style="color: ${color}">${tx.type.toUpperCase()}</span>
                <span class="tx-date">${date}</span>
              </div>
              <div class="tx-details">
                ${tx.account_number ? `<span>Account: ${tx.account_number}</span>` : ''}
                ${tx.first_name ? `<span>${tx.first_name} ${tx.last_name || ''}</span>` : ''}
              </div>
              <div class="tx-amount" style="color: ${amount >= 0 ? '#4ade80' : '#ff6b6b'}">
                ${sign}${amount.toFixed(2)} BYN
              </div>
            </div>
          `;
        }).join('');
      }
    }
  } catch (error) {
    if (errorDiv) {
      errorDiv.textContent = error.message || 'Failed to load transactions. Please try again.';
      errorDiv.style.display = 'block';
    }
  } finally {
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (loadBtn) loadBtn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

// ============================================
// SUMMARY OF JAVASCRIPT CONCEPTS USED:
// ============================================
// 1. DOM Selection: getElementById(), querySelector(), querySelectorAll()
// 2. DOM Manipulation: innerHTML, classList.add(), classList.remove()
// 3. Event Handling: addEventListener(), preventDefault()
// 4. Fetch API: fetch(), .then(), .catch()
// 5. Array Methods: forEach(), map()
// 6. Template Literals: `${variable}` for string interpolation
// 7. Arrow Functions: () => {} for concise function syntax
// 8. Async Operations: Promises, setTimeout()
// ============================================