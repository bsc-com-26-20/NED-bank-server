// FUNCTION: drawChart
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
// FUNCTION: moveRightPanelContent
function moveRightPanelContent() {
  const rightPanel = document.getElementById('right-panel');
  const rightPanelContent = document.getElementById('home-right-panel-content');
  
  if (!rightPanel || !rightPanelContent) return;
  const contentClone = rightPanelContent.cloneNode(true);
  contentClone.style.display = 'block'; // Show it in the right panel
  contentClone.removeAttribute('id'); // Remove the ID so we don't have duplicates
  rightPanel.innerHTML = ''; // Clear previous content
  rightPanel.appendChild(contentClone); // Add the content
  rightPanelContent.remove();
}

// FUNCTION: dynamically load CSS for a page
function loadPageStyles(page) {
  // Remove previous page-specific CSS
  const oldLink = document.getElementById("page-style");
  if (oldLink) oldLink.remove();

  // Create new <link> element
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `../css/${page}.css`; // path to your page-specific CSS
  link.id = "page-style";

  document.head.appendChild(link);
}


function loadPage(page) {
  fetch(`views/${page}.html`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.text();
    })
    .then(html => {
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = html;

      // ✅ Load page-specific CSS dynamically
      loadPageStyles(page);

      // Update active sidebar link
      document.querySelectorAll('.nav-item').forEach(a => {
        a.classList.remove('nav-item-active');
      });
      const activeLink = document.querySelector(`[data-name="${page}"]`);
      if (activeLink) {
        activeLink.classList.add('nav-item-active');
      }

      // Home page specific actions
      if (page === 'home') {
        setTimeout(async () => {
          moveRightPanelContent();
          await loadDashboardData();
          const costs = [12, 30, 22, 25, 18, 20, 12];
          drawChart('costChart', costs);
        }, 100);
      } else {
        const rightPanel = document.getElementById('right-panel');
        if (rightPanel) rightPanel.innerHTML = '';
      }

      // Initialize page-specific scripts
      setTimeout(() => {
        if (page === 'login') initLoginPage();
        if (page === 'payments') initPaymentsPage();
        if (page === 'history') initHistoryPage();
      }, 150);
    })
    .catch(err => {
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



document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    const page = link.getAttribute('data-name');
    await checkAuthAndLoadPage(page);
  });
});

// FUNCTION: loadDashboardData
async function loadDashboardData() {
  try {
    const api = await import('./api.js');
    const stats = await api.getDashboardStats();
    const transactions = await api.getRecentTransactions();
    updateDashboardUI(stats, transactions);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showErrorMessage('Failed to load dashboard data. Make sure the backend server is running.');
  }
}
// FUNCTION: updateDashboardUI
function updateDashboardUI(stats, transactions) {
  updateDashboardStats(stats);
  updateRecentTransactions(transactions);
}

// FUNCTION: updateDashboardStats
function updateDashboardStats(stats) {
  const popularSection = document.querySelector('.popular');
  if (!popularSection) return;
  
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
// FUNCTION: updateRecentTransactions
function updateRecentTransactions(transactions) {
  const historyList = document.querySelector('.right-panel .history ul');
  if (!historyList) return;
  
  historyList.innerHTML = '';
  
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

function showErrorMessage(message) {
  console.error(message);
}
// FUNCTION: initLoginPage
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

// FUNCTION: checkAuthAndLoadPage
async function checkAuthAndLoadPage(page) {
  const publicPages = ['login'];
  
  if (publicPages.includes(page)) {
    loadPage(page);
    return;
  }
  
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

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const { isAuthenticated } = await import('./auth.js');
    if (isAuthenticated()) {
      checkAuthAndLoadPage('home');
    } else {
      checkAuthAndLoadPage('login');
    }
  } catch (error) {
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

// FUNCTION: initLogout
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

// FUNCTION: initPaymentsPage
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
// FUNCTION: handleDeposit
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

// FUNCTION: handleWithdraw
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

// FUNCTION: handleTransfer
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

// FUNCTION: initHistoryPage
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

// FUNCTION: loadTransactionHistory
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
