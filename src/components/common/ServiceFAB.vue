<template>
  <div class="service-fab-container">
    <!-- 讲课模式FAB按钮 -->
    <div v-if="isTeacher" :class="['drawing-fab', { 'expanded': isDrawingExpanded }]">
      <div class="fab-menu drawing-menu">
        <button class="fab-item" @click="takeScreenshot" title="截图">
          <i class="ri-camera-line"></i>
        </button>
        <button class="fab-item" @click="showDrawingMode" title="讲课模式">
          <i class="ri-pencil-line"></i>
        </button>
        <button class="fab-item" @click="showHelp" title="帮忙">
          <i class="ri-question-line"></i>
        </button>
      </div>
      
      <button class="fab-main drawing-main" @click="toggleDrawingExpand" title="讲课模式">
        <i class="ri-brush-line" v-if="!isDrawingExpanded"></i>
        <i class="ri-close-line" v-else></i>
      </button>
    </div>

    <!-- 客服中心FAB按钮 -->
    <div :class="['service-fab', { 'expanded': isExpanded }]">
      <button class="fab-main" @click="toggleExpand" title="客服中心">
        <i class="ri-customer-service-2-line" v-if="!isExpanded"></i>
        <i class="ri-close-line" v-else></i>
      </button>
      
      <div class="fab-menu">
        <button class="fab-item" @click="showQRCode = true" title="微信咨询">
          <i class="ri-wechat-line"></i>
        </button>
      </div>
    </div>
    
    <!-- 微信咨询弹窗 -->
    <CustomerServiceDialog
      v-model:visible="showQRCode"
      title="咨询客服"
      qr-description="扫描二维码添加客服微信"
      mobile-description=""
      dialog-class="qr-code-dialog"
    />
    
    <!-- FAQ Modal -->
    <div class="fab-modal faq" v-if="showFAQ">
      <div class="modal-content">
        <h3>常见问题</h3>
        <div class="faq-item" v-for="(item, index) in 3" :key="index">
          <div class="faq-question">如何准备JLPT考试？</div>
          <div class="faq-answer">我们提供针对JLPT各级别的专业备考课程，包括词汇、语法、听力和阅读等全方位训练。建议您根据自己的水平选择合适的课程进行系统学习。</div>
        </div>
        <button class="btn btn-primary">查看更多问题</button>
      </div>
    </div>
    
    <!-- Contact Form Modal -->
    <div class="fab-modal contact-form" v-if="showContactForm">
      <div class="modal-content">
        <h3>意见反馈</h3>
        <form>
          <div class="form-group">
            <label for="name">姓名</label>
            <input type="text" id="name" placeholder="请输入您的姓名">
          </div>
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" placeholder="请输入您的邮箱">
          </div>
          <div class="form-group">
            <label for="message">反馈内容</label>
            <textarea id="message" placeholder="请输入您的反馈内容"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">提交反馈</button>
        </form>
      </div>
    </div>
    
    <!-- 讲课模式帮助弹窗 -->
    <div v-if="showDrawingHelp" class="modal-backdrop" @click="showDrawingHelp = false"></div>
    <div class="fab-modal drawing-help" v-if="showDrawingHelp">
      <div class="modal-content">
        <div class="modal-header">
          <h3>讲课模式快捷键</h3>
          <button class="close-btn" @click="showDrawingHelp = false">
            <i class="ri-close-line"></i>
          </button>
        </div>
        <div class="help-content">
          <div class="help-section">
            <h4>工具切换</h4>
            <div class="shortcut-item">
              <span class="key">B</span>
              <span class="desc">画笔工具</span>
            </div>
            <div class="shortcut-item">
              <span class="key">E</span>
              <span class="desc">橡皮擦工具</span>
            </div>
            <div class="shortcut-item">
              <span class="key">T</span>
              <span class="desc">文本工具</span>
            </div>
            <div class="shortcut-item">
              <span class="key">L</span>
              <span class="desc">直线工具</span>
            </div>
            <div class="shortcut-item">
              <span class="key">R</span>
              <span class="desc">矩形工具</span>
            </div>
            <div class="shortcut-item">
              <span class="key">C</span>
              <span class="desc">圆形工具</span>
            </div>
          </div>
          
          <div class="help-section">
            <h4>操作快捷键</h4>
            <div class="shortcut-item">
              <span class="key">Ctrl + Z</span>
              <span class="desc">撤销</span>
            </div>
            <div class="shortcut-item">
              <span class="key">Ctrl + Y</span>
              <span class="desc">重做</span>
            </div>
            <div class="shortcut-item">
              <span class="key">Ctrl + D</span>
              <span class="desc">清空画布</span>
            </div>
            <div class="shortcut-item">
              <span class="key">H</span>
              <span class="desc">显示帮助</span>
            </div>
            <div class="shortcut-item">
              <span class="key">ESC</span>
              <span class="desc">退出讲课模式</span>
            </div>
          </div>
          
          <div class="help-section">
            <h4>文本工具</h4>
            <div class="shortcut-item">
              <span class="key">Enter</span>
              <span class="desc">确认文本输入</span>
            </div>
            <div class="shortcut-item">
              <span class="key">Shift + Enter</span>
              <span class="desc">换行</span>
            </div>
            <div class="shortcut-item">
              <span class="key">ESC</span>
              <span class="desc">取消文本输入</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 绘画组件 -->
    <!-- 移除重复的 DrawingFAB 组件 -->
    <!-- <DrawingFAB v-if="showDrawingFAB" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { ElMessage } from 'element-plus';
import CustomerServiceDialog from './CustomerServiceDialog.vue';
// 移除这行导入
// import DrawingFAB from './DrawingFAB.vue';

const route = useRoute();
const authStore = useAuthStore();

const isExpanded = ref(false);
const isDrawingExpanded = ref(false);
const showQRCode = ref(false);
const showFAQ = ref(false);
const showContactForm = ref(false);
// 移除这个变量
// const showDrawingFAB = ref(false);
const showDrawingHelp = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const toggleDrawingExpand = () => {
  isDrawingExpanded.value = !isDrawingExpanded.value;
};

const takeScreenshot = async () => {
  try {
    // 保存当前滚动位置和页面状态
    const currentScrollX = window.scrollX
    const currentScrollY = window.scrollY
    const currentUrl = window.location.href
    
    // 隐藏所有FAB按钮
    const serviceFab = document.querySelector('.service-fab-container') as HTMLElement;
    const originalDisplay = serviceFab?.style.display;
    if (serviceFab) {
      serviceFab.style.display = 'none';
    }
    
    // 隐藏绘图工具栏
    const drawingToolbar = document.querySelector('.drawing-toolbar') as HTMLElement;
    const originalToolbarDisplay = drawingToolbar?.style.display;
    if (drawingToolbar) {
      drawingToolbar.style.display = 'none';
    }
    
    // 隐藏主导航栏
    const mainHeader = document.querySelector('.main-header') as HTMLElement;
    const originalHeaderDisplay = mainHeader?.style.display;
    if (mainHeader) {
      mainHeader.style.display = 'none';
    }
    
    // 隐藏移动端菜单（如果打开）
    const mobileMenu = document.querySelector('.mobile-menu') as HTMLElement;
    const originalMobileMenuDisplay = mobileMenu?.style.display;
    if (mobileMenu) {
      mobileMenu.style.display = 'none';
    }
    
    // 等待一小段时间确保元素隐藏
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 动态导入html2canvas
    const html2canvas = await import('html2canvas');
    // 只截取当前可视区域
    const canvas = await html2canvas.default(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: 0, // 从视口左上角开始
      scrollY: 0, // 从视口左上角开始
      x: currentScrollX, // 当前滚动位置作为截图起始点
      y: currentScrollY, // 当前滚动位置作为截图起始点
      backgroundColor: '#ffffff',
      foreignObjectRendering: false,
      logging: false
    });
    
    // 恢复隐藏的元素
    if (serviceFab && originalDisplay !== undefined) {
      serviceFab.style.display = originalDisplay;
    }
    if (drawingToolbar && originalToolbarDisplay !== undefined) {
      drawingToolbar.style.display = originalToolbarDisplay;
    }
    if (mainHeader && originalHeaderDisplay !== undefined) {
      mainHeader.style.display = originalHeaderDisplay;
    }
    if (mobileMenu && originalMobileMenuDisplay !== undefined) {
      mobileMenu.style.display = originalMobileMenuDisplay;
    }
    
    // 确保页面状态没有改变
    if (window.location.href !== currentUrl) {
      console.warn('页面URL在截图过程中发生了变化');
    }
    
    // 下载截图
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `screenshot_${new Date().getTime()}.png`;
    link.click();
    
    ElMessage({
      message: '截图已保存',
      type: 'success',
      duration: 2000
    });
  } catch (error) {
    console.error('截图失败:', error);
    ElMessage({
      message: '截图失败，请重试',
      type: 'error',
      duration: 2000
    });
  }
};

const showDrawingMode = () => {
  // 移除 showDrawingFAB.value = true;
  // 直接触发 DrawingFAB 中的讲课模式
  window.dispatchEvent(new CustomEvent('toggle-drawing-mode'));
};

const showHelp = () => {
  console.log('显示讲课模式帮助');
  showDrawingHelp.value = true;
};

// 老师模式检测逻辑
const isTeacher = computed(() => {
  const isTeacherQuery = route.query.teacher === 'true';
  const isTeacherRole = authStore.userInfo?.userRole === 1;
  const isTeacherModeLocalStorage = localStorage.getItem('teacherMode') === 'true';
  return isTeacherQuery || isTeacherRole || isTeacherModeLocalStorage;
});
</script>

<style lang="scss" scoped>
.service-fab-container {
  position: relative;
  z-index: 1000;
}

// 讲课模式FAB样式
.drawing-fab {
  position: fixed;
  right: 30px;
  bottom: calc(20vh + 85px); // 使用视口高度单位，确保相对间距
  display: none; // 手机端默认隐藏
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1001;
  
  // 桌面端显示
  @media (min-width: 768px) {
    display: flex;
  }
  
  // 响应式调整
  @media (max-height: 600px) {
    bottom: calc(25vh + 100px); // 小屏幕时调整间距
  }
  
  @media (max-height: 400px) {
    bottom: calc(30vh + 80px); // 极小屏幕时进一步调整
  }
}

// 客服中心
.service-fab {
  position: fixed;
  right: 30px;
  bottom: 15vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  
  // iPad特殊处理 - 避免与头部工具栏重叠
  @media (min-width: 768px) and (max-width: 1024px) {
    bottom: 12vh;
    right: 25px;
  }
  
  // iPad Mini横屏特殊处理
  @media (width: 768px) and (height: 1024px) {
    bottom: 10vh;
    right: 20px;
  }
  
  // 响应式调整
  @media (max-height: 600px) {
    bottom: 10vh; // 从12vh调整为10vh
  }
  
  @media (max-height: 400px) {
    bottom: 8vh; // 从10vh调整为8vh
  }
}

// 确保在所有移动设备上都能正确显示
@media (max-width: 768px) {
  .service-fab {
    right: 20px;
    bottom: 8vh;
    display: flex !important; // 强制显示
    
    .fab-main {
      width: 56px;
      height: 56px;
      font-size: 1.4rem;
    }
  }
  
  // 模态框在移动端的优化
  .fab-modal {
    right: 50%;
    bottom: 50%;
    transform: translate(50%, 50%);
    width: calc(100vw - 40px);
    max-width: 320px;
  }
}

// 针对小屏幕手机的特殊优化
@media (max-width: 480px) {
  .service-fab {
    right: 15px;
    bottom: 6vh;
    
    .fab-main {
      width: 52px;
      height: 52px;
      font-size: 1.3rem;
    }
  }
}
.drawing-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px); // 向上弹出，从下方移入
  transition: all var(--transition-normal);
  order: -1; // 确保菜单在按钮上方
}

.drawing-fab.expanded {
  .drawing-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .drawing-main {
    background-color: #e55a2b;
  }
}

.fab-main {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    background-color: var(--primary-dark);
    transform: scale(1.05);
  }
}

.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-20px); // 向下弹出，从上方移入
  transition: all var(--transition-normal);
}

.fab-item {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-md);
  }
  
  &:nth-child(1) {
    transition-delay: 0.1s;
  }
  
  &:nth-child(2) {
    transition-delay: 0.2s;
  }
  
  &:nth-child(3) {
    transition-delay: 0.3s;
  }
  
  &:nth-child(4) {
    transition-delay: 0.4s;
  }
}

// 讲课模式FAB的子按钮样式
.drawing-fab .fab-item {
  color: #ff6b35;
  border-color: #ff6b35;
}

.expanded {
  .fab-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .fab-main {
    background-color: var(--accent-color);
  }
}

.fab-modal {
  position: fixed;
  right: 90px;
  bottom: 20%;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  width: 300px;
  max-width: calc(100vw - 120px);
  animation: slideInUp var(--transition-normal);
  z-index: 999;
  transform: translateY(-50%);
  max-height: 80vh;
  overflow-y: auto;
  
  @media (max-width: 767px) {
    right: 50%;
    bottom: 50%;
    transform: translate(50%, 50%) !important;
    left: auto !important;
    top: auto !important;
    transition: opacity 0.3s ease, visibility 0.3s ease !important;
  }
  
  .modal-content {
    padding: var(--spacing-lg);
    
    h3 {
      margin-bottom: var(--spacing-md);
      color: var(--primary-color);
    }
  }
  
  &.qr-code {
    text-align: center;
    
    .qr-image {
      width: 180px;
      height: 180px;
      margin: 10px auto;
    }
  }
  
  &.faq {
    .faq-item {
      margin-bottom: var(--spacing-md);
      
      .faq-question {
        font-weight: 500;
        margin-bottom: var(--spacing-xs);
      }
      
      .faq-answer {
        color: var(--text-light);
        font-size: 0.95rem;
      }
    }
    
    button {
      margin-top: var(--spacing-sm);
      width: 100%;
    }
  }
  
  &.contact-form {
    .form-group {
      margin-bottom: var(--spacing-md);
      
      label {
        display: block;
        margin-bottom: var(--spacing-xs);
        font-size: 0.9rem;
        color: var(--text-light);
      }
      
      input, textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-family: inherit;
        resize: none;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }
    }
    
    button {
      width: 100%;
    }
  }
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  animation: fadeIn var(--transition-normal);
}
// 讲课模式帮助弹窗样式 - 使用更高优先级的选择器
.fab-modal.drawing-help {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  width: 90vw;
  max-width: 700px !important;
  max-height: 98vh !important;
  overflow-y: auto;
  z-index: 1001;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md);
    border-bottom: 1px solid #eee;
    
    h3 {
      margin: 0;
      color: var(--primary-color);
      font-size: 1.3rem; // 从 1.2rem 增加到 1.3rem
    }
    
    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f5f5f5;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background: #ff4757;
        color: white;
      }
    }
  }
  
  .help-content {
    padding: var(--spacing-lg);
    min-height: 85vh; // 从 80vh 增加到 85vh，确保内容区域有足够高度
  }
  
  .help-section {
    margin-bottom: var(--spacing-lg);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h4 {
      margin: 0 0 var(--spacing-md) 0;
      color: #333;
      font-size: 1.1rem; // 从 1rem 增加到 1.1rem
      font-weight: 600;
    }
  }
  
  .shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .key {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 6px 10px; // 从 4px 8px 增加到 6px 10px
      font-family: 'Courier New', monospace;
      font-size: 0.9rem; // 从 0.85rem 增加到 0.9rem
      font-weight: 600;
      color: #495057;
      min-width: 70px; // 从 60px 增加到 70px
      text-align: center;
    }
    
    .desc {
      color: #666;
      font-size: 0.95rem; // 从 0.9rem 增加到 0.95rem
    }
  }
}

// 添加更具体的移动端覆盖样式
@media (max-width: 768px) {
  // 使用更高优先级的选择器来覆盖全局移动端样式
  .modal-backdrop + .fab-modal.drawing-help,
  body .fab-modal.drawing-help {
    width: 95vw !important;
    max-width: 700px !important;
    max-height: 98vh !important;
    margin: 0 !important;
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }
}

// 如果上面的方法还不行，可以尝试这个更强力的方法
@media (max-width: 768px) {
  .fab-modal.drawing-help {
    width: 95vw !important;
    max-width: 700px !important;
    max-height: 98vh !important;
    
    // 确保覆盖所有可能的样式
    &.fab-modal {
      max-width: 700px !important;
      max-height: 98vh !important;
    }
  }
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: fadeIn var(--transition-normal);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>


