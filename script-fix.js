/**
 * 调整日期时间组件文字对比度
 * 这个函数负责根据壁纸背景调整日期时间组件的文字颜色
 */
function adjustDatetimeTextContrast() {
  // 获取日期时间组件元素
  const datetimeComponent = document.getElementById('datetime-component');
  if (!datetimeComponent) return;
  
  // 获取背景容器
  const backgroundContainer = document.querySelector('.background-container');
  if (!backgroundContainer) return;
  
  // 获取背景图片URL
  const bgImage = getComputedStyle(backgroundContainer).backgroundImage;
  const bgColor = getComputedStyle(backgroundContainer).backgroundColor;
  
  // 如果有背景图片，使用图片亮度来确定文字颜色
  if (bgImage && bgImage !== 'none' && window.textContrast) {
    // 提取图片URL
    const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (urlMatch && urlMatch[1]) {
      // 使用text-contrast.js中的函数计算图片亮度
      window.textContrast.calculateImageBrightness(urlMatch[1], function(brightness) {
        // 根据亮度确定文字颜色和阴影
        if (brightness > 0.5) { // 亮色背景
          datetimeComponent.style.color = 'rgba(0, 0, 0, 0.9)';
          datetimeComponent.style.textShadow = '0 1px 3px rgba(255, 255, 255, 0.5)';
        } else { // 暗色背景
          datetimeComponent.style.color = 'rgba(255, 255, 255, 0.9)';
          datetimeComponent.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.8)';
        }
      });
      return; // 异步计算亮度，提前返回
    }
  }
  
  // 如果没有背景图片或无法提取URL，使用背景颜色
  const isDarkBg = isColorDark(bgColor);
  datetimeComponent.style.color = isDarkBg ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
  datetimeComponent.style.textShadow = isDarkBg ? '0 1px 3px rgba(0, 0, 0, 0.8)' : '0 1px 3px rgba(255, 255, 255, 0.5)';
}