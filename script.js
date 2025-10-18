// Game state
let clicks = 0;
const unlockedAchievements = {};

// Stats tracking variables
let totalClicks = 0; // Track total clicks made during the game
let gameStartTime = Date.now(); // When the game started
let playTimeSeconds = 0; // Total play time in seconds

// Pause state variables
let isPaused = false; // Track if the game is currently paused
let pausedTime = 0; // Track how long the game has been paused

// Shop items state
const shopItems = [
  {
    name: "Drip Collector",
    baseCost: 10,
    cost: 10,
    owned: 0,
    cps: 0.1, // clicks per second
    costMultiplier: 1.15
  },
  {
    name: "Water Pump",
    baseCost: 50,
    cost: 50,
    owned: 0,
    cps: 1,
    costMultiplier: 1.15
  },
  {
    name: "Rainfall Generator",
    baseCost: 100,
    cost: 100,
    owned: 0,
    cps: 20,
    costMultiplier: 1.15
  },
  {
    name: "Ocean Reservoir",
    baseCost: 1000,
    cost: 1000,
    owned: 0,
    cps: 100,
    costMultiplier: 1.15
  }
];

// Get elements
const droplet = document.querySelector('.droplet');
const counter = document.getElementById('counter');
const shopTab = document.getElementById('shop-tab');
const achievementsTab = document.getElementById('achievements-tab');
const settingsTab = document.getElementById('settings-tab');
const shopContent = document.getElementById('shop-content');
const achievementsContent = document.getElementById('achievements-content');
const settingsContent = document.getElementById('settings-content');

// Get stats tab and content elements
const statsTab = document.querySelector('.tab:nth-child(3)'); // The "Stats" tab
const statsContent = document.getElementById('stats-content');

// Achievement definitions
const achievements = {
  'first-click': { 
    threshold: 1, 
    text: '🏆 First Click: You clicked the droplet once!',
    element: null 
  },
  'collector': { 
    threshold: 500, 
    text: '🏆 Collector: You reached 500 clicks!',
    element: null 
  },
  'master': { 
    threshold: 1000, 
    text: '🏆 Master: You reached 100 clicks!',
    element: null 
  }
};

// Show achievement notification and confetti
function showAchievement(achievementText) {
  // Show notification
  const popup = document.getElementById('achievement-popup');
  const message = document.getElementById('achievement-message');
  message.textContent = achievementText;
  popup.style.display = 'block';
  
  // Hide popup after 3 seconds
  setTimeout(() => { 
    popup.style.display = 'none'; 
  }, 3000);

  // Show confetti
  const canvas = document.getElementById('confetti-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  
  // Create confetti particles
  let confetti = [];
  for (let i = 0; i < 100; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      r: 6 + Math.random() * 8,
      d: Math.random() * 3 + 2,
      color: ["#FFC907", "#2E9DF7", "#8BD1CB", "#F5402C", "#4FCB53"][Math.floor(Math.random() * 5)],
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5
    });
  }
  
  let frame = 0;
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confetti.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation * Math.PI / 180);
      
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.r/2, -c.r/2, c.r, c.r * 1.5);
      
      ctx.restore();
      
      c.y += c.d;
      c.x += Math.sin(frame / 10 + c.r) * 2;
      c.rotation += c.rotationSpeed;
    });
    
    frame++;
    
    if (frame < 120) {
      requestAnimationFrame(drawConfetti);
    } else {
      canvas.style.display = 'none';
    }
  }
  
  drawConfetti();
}

// Check and unlock achievements
function checkAchievements() {
  for (const [key, achievement] of Object.entries(achievements)) {
    if (!unlockedAchievements[key] && clicks >= achievement.threshold) {
      unlockedAchievements[key] = true;
      showAchievement(achievement.text);
      
      const achievementItems = document.querySelectorAll('#achievements-content .item');
      achievementItems.forEach(item => {
        const description = item.querySelector('.item-description').textContent;
        if (description.includes(achievement.text.split(':')[0].replace('🏆 ', ''))) {
          item.style.background = 'linear-gradient(135deg, #FFC907 0%, #FFD700 100%)';
          item.style.border = '2px solid #2E9DF7';
          item.style.opacity = '1';
        }
      });
    }
  }
}

// Update clicks display - now shows as integer
function updateCounter() {
  counter.textContent = Math.floor(clicks); // Show as integer instead of decimal
}

// Function to calculate and display max clicks per second from owned items
function updateClicksPerSecond() {
  let totalCPS = 0;
  
  // Calculate total clicks per second from all owned items
  shopItems.forEach(item => {
    totalCPS += item.cps * item.owned;
  });
  
  // Update the display with the maximum possible CPS
  const clicksPerSecondElement = document.getElementById('clicks-per-minute-display');
  if (clicksPerSecondElement) {
    clicksPerSecondElement.textContent = totalCPS.toFixed(2); // Show max CPS with 2 decimal places
  }
}

// Update stats display
function updateStatsDisplay() {
  // Update current water amount
  const currentWaterElement = document.getElementById('current-water');
  if (currentWaterElement) {
    currentWaterElement.textContent = Math.floor(clicks);
  }
  
  // Update total clicks
  const totalClicksElement = document.getElementById('total-clicks');
  if (totalClicksElement) {
    totalClicksElement.textContent = totalClicks;
  }
  
  // Update play time (convert seconds to minutes and seconds)
  const playTimeElement = document.getElementById('play-time');
  if (playTimeElement) {
    const minutes = Math.floor(playTimeSeconds / 60);
    const seconds = playTimeSeconds % 60;
    playTimeElement.textContent = `${minutes}m ${seconds}s`;
  }
  
  // Update achievements unlocked count
  const achievementsUnlockedElement = document.getElementById('achievements-unlocked');
  if (achievementsUnlockedElement) {
    const unlockedCount = Object.keys(unlockedAchievements).length;
    achievementsUnlockedElement.textContent = unlockedCount;
  }
}

// Function to pause the game - stops all automatic functions
function pauseGame() {
  isPaused = true;
  pausedTime = Date.now(); // Record when we paused
  
  // Update button visibility
  const pauseBtn = document.getElementById('pause-btn');
  const unpauseBtn = document.getElementById('unpause-btn');
  pauseBtn.style.display = 'none';
  unpauseBtn.style.display = 'inline-block';
  
  // Show visual feedback that game is paused
  const droplet = document.querySelector('.droplet');
  droplet.style.opacity = '0.5';
  droplet.style.cursor = 'not-allowed';
}

// Function to unpause the game - resumes all automatic functions
function unpauseGame() {
  // Calculate how long we were paused and adjust game start time
  const pauseDuration = Date.now() - pausedTime;
  gameStartTime += pauseDuration; // Add pause time to start time so play time is accurate
  
  isPaused = false;
  
  // Update button visibility
  const pauseBtn = document.getElementById('pause-btn');
  const unpauseBtn = document.getElementById('unpause-btn');
  pauseBtn.style.display = 'inline-block';
  unpauseBtn.style.display = 'none';
  
  // Restore visual feedback that game is active
  const droplet = document.querySelector('.droplet');
  droplet.style.opacity = '1';
  droplet.style.cursor = 'pointer';
}

// Add clicks (for manual clicking) - modified to check pause state
function addClicks(amount) {
  // Don't add clicks if game is paused
  if (isPaused) {
    return;
  }
  
  clicks += amount;
  totalClicks += amount; // Track total clicks for stats
  
  updateCounter();
  checkAchievements();
  updateShopDisplay();
  updateStatsDisplay(); // Update stats when clicks change
  updateClicksPerSecond(); // Update clicks per second display when items change
}

// Droplet click handler
droplet.addEventListener('click', function() {
  addClicks(1);

  droplet.style.transform = 'rotate(135deg) scale(1.2)';
  setTimeout(function() {
    droplet.style.transform = 'rotate(135deg) scale(1)';
  }, 150);
});

// Purchase shop item - modified to check pause state
function purchaseItem(index) {
  // Don't allow purchases if game is paused
  if (isPaused) {
    return;
  }
  
  const item = shopItems[index];
  
  if (clicks >= item.cost) {
    clicks -= item.cost;
    item.owned++;
    
    // Calculate new cost (increases by multiplier each purchase)
    item.cost = Math.ceil(item.baseCost * Math.pow(item.costMultiplier, item.owned));
    
    updateCounter();
    updateShopDisplay();
    
    // Show purchase feedback
    const itemElements = document.querySelectorAll('#shop-content .item');
    const purchasedElement = itemElements[index];
    purchasedElement.style.transform = 'scale(1.05)';
    setTimeout(() => {
      purchasedElement.style.transform = 'scale(1)';
    }, 200);
  }
}

// Update shop display with current prices and owned counts
function updateShopDisplay() {
  const itemElements = document.querySelectorAll('#shop-content .item');
  
  itemElements.forEach((element, index) => {
    const item = shopItems[index];
    const description = element.querySelector('.item-description');
    
    // Update description with current cost and owned count
    description.innerHTML = `
      <strong>${item.name}</strong><br>
      Cost: ${item.cost} | Owned: ${item.owned}<br>
      <small>+${item.cps} water/sec</small>
    `;
    
    // Enable/disable based on affordability
    if (clicks >= item.cost) {
      element.style.opacity = '1';
      element.style.cursor = 'pointer';
      element.style.background = 'linear-gradient(135deg, rgba(46, 157, 247, 0.1), rgba(139, 209, 203, 0.1))';
    } else {
      element.style.opacity = '0.5';
      element.style.cursor = 'not-allowed';
      element.style.background = '';
    }
  });
  
  // Update clicks per second display when shop items change
  updateClicksPerSecond();
}

// Auto-clicker system - modified to check pause state
function startAutoClicker() {
  setInterval(() => {
    // Don't auto-click if game is paused
    if (isPaused) {
      return;
    }
    
    let totalCPS = 0;
    
    // Calculate total clicks per second from all owned items
    shopItems.forEach(item => {
      totalCPS += item.cps * item.owned;
    });
    
    // Add clicks (divided by 10 since we run 10 times per second)
    if (totalCPS > 0) {
      const clicksToAdd = totalCPS / 10;
      clicks += clicksToAdd;
      updateCounter();
      checkAchievements();
    }
  }, 100); // Run 10 times per second for smooth animation
}

// Add click handlers to shop items
function initializeShop() {
  const itemElements = document.querySelectorAll('#shop-content .item');
  
  itemElements.forEach((element, index) => {
    element.addEventListener('click', () => {
      purchaseItem(index);
    });
  });
  
  updateShopDisplay();
}

// Switch between shop, achievements, stats, and settings content when tabs are clicked
shopTab.addEventListener('click', function() {
  shopContent.style.display = 'block';
  achievementsContent.style.display = 'none';
  settingsContent.style.display = 'none';
  statsContent.style.display = 'none';
  
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  shopTab.classList.add('active');
});

achievementsTab.addEventListener('click', function() {
  shopContent.style.display = 'none';
  achievementsContent.style.display = 'block';
  settingsContent.style.display = 'none';
  statsContent.style.display = 'none';
  
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  achievementsTab.classList.add('active');
});

// Add stats tab click handler
statsTab.addEventListener('click', function() {
  shopContent.style.display = 'none';
  achievementsContent.style.display = 'none';
  settingsContent.style.display = 'none';
  statsContent.style.display = 'block';
  
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  statsTab.classList.add('active');
  
  updateStatsDisplay(); // Update stats when tab is opened
});

// Fix the settings tab click handler to actually show the settings content
settingsTab.addEventListener('click', function() {
  shopContent.style.display = 'none';
  achievementsContent.style.display = 'none';
  settingsContent.style.display = 'block'; // This was 'none' - should be 'block'!
  statsContent.style.display = 'none';
  
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  settingsTab.classList.add('active');
});

// Reset counter button logic
document.getElementById('reset-counter-btn').addEventListener('click', function() {
  if (confirm('Are you sure you want to reset your progress? This will reset your counter, achievements, and all purchases.')) {
    clicks = 0;
    totalClicks = 0; // Reset total clicks
    gameStartTime = Date.now(); // Reset game start time
    playTimeSeconds = 0; // Reset play time
    
    // If game was paused, unpause it after reset
    if (isPaused) {
      unpauseGame();
    }
    
    counter.textContent = clicks;
    
    // Reset achievements
    Object.keys(unlockedAchievements).forEach(key => delete unlockedAchievements[key]);
    
    // Reset achievement display styling
    const achievementItems = document.querySelectorAll('#achievements-content .item');
    achievementItems.forEach(item => {
      item.style.background = '';
      item.style.border = '';
      item.style.opacity = '0.6';
    });
    
    // Reset shop items
    shopItems.forEach(item => {
      item.owned = 0;
      item.cost = item.baseCost;
    });
    
    updateShopDisplay();
    updateStatsDisplay(); // Update stats display after reset
    updateClicksPerSecond(); // Update clicks per second display after reset
  }
});

// Start play time tracker - modified to check pause state
function startPlayTimeTracker() {
  setInterval(() => {
    // Don't update play time if game is paused
    if (isPaused) {
      return;
    }
    
    playTimeSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
    updateStatsDisplay(); // Update stats display every second
  }, 1000); // Update every second
}

// Start clicks per second tracker
function startClicksPerSecondTracker() {
  setInterval(() => {
    // Don't update if game is paused
    if (isPaused) {
      return;
    }
    
    updateClicksPerSecond(); // Update clicks per second display every 100ms for smoother updates
  }, 100); // Update every 100ms for smoother display
}

// Initialize on page load
window.addEventListener('load', function() {
  initializeShop();
  startAutoClicker();
  startPlayTimeTracker(); // Start tracking play time
  
  // Add pause and unpause button event listeners
  const pauseBtn = document.getElementById('pause-btn');
  const unpauseBtn = document.getElementById('unpause-btn');
  
  pauseBtn.addEventListener('click', function() {
    pauseGame();
  });
  
  unpauseBtn.addEventListener('click', function() {
    unpauseGame();
  });
  
  // Set initial achievement styling
  const achievementItems = document.querySelectorAll('#achievements-content .item');
  achievementItems.forEach(item => {
    item.style.opacity = '0.6';
  });

  // Initial stats display update
  updateStatsDisplay();
  updateClicksPerSecond(); // Initial clicks per second display update

  // Render images from the img/ folder into the gallery
  // NOTE: we're using a simple hard-coded list of filenames found in img/
  // This keeps things simple for beginners (no file system access from the browser).
  const imageFiles = [
    'img/cw_logo.png',
    'img/cw_logo_horizontal.png',
    'img/water-can-transparent.png',
    'img/water-can.png'
  ];

  function renderGallery(files) {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    // Clear any existing content
    gallery.innerHTML = '';

    files.forEach(src => {
      const wrapper = document.createElement('div');
      wrapper.className = 'gallery-item';

      const img = document.createElement('img');
      img.src = src;
      img.alt = src.split('/').pop();
      img.loading = 'lazy'; // Helpful for performance
      img.className = 'gallery-img';

      // Simple click handler: show a larger preview in a new tab
      img.addEventListener('click', () => {
        window.open(src, '_blank');
      });

      wrapper.appendChild(img);
      gallery.appendChild(wrapper);
    });
  }

  // Call it once on load
  renderGallery(imageFiles);
});