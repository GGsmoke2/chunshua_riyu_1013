import { getKana } from './kanjiReadingMap';

export interface FuriganaSegment {
  kanji: string
  reading: string
  isKanji: boolean
}

// 汉字检测正则
const kanjiRegex = /[\u4e00-\u9faf]/g
// 平假名检测正则
const hiraganaRegex = /[\u3040-\u309f]/g
// 片假名检测正则
const katakanaRegex = /[\u30a0-\u30ff]/g

/**
 * 检查字符是否为假名（平假名或片假名）
 * @param char 字符
 * @returns 是否为假名
 */
function isKana(char: string): boolean {
  return hiraganaRegex.test(char) || katakanaRegex.test(char)
}

/**
 * 为日语文本添加假名标注
 * @param text 日语文本
 * @returns 包含假名标注的HTML字符串
 */
export function addFurigana(text: string): string {
  if (!text) return ''
  
  let result = ''
  let currentIndex = 0
  
  while (currentIndex < text.length) {
    const currentChar = text[currentIndex]
    
    // 检查当前字符是否是汉字
    if (kanjiRegex.test(currentChar)) {
      // 重置正则表达式的lastIndex
      kanjiRegex.lastIndex = 0
      
      // 获取从当前位置开始的最长匹配
      const matches = getWordMatches(text, currentIndex)
      
      if (matches.length > 0) {
        // 使用最长的匹配
        const bestMatch = matches[0]
        // 检查匹配的词组是否包含假名，如果包含假名则不添加注音
        const containsKana = Array.from(bestMatch.word).some(char => isKana(char))
        
        if (containsKana) {
          // 包含假名的词组不添加注音
          result += bestMatch.word
        } else {
          // 纯汉字词组添加注音
          result += `<ruby>${bestMatch.word}<rt>${bestMatch.reading}</rt></ruby>`
        }
        currentIndex += bestMatch.length
      } else {
        // 如果没有找到匹配，直接显示汉字
        result += currentChar
        currentIndex++
      }
    } else {
      // 非汉字字符（包括假名）直接添加，不添加注音
      result += currentChar
      currentIndex++
    }
  }
  
  return result
}

/**
 * 获取所有可能的词组匹配（按长度降序排列）
 * @param text 文本
 * @param startIndex 开始位置
 * @returns 匹配的词组数组，按长度降序
 */
function getWordMatches(text: string, startIndex: number): Array<{word: string, reading: string, length: number}> {
  const matches: Array<{word: string, reading: string, length: number}> = []
  
  // 检查从当前位置开始的所有可能长度的子字符串
  for (let length = Math.min(10, text.length - startIndex); length >= 1; length--) {
    const substring = text.slice(startIndex, startIndex + length)
    
    // 使用 getKana 函数按需解密单个词条
    const reading = getKana(substring)
    
    if (reading) {
      matches.push({
        word: substring,
        reading: reading.split(',')[0], // 如果有多个读音，取第一个
        length: length
      })
    }
  }
  
  // 按长度降序排列，优先匹配较长的词组
  return matches.sort((a, b) => b.length - a.length)
}

/**
 * 解析带假名标注的文本为段落数组
 * @param text 日语文本
 * @returns FuriganaSegment数组
 */
export function parseFuriganaSegments(text: string): FuriganaSegment[] {
  if (!text) return []
  
  const segments: FuriganaSegment[] = []
  let currentIndex = 0
  
  while (currentIndex < text.length) {
    const currentChar = text[currentIndex]
    
    // 检查当前字符是否是汉字
    if (kanjiRegex.test(currentChar)) {
      // 重置正则表达式的lastIndex
      kanjiRegex.lastIndex = 0
      
      // 获取从当前位置开始的最长匹配
      const matches = getWordMatches(text, currentIndex)
      
      if (matches.length > 0) {
        // 使用最长的匹配
        const bestMatch = matches[0]
        // 检查匹配的词组是否包含假名，如果包含假名则不添加注音
        const containsKana = Array.from(bestMatch.word).some(char => isKana(char))
        
        if (containsKana) {
          // 包含假名的词组，需要分别处理汉字和假名部分
          let tempIndex = 0
          while (tempIndex < bestMatch.word.length) {
            const char = bestMatch.word[tempIndex]
            if (kanjiRegex.test(char)) {
              // 收集连续的汉字
              let kanjiPart = ''
              let kanjiStartIndex = tempIndex
              while (tempIndex < bestMatch.word.length && kanjiRegex.test(bestMatch.word[tempIndex])) {
                kanjiPart += bestMatch.word[tempIndex]
                tempIndex++
              }
              // 为汉字部分获取读音
              const kanjiReading = getKana(kanjiPart)
              segments.push({
                kanji: kanjiPart,
                reading: kanjiReading ? kanjiReading.split(',')[0] : '',
                isKanji: true
              })
            } else {
              // 收集连续的假名
              let kanaPart = ''
              while (tempIndex < bestMatch.word.length && !kanjiRegex.test(bestMatch.word[tempIndex])) {
                kanaPart += bestMatch.word[tempIndex]
                tempIndex++
              }
              segments.push({
                kanji: kanaPart,
                reading: '',
                isKanji: false
              })
            }
          }
        } else {
          // 纯汉字词组正常添加注音
          segments.push({
            kanji: bestMatch.word,
            reading: bestMatch.reading,
            isKanji: true
          })
        }
        currentIndex += bestMatch.length
      } else {
        // 如果没有找到匹配，作为单个汉字处理
        segments.push({
          kanji: currentChar,
          reading: '',
          isKanji: true
        })
        currentIndex++
      }
    } else {
      // 收集连续的非汉字字符
      let nonKanjiText = ''
      while (currentIndex < text.length && !kanjiRegex.test(text[currentIndex])) {
        nonKanjiText += text[currentIndex]
        currentIndex++
      }
      // 重置正则表达式的lastIndex
      kanjiRegex.lastIndex = 0
      
      if (nonKanjiText) {
        segments.push({
          kanji: nonKanjiText,
          reading: '',
          isKanji: false
        })
      }
    }
  }
  
  return segments
}