# 页面动效参考与实现

更新：2026-10-08。仅本地开发。

![首页光幕、轨道光线、粒子和滚动字带](../public/docs/images/zichang-hero.png)

## 官方参考

- [React Bits Tilted Card](https://reactbits.dev/components/tilted-card)：鼠标位置映射到卡片倾斜。
- [React Bits Spotlight Card](https://reactbits.dev/components/spotlight-card)：鼠标位置驱动局部聚光。
- [React Bits Aurora](https://reactbits.dev/backgrounds/aurora)：多色流动背景；本站使用 CSS 光幕实现视觉方向。
- [React Bits Animated Content](https://reactbits.dev/animations/animated-content) 与 [Scroll Reveal](https://reactbits.dev/text-animations/scroll-reveal)：错峰入场和滚动揭示。
- [Magic UI Marquee](https://magicui.design/docs/components/marquee) 与 [Border Beam](https://magicui.design/docs/components/border-beam)：循环字带与动态边框。
- [Aceternity UI 3D Card](https://ui.aceternity.com/components/3d-card-effect) 与 [Meteors](https://ui.aceternity.com/components/meteors)：立体反馈和背景光线的补充参考。
- [Motion inView](https://motion.dev/docs/inview)：进入/离开视口的持续观察。

以上为设计与交互参考。本站使用独立编写的 React、CSS 和浏览器动画 API 实现，不加载外部素材，也未添加动画运行库。

## 页面效果

首屏包含三层流动光幕、透视移动网格、三条轨道光线、星点和鼠标追光。首屏下方增加双份无缝循环字带，悬停暂停。

目录卡片轮换使用旋入回弹、透视翻转、横向遮罩三种入场动画。上滑时反转入场方向；同批卡片错峰播放。鼠标悬停时有局部追光、彩色流动边框和最大约 6 度的倾斜。触摸设备保留滚动动画，不模拟鼠标倾斜。

## 重复滚动

旧实现第一次播放后调用 `unobserve`，导致后续往返不会触发。

当前保留两组观察器：进入视口至少 12% 时播放；完整离开视口及上下 100px 缓冲区后重新待命。缓冲区避免入场变换在边缘反复触发。同一元素正在视口内时不会因轻微滚动重新播放。离开时取消未完成动画；暂停、偏好变化、筛选变化和卸载均清理动画与监听。

内容默认可见，动画不会把离开视口的内容永久设为透明。暂停和系统减少动画设置关闭页面入场与鼠标倾斜；装饰循环也静止。

## 验证

`npm run test:ui` 覆盖 390/720/820/1024/1440px，正常及减少动画模式：首次下滑、从底部回滚、再次从顶部下滑三轮播放，方向、离开取消、鼠标偏好、暂停、视口宽度与原有工作台交互。桌面和手机截图保存在本次测试的临时目录。
