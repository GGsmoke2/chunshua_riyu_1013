const API_BASE_URL = 'https://www.dlmy.tech/chunshua-api/'
// const API_BASE_URL = 'http://localhost:9091/'


export const API_ENDPOINTS = {
  vocabulary: {
    wordCards: `${API_BASE_URL}chunshua_questions/vocabulary/wordCards`
  },
  grammar: {
    grammarCards: `${API_BASE_URL}chunshua_questions/grammar/grammerCards`
  },
  practice: {
    questions: {
      getDanCiIndTi: `${API_BASE_URL}chunshua_questions/questions/getDanCiIndTi`,
      getYuFaIndTi: `${API_BASE_URL}chunshua_questions/questions/getYuFaIndTi`,
      getYueDuComTi: `${API_BASE_URL}chunshua_questions/questions/getYueDuComTi`,
      getTiLiIndTi: `${API_BASE_URL}chunshua_questions/questions/getTiLiIndTi`,
      getTiLiComTi: `${API_BASE_URL}chunshua_questions/questions/getTiLiComTi`
    }
  },
  user: {
    changePassword: `${API_BASE_URL}chunshua_users/info/changePassword`,
    loginIn: `${API_BASE_URL}chunshua_users/info/chunshuaLogin`,
    chunshuaRegisterIn: `${API_BASE_URL}chunshua_users/info/chunshuaRegister`,
    redeemCodePC: `${API_BASE_URL}chunshua_users/info/redeemCodePC`,
    logOff: `${API_BASE_URL}chunshua_users/info/chunshuaLogOff`,
    eventTracking: `${API_BASE_URL}chunshua_event_tracking/tracking/chunshuaEventTracking`
  },
  favorite:{
    // 收藏题目练习相关API
    getFavoriteQuestionsForPractice: `${API_BASE_URL}chunshua_favorite/favorite_questions/getFavoriteQuestionsForPractice`,
    addToFavorites: `${API_BASE_URL}chunshua_favorite/favorite_questions/addToFavorites`,
    removeFromFavorites: `${API_BASE_URL}chunshua_favorite/favorite_questions/removeFromFavorites`,
    checkFavoriteStatus: `${API_BASE_URL}chunshua_favorite/favorite_questions/checkFavoriteStatus`,
    // 收藏单词相关API
    addWordToFavorites: `${API_BASE_URL}chunshua_favorite/favorite_vocabulary_with_question_bank/addWordToFavorites`,
    removeWordFromFavorites: `${API_BASE_URL}chunshua_favorite/favorite_vocabulary_with_question_bank/removeWordFromFavorites`,
    checkWordFavoriteStatus: `${API_BASE_URL}chunshua_favorite/favorite_vocabulary_with_question_bank/checkWordFavoriteStatus`,
    getFavoriteWords: `${API_BASE_URL}chunshua_favorite/favorite_vocabulary_with_question_bank/getFavoriteWords`,
    updateWordMasteryStatus: `${API_BASE_URL}chunshua_favorite/favorite_vocabulary_with_question_bank/updateWordMasteryStatus`,
    getFavoriteWordsWithFilter: `${API_BASE_URL}chunshua_favorite/favorite_vocabulary_with_question_bank/getFavoriteWordsWithFilter`
  },
  wrong: {
    // 错题练习相关API
    getWrongQuestionsForPractice: `${API_BASE_URL}chunshuawrong_question/wrong_question/getWrongQuestionsForPractice`,
    addToWrongQuestions: `${API_BASE_URL}chunshuawrong_question/wrong_question/addToWrongQuestions`,
    removeFromWrongQuestions: `${API_BASE_URL}chunshuawrong_question/wrong_question/removeFromWrongQuestions`,
    checkWrongStatus: `${API_BASE_URL}chunshuawrong_question/wrong_question/checkWrongStatus`,
    updateCorrectCount: `${API_BASE_URL}chunshuawrong_question/wrong_question/updateCorrectCount`,
    recordWrongAnswer: `${API_BASE_URL}chunshuawrong_question/wrong_question/recordWrongAnswer`
  }
}