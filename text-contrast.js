// 文字对比度自动调整功能

/**
 * 计算图片的亮度
 * @param {string} imageUrl - 图片URL
 * @param {Function} callback - 回调函数，接收亮度值参数
 */
function calculateImageBrightness(imageUrl, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = imageUrl;
  
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    
    ctx.drawImage(img, 0, 0);
    
    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let brightness = 0;
    
    // 计算平均亮度
    for (let i = 0; i < data.length; i += 4) {
      // 使用相对亮度公式: 0.299*R + 0.587*G + 0.114*B
      brightness += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    }
    
    brightness = brightness / (data.length / 4) / 255; // 归一化到0-1范围
    callback(brightness);
  };
  
  img.onerror = function() {
    console.error('无法加载图片进行亮度分析');
    callback(0.5); // 默认中等亮度
  };
}

/**
 * 根据背景亮度调整文字颜色和阴影
 * @param {number} brightness - 背景亮度值(0-1)
 */
function adjustTextContrast(brightness) {
  const textElements = {
    searchBox: document.querySelector('.search-box'),
    searchIcon: document.querySelector('.search-icon'),
    settingsButton: document.querySelector('.settings-button i'),
    searchEngineSpans: document.querySelectorAll('.search-engine span'),
    datetimeComponent: document.getElementById('datetime-component')
  };
  
  // 亮度阈值
  const BRIGHTNESS_THRESHOLD = 0.5;
  
  if (brightness > BRIGHTNESS_THRESHOLD) {
    // 深色背景上的文字样式
    document.documentElement.style.setProperty('--text-color', 'rgba(0, 0, 0, 0.9)');
    document.documentElement.style.setProperty('--text-shadow', '0 1px 3px rgba(255, 255, 255, 0.5)');
    
    // 应用到搜索框
    if (textElements.searchBox) {
      textElements.searchBox.style.color = '#000';
      textElements.searchBox.style.textShadow = '0 1px 3px rgba(255, 255, 255, 0.5)';
    }
    
    // 应用到搜索图标
    if (textElements.searchIcon) {
      textElements.searchIcon.style.color = 'rgba(0, 0, 0, 0.8)';
    }
    
    // 应用到设置按钮
    if (textElements.settingsButton) {
      textElements.settingsButton.style.color = '#000';
    }
    
    // 应用到搜索引擎文字
    textElements.searchEngineSpans.forEach(span => {
      span.style.color = 'rgba(0, 0, 0, 0.9)';
      span.style.textShadow = '0 1px 2px rgba(255, 255, 255, 0.5)';
    });
    
    // 应用到日期时间组件
    if (textElements.datetimeComponent) {
      // 检查是否启用了自动调整
      chrome.storage.sync.get(['datetimeComponent'], function(result) {
        if (result.datetimeComponent && 
            result.datetimeComponent.style && 
            result.datetimeComponent.style.autoAdjust !== false) {
          textElements.datetimeComponent.style.color = 'rgba(0, 0, 0, 0.9)';
          textElements.datetimeComponent.style.textShadow = '0 1px 3px rgba(255, 255, 255, 0.5)';
        }
      });
    }
  } else {
    // 浅色背景上的文字样式
    document.documentElement.style.setProperty('--text-color', 'rgba(255, 255, 255, 0.9)');
    document.documentElement.style.setProperty('--text-shadow', '0 1px 3px rgba(0, 0, 0, 0.8)');
    
    // 应用到搜索框
    if (textElements.searchBox) {
      textElements.searchBox.style.color = '#fff';
      textElements.searchBox.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.8)';
    }
    
    // 应用到搜索图标
    if (textElements.searchIcon) {
      textElements.searchIcon.style.color = 'rgba(255, 255, 255, 0.8)';
    }
    
    // 应用到设置按钮
    if (textElements.settingsButton) {
      textElements.settingsButton.style.color = 'white';
    }
    
    // 应用到搜索引擎文字
    textElements.searchEngineSpans.forEach(span => {
      span.style.color = 'rgba(255, 255, 255, 0.9)';
      span.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.7)';
    });
    
    // 应用到日期时间组件
    if (textElements.datetimeComponent) {
      // 检查是否启用了自动调整
      chrome.storage.sync.get(['datetimeComponent'], function(result) {
        if (result.datetimeComponent && 
            result.datetimeComponent.style && 
            result.datetimeComponent.style.autoAdjust !== false) {
          textElements.datetimeComponent.style.color = 'rgba(255, 255, 255, 0.9)';
          textElements.datetimeComponent.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.8)';
        }
      });
    }
  }
}

// 导出函数供其他模块使用
window.textContrast = {
  calculateImageBrightness,
  adjustTextContrast
};