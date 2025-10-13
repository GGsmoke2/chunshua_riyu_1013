import { getWordAudioUrl, getExampleAudioUrl } from './crypto'
import { Capacitor } from '@capacitor/core'

/**
 * 检查音频URL是否可访问
 * @param url 音频URL
 * @returns Promise<boolean> 是否可访问
 */
async function checkAudioAccessibility(url: string): Promise<boolean> {
  // 对于所有音频URL，直接返回true，让Audio元素自己处理错误
  return true
}

// 全局音频实例管理
const activeAudioInstances = new Set<HTMLAudioElement>()
// 添加当前播放状态跟踪
let currentPlayingAudio: HTMLAudioElement | null = null
// 添加播放速度控制
let currentPlaybackRate = 1.0

/**
 * 增强的停止所有音频函数
 * 确保所有音频播放都能被正确停止，避免重叠播放
 */
export function stopAllAudio(): void {
  // 停止当前正在播放的音频
  if (currentPlayingAudio) {
    try {
      currentPlayingAudio.pause()
      currentPlayingAudio.currentTime = 0
    } catch (error) {
      // console.warn('停止当前音频时出错:', error)
    }
    currentPlayingAudio = null
  }
  
  // 停止所有页面中的音频元素
  const audioElements = document.querySelectorAll('audio')
  audioElements.forEach(audio => {
    try {
      audio.pause()
      audio.currentTime = 0
    } catch (error) {
      // console.warn('停止页面音频时出错:', error)
    }
  })
  
  // 停止管理的音频实例
  activeAudioInstances.forEach(audio => {
    try {
      audio.pause()
      audio.currentTime = 0
    } catch (error) {
      // console.warn('停止管理音频实例时出错:', error)
    }
  })
  activeAudioInstances.clear()
}

/**
 * 播放单词音频
 * @param wordAudioUrl 加密的音频URL
 * @param onPlay 播放开始回调
 * @param onEnd 播放结束回调
 * @param onError 播放错误回调
 */
export async function playWordAudio(
  wordAudioUrl: string,
  onPlay?: () => void,
  onEnd?: () => void,
  onError?: () => void
): Promise<void> {
  const audioUrl = getWordAudioUrl(wordAudioUrl)
  if (!audioUrl) {
    console.error('无法解密音频URL')
    onError?.()
    return
  }
  
  const isAccessible = await checkAudioAccessibility(audioUrl)
  if (!isAccessible) {
    console.error('音频文件不可访问:', audioUrl)
    onError?.()
    return
  }
  
  // 停止当前播放的音频
  stopAllAudio()
  
  try {
    const audio = new Audio(audioUrl)
    activeAudioInstances.add(audio)
    currentPlayingAudio = audio
    
    // 设置音频属性
    audio.preload = 'metadata'
    audio.volume = 1.0
    audio.playbackRate = currentPlaybackRate
    
    // 移动端特殊处理
    if (Capacitor.isNativePlatform()) {
      audio.preload = 'auto'
      audio.load()
      
      // 移动端事件监听
      const handleCanPlayThrough = () => {
        audio.play().then(() => {
          onPlay?.()
        }).catch(error => {
          console.error('移动端音频播放失败:', error)
          activeAudioInstances.delete(audio)
          if (currentPlayingAudio === audio) {
            currentPlayingAudio = null
          }
          onError?.()
        })
      }
      
      audio.addEventListener('canplaythrough', handleCanPlayThrough, { once: true })
      
      audio.onended = () => {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        onEnd?.()
      }
      
      audio.onerror = () => {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        console.error('移动端音频播放失败 - 文件格式不支持或服务器配置问题:', audioUrl)
        onError?.()
      }
      
    } else {
      // Web端处理
      audio.onloadstart = () => {
        // console.log('开始加载音频:', audioUrl)
      }
      
      audio.oncanplay = () => {
        // console.log('音频可以播放:', audioUrl)
      }
      
      audio.onplay = () => {
        onPlay?.()
      }
      
      audio.onended = () => {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        onEnd?.()
      }
      
      audio.onerror = (event) => {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        console.error('音频播放失败:', audioUrl, event)
        onError?.()
      }
      
      audio.onabort = () => {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        // console.log('音频播放被中止:', audioUrl)
      }
      
      // 开始播放
      try {
        await audio.play()
      } catch (error) {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        console.error('音频播放启动失败:', error)
        onError?.()
      }
    }
  } catch (error) {
    console.error('创建音频实例失败:', error)
    onError?.()
  }
}

/**
 * 播放例句音频
 * @param wordAudioUrl 加密的音频URL
 * @param exampleIndex 例句索引 (0, 1, 2)
 * @param onPlay 播放开始回调
 * @param onEnd 播放结束回调
 * @param onError 播放错误回调
 */
export async function playExampleAudio(
  wordAudioUrl: string,
  exampleIndex: number,
  onPlay?: () => void,
  onEnd?: () => void,
  onError?: () => void
): Promise<void> {
  const audioUrl = getExampleAudioUrl(wordAudioUrl, exampleIndex)
  if (!audioUrl) {
    console.error('无法解密例句音频URL')
    onError?.()
    return
  }
  
  const isAccessible = await checkAudioAccessibility(audioUrl)
  if (!isAccessible) {
    console.error('例句音频文件不可访问:', audioUrl)
    onError?.()
    return
  }
  
  // 停止当前播放的音频
  stopAllAudio()
  
  try {
    const audio = new Audio(audioUrl)
    activeAudioInstances.add(audio)
    currentPlayingAudio = audio
    
    // 设置音频属性
    audio.preload = 'metadata'
    audio.volume = 1.0
    audio.playbackRate = currentPlaybackRate
    
    // 移动端特殊处理
    if (Capacitor.isNativePlatform()) {
      audio.preload = 'auto'
      audio.load()
      
      // 移动端事件监听
      const handleCanPlayThrough = () => {
        audio.play().then(() => {
          onPlay?.()
        }).catch(error => {
          console.error('移动端例句音频播放失败:', error)
          activeAudioInstances.delete(audio)
          if (currentPlayingAudio === audio) {
            currentPlayingAudio = null
          }
          onError?.()
        })
      }
      
      audio.addEventListener('canplaythrough', handleCanPlayThrough, { once: true })
      
      audio.onended = () => {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        onEnd?.()
      }
      
      audio.onerror = () => {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        console.error('移动端例句音频播放失败:', audioUrl)
        onError?.()
      }
      
    } else {
      // Web端处理
      audio.onloadstart = () => {
        // console.log('开始加载例句音频:', audioUrl)
      }
      
      audio.oncanplay = () => {
        // console.log('例句音频可以播放:', audioUrl)
      }
      
      audio.onplay = () => {
        onPlay?.()
      }
      
      audio.onended = () => {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        onEnd?.()
      }
      
      audio.onerror = (event) => {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        console.error('例句音频播放失败:', audioUrl, event)
        onError?.()
      }
      
      audio.onabort = () => {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        // console.log('例句音频播放被中止:', audioUrl)
      }
      
      // 开始播放
      try {
        await audio.play()
      } catch (error) {
        activeAudioInstances.delete(audio)
        if (currentPlayingAudio === audio) {
          currentPlayingAudio = null
        }
        console.error('例句音频播放启动失败:', error)
        onError?.()
      }
    }
  } catch (error) {
    console.error('创建例句音频实例失败:', error)
    onError?.()
  }
}

/**
 * 获取当前播放状态
 * @returns boolean 是否有音频正在播放
 */
export function isAudioPlaying(): boolean {
  return currentPlayingAudio !== null && !currentPlayingAudio.paused
}

/**
 * 获取当前播放的音频实例
 * @returns HTMLAudioElement | null 当前播放的音频实例
 */
export function getCurrentAudio(): HTMLAudioElement | null {
  return currentPlayingAudio
}

/**
 * 设置播放速度
 * @param rate 播放速度 (0.8, 1.0, 1.2, 1.5)
 */
export function setPlaybackRate(rate: number): void {
  currentPlaybackRate = rate
  if (currentPlayingAudio) {
    currentPlayingAudio.playbackRate = rate
  }
}

/**
 * 获取当前播放速度
 * @returns number 当前播放速度
 */
export function getPlaybackRate(): number {
  return currentPlaybackRate
}

/**
 * 暂停当前播放的音频
 */
export function pauseCurrentAudio(): void {
  if (currentPlayingAudio && !currentPlayingAudio.paused) {
    try {
      currentPlayingAudio.pause()
    } catch (error) {
      // console.warn('暂停当前音频时出错:', error)
    }
  }
}

/**
 * 恢复当前暂停的音频
 */
export function resumeCurrentAudio(): void {
  if (currentPlayingAudio && currentPlayingAudio.paused) {
    try {
      currentPlayingAudio.play()
    } catch (error) {
      // console.warn('恢复当前音频时出错:', error)
    }
  }
}

/**
 * 设置音频音量
 * @param volume 音量值 (0-1)
 */
export function setAudioVolume(volume: number): void {
  const clampedVolume = Math.max(0, Math.min(1, volume))
  if (currentPlayingAudio) {
    currentPlayingAudio.volume = clampedVolume
  }
  
  // 同时设置所有活跃音频实例的音量
  activeAudioInstances.forEach(audio => {
    audio.volume = clampedVolume
  })
}

/**
 * 获取当前音频播放进度
 * @returns number 播放进度 (0-1)
 */
export function getAudioProgress(): number {
  if (!currentPlayingAudio || currentPlayingAudio.duration === 0) {
    return 0
  }
  return currentPlayingAudio.currentTime / currentPlayingAudio.duration
}

/**
 * 设置音频播放进度
 * @param progress 进度值 (0-1)
 */
export function setAudioProgress(progress: number): void {
  if (!currentPlayingAudio) {
    return
  }
  
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const newTime = clampedProgress * currentPlayingAudio.duration
  
  if (!isNaN(newTime) && isFinite(newTime)) {
    try {
      currentPlayingAudio.currentTime = newTime
    } catch (error) {
      // console.warn('设置音频进度时出错:', error)
    }
  }
}

/**
 * 清理所有音频资源
 * 在应用关闭或页面卸载时调用
 */
export function cleanupAudioResources(): void {
  stopAllAudio()
  
  // 移除所有事件监听器
  activeAudioInstances.forEach(audio => {
    try {
      audio.removeEventListener('play', () => {})
      audio.removeEventListener('pause', () => {})
      audio.removeEventListener('ended', () => {})
      audio.removeEventListener('error', () => {})
      audio.src = ''
      audio.load()
    } catch (error) {
      // console.warn('清理音频资源时出错:', error)
    }
  })
  
  activeAudioInstances.clear()
  currentPlayingAudio = null
}

// 页面卸载时自动清理资源
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupAudioResources)
  window.addEventListener('unload', cleanupAudioResources)
  
  // 页面隐藏时暂停音频
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseCurrentAudio()
    }
  })
}
