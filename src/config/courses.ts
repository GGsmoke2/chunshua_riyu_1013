interface Course {
  id: string
  title: string
  level: string
  type: string
  image: string
  lessons: number
  duration: string
  rating: number
  students: number
  price: number
  tag?: 'popular' | 'new'
  description: string
}

export const courses: Course[] = [
  {
    id: 'n3-grammar',
    title: 'JLPT N3 语法考点精讲课',
    level: 'N3',
    type: '语法',
    image: 'https://www.co-victory.com.cn/cs_res/csry_web/n3yfk.png',
    lessons: 30,
    duration: '15小时',
    rating: 5.0,
    students: 139,
    price: 59,
    tag: 'popular',
    description: '15小时视频课、名师答疑、针对N3考级 语法提分订制学习内容'
  },
  {
    id: 'n1-jlpt',
    title: 'JLPT N1真题讲解 备战N1考级必学课',
    level: 'N1',
    type: 'JLPT',
    image: 'https://www.co-victory.com.cn/cs_res/csry_web/n1ztk.png',
    lessons: 60,
    duration: '30',
    rating: 4.9,
    students: 257,
    price: 2300,
    description: '3~5人小班直播课、总结历年考点订制学习内容 只为提分'
  },
  {
     id: 'n2-jlpt',
    title: '历年JLPTN2真题讲解备战N2考试必学课',
    level: 'N2',
    type: 'JLPT',
    image: 'https://www.co-victory.com.cn/cs_res/csry_web/n2ztk.png',
    lessons: 60,
    duration: '30',
    rating: 4.9,
    students: 468,
    price: 1800,
    description: '3~5人小班直播课、总结历年考点订制学习内容 只为提分'
  },
  {
    id: 'n3-jlpt',
    title: '历年JLPTN3真题讲解备战N3考试必学课',
    level: 'N3',
    type: 'JLPT',
    image: 'https://www.co-victory.com.cn/cs_res/csry_web/n3ztk.png',
    lessons: 60,
    duration: '30',
    rating: 4.9,
    students: 526,
    price: 1500,
    description: '3~5人小班直播课、总结历年考点订制学习内容 只为提分'
  },
  {
    id: 'dz-jlpt',
    title: 'JLPT考前抢分1对1直播课',
    level: 'JLPT',
    type: 'JLPT',
    image: 'https://www.co-victory.com.cn/cs_res/csry_web/1v1zbk.png',
    lessons: 1,
    duration: '2',
    rating: 4.9,
    students: 16,
    price: 150,
    tag: 'new',
    description: '1对1直播课 针对薄弱处订制学习内容 只为过级'
  }
]