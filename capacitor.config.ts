import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tech.dlmy.chunshuariyu',
  appName: '纯刷日语',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'DARK_CONTENT',
      backgroundColor: '#FFFFFF',
      overlaysWebView: false
    },
    SplashScreen: {
      launchShowDuration: 0, // 禁用默认启动屏幕
      backgroundColor: "#4A90E2",
      showSpinner: false,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: false
    },
    // 添加微信插件配置
    Wechat: {
      appId: 'ww28faf75ca942eab8', // 替换为你的微信AppID
      universalLink: 'https://your-domain.com/wechat/', // iOS通用链接
      enableMTA: false
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
