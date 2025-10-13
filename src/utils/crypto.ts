import CryptoJS from 'crypto-js'

const PREFIX = "chun"
const SUFFIX = "shua"
const KEY = "thisIsASecretKey" // 16字节
const INIT_VECTOR = "RandomInitVector" // 16字节

export function decryptUrl(encryptedBase64: string): string | null {
  try {
    // 解密 Base64
    const key = CryptoJS.enc.Utf8.parse(KEY)
    const iv = CryptoJS.enc.Utf8.parse(INIT_VECTOR)
    
    const decrypted = CryptoJS.AES.decrypt(
      encryptedBase64,
      key,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    )
    
    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8)
    
    // 检查并去除前后缀
    if (!decryptedStr.startsWith(PREFIX) || !decryptedStr.endsWith(SUFFIX)) {
      throw new Error("解密数据格式错误")
    }
    
    const url = decryptedStr.substring(
      PREFIX.length,
      decryptedStr.length - SUFFIX.length
    )
    return url.replace(/^http:\/\//, 'http://')
  } catch (e) {
    return null
  }
}

export function getExampleAudioUrl(wordAudioUrl: string, exampleIndex: number): string | null {
  const baseUrl = getWordAudioUrl(wordAudioUrl)
  if (!baseUrl) return null
  
  return baseUrl.replace(/\.mp3$/, `_${exampleIndex}.mp3`)
}

export function getVideoUrl(encryptedVideoUrl: string): string | null {
  return decryptUrl(encryptedVideoUrl)
}

export function getWordAudioUrl(wordAudioUrl: string): string | null {
  const originalUrl = decryptUrl(wordAudioUrl)
  if (!originalUrl) return null
  
  // 统一返回 https://www.co-victory.com.cn/cs_res/ 格式的路径
  // 确保所有环境下都使用相同的音频访问路径格式
  if (originalUrl.includes('co-victory.com.cn/cs_res')) {
    // 如果已经是正确格式，直接返回
    return originalUrl
  }
  
  // 如果是其他格式，需要转换为统一格式
  // 这里可能需要根据实际的URL结构进行调整
  return originalUrl
}

// 新增加密函数
export function encryptUrl(url: string): string {
  try {
    const dataToEncrypt = PREFIX + url + SUFFIX
    const key = CryptoJS.enc.Utf8.parse(KEY)
    const iv = CryptoJS.enc.Utf8.parse(INIT_VECTOR)
    
    const encrypted = CryptoJS.AES.encrypt(
      dataToEncrypt,
      key,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    )
    
    return encrypted.toString()
  } catch (e) {
    console.error('加密失败:', e)
    return ''
  }
}
