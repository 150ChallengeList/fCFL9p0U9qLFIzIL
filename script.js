const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = Math.random() * 1;
    this.opacity = 0.2;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.y > canvas.height) this.y = 0;
    if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
  }

  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < 100; i++) {
    particlesArray.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(particle => {
    particle.update();
    particle.draw();
  });
  requestAnimationFrame(animateParticles);
}

// Function to display the modal when scrolling
window.onscroll = function() {
    // Check if user has scrolled past 80% of the page height
    if (document.documentElement.scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 200) {
        document.getElementById('priceModal').style.display = "flex";
    }
};

// Function to close the modal
function closeModal() {
    document.getElementById('priceModal').style.display = "none";
}

initParticles();
animateParticles();

document.addEventListener('DOMContentLoaded', () => {
    const tiers = document.querySelectorAll('.tier');
    let currentIndex = 1; // Start with the middle tier (Standard)
  
    const updateCarousel = () => {
      tiers.forEach((tier, index) => {
        if (index === currentIndex) {
          tier.classList.add('active');
        } else {
          tier.classList.remove('active');
        }
      });
  
      // Update carousel position to center the active tier
      const carousel = document.querySelector('.tier-carousel');
      const activeTier = document.querySelector('.tier.active');
      const activeIndex = Array.from(tiers).indexOf(activeTier);
      const offset = -((activeIndex * (activeTier.offsetWidth + 20)) - (carousel.offsetWidth / 2) + (activeTier.offsetWidth / 2));
      carousel.style.transform = `translateX(${offset}px)`;
    };
  
    document.getElementById('nextArrow').addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % tiers.length;
      updateCarousel();
    });
  
    document.getElementById('prevArrow').addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + tiers.length) % tiers.length;
      updateCarousel();
    });
  
    updateCarousel(); // Initialize the carousel
  });
