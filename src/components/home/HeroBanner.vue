<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvas = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}

const particles: Particle[] = []

const initParticles = (canvasEl: HTMLCanvasElement) => {
  const particleCount = window.innerWidth < 768 ? 30 : 50
  particles.length = 0

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvasEl.width,
      y: Math.random() * canvasEl.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.3
    })
  }
}

const animateParticles = (canvasEl: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

  particles.forEach((particle, i) => {
    particle.x += particle.speedX
    particle.y += particle.speedY

    if (particle.x < 0 || particle.x > canvasEl.width) particle.speedX *= -1
    if (particle.y < 0 || particle.y > canvasEl.height) particle.speedY *= -1

    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`
    ctx.fill()

    ctx.shadowBlur = 10
    ctx.shadowColor = 'rgba(0, 212, 255, 0.5)'

    particles.forEach((particle2, j) => {
      if (i !== j) {
        const dx = particle.x - particle2.x
        const dy = particle.y - particle2.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 150) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 * (1 - distance / 150)})`
          ctx.lineWidth = 0.5
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(particle2.x, particle2.y)
          ctx.stroke()
        }
      }
    })
  })

  animationId = requestAnimationFrame(() => animateParticles(canvasEl, ctx))
}

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight < 650 ? 650 : window.innerHeight

    const ctx = canvas.value.getContext('2d')
    if (ctx) {
      initParticles(canvas.value)
      animateParticles(canvas.value, ctx)
    }

    const handleResize = () => {
      if (canvas.value) {
        canvas.value.width = window.innerWidth
        canvas.value.height = window.innerHeight < 650 ? 650 : window.innerHeight
        initParticles(canvas.value)
      }
    }

    window.addEventListener('resize', handleResize)

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    })
  }
})

const goToVocabulary = () => router.push('/vocabulary')
const goToPractice = () => router.push('/practice')
const goToGrammar = () => router.push('/grammar')
</script>

<template>
  <div class="hero-banner">
    <canvas ref="canvas" class="particle-canvas"></canvas>

    <div class="grid-overlay"></div>

    <div class="hero-content">
      <div class="container">
        <h1 class="hero-title animate-fadeInDown">
          <span class="title-line">帮你轻松过级的</span>
          <span class="title-highlight neon-text">纯刷题式日语工具</span>
        </h1>

        <div class="hero-tags animate-fadeInUp animate-delay-2">
          <div class="tech-tag" data-index="0">
            <span>刷题锁考点</span>
          </div>
          <div class="tech-tag" data-index="1">
            <span>单词复现记</span>
          </div>
          <div class="tech-tag" data-index="2">
            <span>错题复盘补坑</span>
          </div>
        </div>

        <div class="hero-description animate-fadeInUp animate-delay-3">
          <p class="desc-main">帮你扎牢日语基础、突破考级难点 —— 不用死磕大段时间，持续练就能记牢知识点，轻松过考</p>
          <p class="desc-sub">最重要的是靠<span class="highlight">「碎片化时间」</span>灵活学 —— 课间、排队、等车时随时刷题背词，让日语考级再也不是难题！</p>
        </div>

        <div class="hero-actions animate-fadeInUp animate-delay-4">
          <div class="feature-card" @click="goToVocabulary">
            <div class="card-glow"></div>
            <div class="card-icon">
              <i class="ri-book-open-line"></i>
            </div>
            <div class="card-content">
              <h3 class="card-title">
                <span class="title-ja">単語</span>
                <span class="title-cn">词汇</span>
              </h3>
              <p class="card-desc">两万个词汇 六万个例句</p>
            </div>
            <div class="card-arrow">
              <i class="ri-arrow-right-line"></i>
            </div>
          </div>

          <div class="feature-card" @click="goToPractice">
            <div class="card-glow"></div>
            <div class="card-icon">
              <i class="ri-edit-box-line"></i>
            </div>
            <div class="card-content">
              <h3 class="card-title">
                <span class="title-ja">試題練習</span>
                <span class="title-cn">刷题</span>
              </h3>
              <p class="card-desc">N5到N1万道真题模拟题</p>
            </div>
            <div class="card-arrow">
              <i class="ri-arrow-right-line"></i>
            </div>
          </div>

          <div class="feature-card" @click="goToGrammar">
            <div class="card-glow"></div>
            <div class="card-icon">
              <i class="ri-file-text-line"></i>
            </div>
            <div class="card-content">
              <h3 class="card-title">
                <span class="title-ja">文法</span>
                <span class="title-cn">语法</span>
              </h3>
              <p class="card-desc">千条语法 从初级到高级</p>
            </div>
            <div class="card-arrow">
              <i class="ri-arrow-right-line"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hero-banner {
  position: relative;
  min-height: 100vh;
  max-height: 1000px;
  overflow: hidden;
  background: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    min-height: 100vh;
    max-height: none;
  }
}

.particle-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background-image:
    linear-gradient(var(--color-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 3;
  padding: var(--spacing-xxxl) var(--spacing-lg);
  width: 100%;

  @media (max-width: 768px) {
    padding: var(--spacing-xxl) var(--spacing-md);
  }
}

.hero-title {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: center;

  .title-line {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 600;
    color: var(--color-text-secondary);
    letter-spacing: 0.02em;
  }

  .title-highlight {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    letter-spacing: 0.02em;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 4px;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
      box-shadow: var(--glow-md);
    }
  }
}

.hero-tags {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: var(--spacing-sm);
  }
}

.tech-tag {
  position: relative;
  padding: 12px 28px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-smooth);
  cursor: default;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.2), transparent);
    transition: left 0.6s var(--ease-smooth);
  }

  &:hover {
    transform: translateY(-2px);
    border-color: var(--color-neon-blue);
    box-shadow: var(--glow-md);

    &::before {
      left: 100%;
    }
  }

  span {
    position: relative;
    z-index: 1;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  @media (max-width: 768px) {
    padding: 10px 22px;

    span {
      font-size: 0.9rem;
    }
  }
}

.hero-description {
  max-width: 900px;
  margin: 0 auto var(--spacing-xxxl);
  text-align: center;

  p {
    line-height: 1.8;
    margin: var(--spacing-md) 0;
  }

  .desc-main {
    font-size: clamp(1.1rem, 2.5vw, 1.3rem);
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .desc-sub {
    font-size: clamp(1rem, 2vw, 1.15rem);
    color: var(--color-text-secondary);

    .highlight {
      color: var(--color-neon-cyan);
      font-weight: 700;
      text-shadow: var(--glow-sm);
    }
  }
}

.hero-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

.feature-card {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-smooth);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.05), transparent);
    transition: left var(--duration-slow) var(--ease-smooth);
  }

  &:hover {
    transform: translateY(-12px);
    border-color: var(--color-neon-blue);
    box-shadow: var(--shadow-xl), var(--glow-lg);

    &::before {
      left: 100%;
    }

    .card-glow {
      opacity: 1;
    }

    .card-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .card-arrow {
      transform: translateX(5px);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    flex-direction: row;
    text-align: left;
    padding: var(--spacing-lg);
  }
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-smooth);
  pointer-events: none;
}

.card-icon {
  width: 70px;
  height: 70px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
  box-shadow: var(--glow-md);
  transition: all var(--duration-normal) var(--ease-smooth);

  i {
    font-size: 2rem;
    color: white;
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    margin-bottom: 0;
    margin-right: var(--spacing-md);
    flex-shrink: 0;

    i {
      font-size: 1.75rem;
    }
  }
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--color-text-primary);

  .title-ja {
    font-size: 1.5rem;
    letter-spacing: 0.05em;
  }

  .title-cn {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;

    .title-ja {
      font-size: 1.25rem;
    }

    .title-cn {
      font-size: 1rem;
    }
  }
}

.card-desc {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
}

.card-arrow {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  font-size: 1.5rem;
  color: var(--color-neon-blue);
  opacity: 0;
  transition: all var(--duration-normal) var(--ease-smooth);

  @media (max-width: 768px) {
    position: static;
    opacity: 0.5;
    margin-left: var(--spacing-sm);
  }
}
</style>
