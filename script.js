// Show achievement notification and confetti
function showAchievement(achievementText) {
  // Show notification
  const popup = document.getElementById('achievement-popup');
  const message = document.getElementById('achievement-message');
  message.textContent = achievementText;
  popup.style.display = 'block';
  setTimeout(() => { popup.style.display = 'none'; }, 2500);

  // Show confetti
  const canvas = document.getElementById('confetti-canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  let confetti = [];
  for (let i = 0; i < 80; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: -20,
      r: 6 + Math.random() * 8,
      d: Math.random() * 2 + 1,
      color: ["#FFC907", "#2E9DF7", "#8BD1CB", "#F5402C", "#4FCB53"][Math.floor(Math.random()*5)]
    });
  }
  let frame = 0;
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
      ctx.fillStyle = c.color;
      ctx.fill();
      c.y += c.d;
      c.x += Math.sin(frame/10 + c.r) * 2;
    });
    frame++;
    if (frame < 60) {
      requestAnimationFrame(drawConfetti);
    } else {
      canvas.style.display = 'none';
    }
  }
  drawConfetti();
}
// Switch between shop and achievements content when tabs are clicked
// Example: Call showAchievement when an achievement is accomplished
// You should call this function in your achievement logic, for example:
// showAchievement('You unlocked: First Click!');
const shopTab = document.getElementById('shop-tab');
const achievementsTab = document.getElementById('achievements-tab');
const settingsTab = document.getElementById('settings-tab');
const shopContent = document.getElementById('shop-content');
const achievementsContent = document.getElementById('achievements-content');
const settingsContent = document.getElementById('settings-content');

shopTab.addEventListener('click', function() {
  shopContent.style.display = 'block';
  achievementsContent.style.display = 'none';
  settingsContent.style.display = 'none';
});

achievementsTab.addEventListener('click', function() {
  shopContent.style.display = 'none';
  achievementsContent.style.display = 'block';
  settingsContent.style.display = 'none';
});

settingsTab.addEventListener('click', function() {
  shopContent.style.display = 'none';
  achievementsContent.style.display = 'none';
  settingsContent.style.display = 'block';
});

// Reset counter button logic
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'reset-counter-btn') {
    clicks = 0;
    counter.textContent = clicks;
  }
});
// Get the droplet icon and counter elements from the page
const droplet = document.querySelector('.droplet');
const counter = document.getElementById('counter');

// Start the counter at 0
let clicks = 0;

// When the droplet icon is clicked, increase the counter by 1 and make it react visually
droplet.addEventListener('click', function() {
  clicks = clicks + 1; // Add 1 to the count
  counter.textContent = clicks; // Update the counter display

    // Make the droplet react: scale up briefly, but always keep it rotated at 135deg
    droplet.style.transform = 'rotate(135deg) scale(1.2)';
    setTimeout(function() {
      droplet.style.transform = 'rotate(135deg) scale(1)';
  }, 150);
});

//If counter is >= certain item cost, enable purchase button
const purchaseButton = document.getElementById('purchase-button');
const itemCosts = [10, 50, 1000, 10000]; // Array of item costs

// Check if the counter is enough to purchase any item
if (clicks >= itemCosts[0]) {
  purchaseButton.disabled = false;
}
else {
  purchaseButton.disabled = true;
}