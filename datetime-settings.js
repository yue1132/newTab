/**
 * 日期时间组件设置处理
 * 负责处理日期时间组件的所有设置和样式更新
 */

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
  // 设置日期时间组件的样式控制
  setupDatetimeStyleControls();
  // 设置日期时间组件的显示控制
  setupDatetimeDisplayControls();
});

// 设置日期时间样式控制
function setupDatetimeStyleControls() {
  // 合并日期时间格式控制
  const datetimeFormatInput = document.getElementById('datetimeFormatInput');
  if (datetimeFormatInput) {
    // 从状态中获取当前值
    chrome.storage.sync.get(['datetimeComponent'], function(result) {
      if (result.datetimeComponent && result.datetimeComponent.style) {
        datetimeFormatInput.value = result.datetimeComponent.style.datetimeFormat || 'YYYY-MM-DD HH:mm:ss';
      }
    });
    
    datetimeFormatInput.addEventListener('change', function() {
      updateDatetimeStyleProperty('datetimeFormat', this.value);
    });
  }
  
  // 日期格式和时间格式的单独控制已移除，使用合并的日期时间格式控制
  
  // 字体大小控制
  const fontSizeInput = document.getElementById('fontSizeInput');
  const fontSizeValue = document.getElementById('fontSizeValue');
  if (fontSizeInput) {
    // 从状态中获取当前值
    chrome.storage.sync.get(['datetimeComponent'], function(result) {
      if (result.datetimeComponent && result.datetimeComponent.style) {
        const fontSize = result.datetimeComponent.style.fontSize || '24px';
        fontSizeInput.value = parseInt(fontSize) || 24;
        if (fontSizeValue) fontSizeValue.textContent = fontSize;
      }
    });
    
    fontSizeInput.addEventListener('input', function() {
      const newValue = this.value + 'px';
      if (fontSizeValue) fontSizeValue.textContent = newValue;
      updateDatetimeStyleProperty('fontSize', newValue);
    });
  }
  
  // 字体颜色控制
  const fontColorInput = document.getElementById('fontColorInput');
  if (fontColorInput) {
    // 从状态中获取当前值
    chrome.storage.sync.get(['datetimeComponent'], function(result) {
      if (result.datetimeComponent && result.datetimeComponent.style) {
        fontColorInput.value = convertRgbaToHex(result.datetimeComponent.style.color) || '#ffffff';
      }
    });
    
    fontColorInput.addEventListener('input', function() {
      updateDatetimeStyleProperty('color', this.value);
    });
  }
  
  // 字体选择控制
  const fontFamilyInput = document.getElementById('fontFamilyInput');
  if (fontFamilyInput) {
    // 添加更多时间显示常用字体选项
    addTimeDisplayFonts(fontFamilyInput);
    
    // 从状态中获取当前值
    chrome.storage.sync.get(['datetimeComponent'], function(result) {
      if (result.datetimeComponent && result.datetimeComponent.style) {
        fontFamilyInput.value = result.datetimeComponent.style.fontFamily || "'Segoe UI', Arial, sans-serif";
      }
    });
    
    fontFamilyInput.addEventListener('change', function() {
      updateDatetimeStyleProperty('fontFamily', this.value);
    });
  }
}

// 设置日期时间显示控制
function setupDatetimeDisplayControls() {
  // 日期时间分行显示控制
  const toggleSeparateLine = document.getElementById('toggleSeparateLine');
  if (toggleSeparateLine) {
    // 从状态中获取当前值
    chrome.storage.sync.get(['datetimeComponent'], function(result) {
      if (result.datetimeComponent && result.datetimeComponent.style) {
        toggleSeparateLine.checked = result.datetimeComponent.style.separateLine === true; // 默认为false
      }
    });
    
    toggleSeparateLine.addEventListener('change', function() {
      // 使用needsImmediateUpdate=true确保分行显示设置立即生效
      updateDatetimeStyleProperty('separateLine', this.checked, true);
    });
  }
  
  // 自动适应壁纸颜色控制
  const toggleAutoAdjust = document.getElementById('toggleAutoAdjust');
  if (toggleAutoAdjust) {
    // 从状态中获取当前值
    chrome.storage.sync.get(['datetimeComponent'], function(result) {
      if (result.datetimeComponent && result.datetimeComponent.style) {
        toggleAutoAdjust.checked = result.datetimeComponent.style.autoAdjust !== false; // 默认为true
      }
    });
    
    toggleAutoAdjust.addEventListener('change', function() {
      // 使用needsImmediateUpdate=true确保自动适应壁纸颜色设置立即生效
      updateDatetimeStyleProperty('autoAdjust', this.checked, true);
    });
  }
  
  // 重置默认设置按钮
  const resetDatetimeButton = document.getElementById('resetDatetimeButton');
  if (resetDatetimeButton) {
    resetDatetimeButton.addEventListener('click', resetDatetimeSettings);
  }
}

// 添加时间显示常用字体
function addTimeDisplayFonts(selectElement) {
  // 确保元素存在
  if (!selectElement) return;
  
  // 常用于时间显示的字体 - 扩展更多现代数字显示字体
  const timeDisplayFonts = [
    { value: "'Roboto Mono', monospace", label: "Roboto Mono" },
    { value: "'Digital-7', monospace", label: "Digital-7" },
    { value: "'DS-Digital', monospace", label: "DS-Digital" },
    { value: "'Orbitron', sans-serif", label: "Orbitron" },
    { value: "'Share Tech Mono', monospace", label: "Share Tech Mono" },
    { value: "'Iceland', cursive", label: "Iceland" },
    { value: "'Audiowide', cursive", label: "Audiowide" },
    { value: "'Oxanium', cursive", label: "Oxanium" },
    { value: "'Rajdhani', sans-serif", label: "Rajdhani" },
    { value: "'Chakra Petch', sans-serif", label: "Chakra Petch" },
    { value: "'Quantico', sans-serif", label: "Quantico" },
    { value: "'Wallpoet', cursive", label: "Wallpoet" },
    { value: "'Syncopate', sans-serif", label: "Syncopate" },
    { value: "'Teko', sans-serif", label: "Teko" },
    { value: "'Saira Stencil One', cursive", label: "Saira Stencil" },
    { value: "'Major Mono Display', monospace", label: "Major Mono" }
  ];
  
  // 添加字体选项
  timeDisplayFonts.forEach(font => {
    const option = document.createElement('option');
    option.value = font.value;
    option.textContent = font.label;
    option.style.fontFamily = font.value; // 在选项中预览字体
    selectElement.appendChild(option);
  });
  
  // 添加Google Fonts链接以加载这些字体
  if (!document.getElementById('datetime-fonts')) {
    const fontLink = document.createElement('link');
    fontLink.id = 'datetime-fonts';
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Orbitron&family=Share+Tech+Mono&family=Iceland&family=Audiowide&family=Oxanium&family=Rajdhani&family=Chakra+Petch&family=Quantico&family=Wallpoet&family=Syncopate&family=Teko&family=Saira+Stencil+One&family=Major+Mono+Display&display=swap';
    document.head.appendChild(fontLink);
  }
}

// 更新日期时间组件样式属性
function updateDatetimeStyleProperty(property, value, needsImmediateUpdate = false) {
  // 获取当前状态
  chrome.storage.sync.get(['datetimeComponent'], function(result) {
    let datetimeComponent = result.datetimeComponent || {
      visible: true,
      position: { centered: true, left: '50%', top: '20%' },
      style: {}
    };
    
    // 确保style对象存在
    if (!datetimeComponent.style) {
      datetimeComponent.style = {};
    }
    
    // 更新指定属性
    datetimeComponent.style[property] = value;
    
    // 保存更新后的状态
    chrome.storage.sync.set({ datetimeComponent: datetimeComponent }, function() {
      console.log(`日期时间组件样式属性 ${property} 已更新为 ${value}`);
      
      // 如果页面上存在日期时间组件，立即更新其样式
      updateDatetimeStyleInDOM(datetimeComponent.style);
      
      // 对于所有样式属性变更，立即调用updateDatetime
      if (typeof window.updateDatetime === 'function') {
        console.log(`立即更新日期时间组件显示 - 属性: ${property}`);
        window.updateDatetime();
        window.updateDatetimeStyle(); // 同时调用updateDatetimeStyle确保样式完全更新
      }
        window.updateDatetime();
      }
    );
  });
}

// 在DOM中更新日期时间组件样式
function updateDatetimeStyleInDOM(style) {
  const datetimeComponent = document.getElementById('datetime-component');
  if (!datetimeComponent) return;
  
  // 应用样式
  Object.keys(style).forEach(property => {
    // 跳过不直接应用于DOM的属性（如格式设置）
    if (property !== 'datetimeFormat' && property !== 'showSeconds' && 
        property !== 'showDate' && property !== 'separateLine') {
      datetimeComponent.style[property] = style[property];
    }
  });
  
  // 无论什么样式属性更改，都调用updateDatetime函数来更新显示
  // 这样所有设置都能立即生效而无需刷新页面
  if (typeof window.updateDatetime === 'function') {
    window.updateDatetime();
  }
}

// 将RGBA颜色转换为HEX格式
function convertRgbaToHex(rgba) {
  if (!rgba || !rgba.startsWith('rgba')) return rgba;
  
  // 提取RGBA值
  const match = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!match) return rgba;
  
  // 转换为HEX
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  
  // 忽略透明度，只返回RGB十六进制值
  return `#${r}${g}${b}`;
}

// 重置日期时间设置为默认值
function resetDatetimeSettings() {
  // 默认日期时间组件设置
  const defaultDatetimeSettings = {
    visible: true,
    position: { centered: true, left: '50%', top: '20%' },
    style: {
      fontSize: '24px',
      fontWeight: '300',
      color: '#ffffff',
      textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
      opacity: 1,
      fontFamily: "'Segoe UI', Arial, sans-serif",
      datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
      separateLine: false,
      autoAdjust: true,
      textAlign: 'center',
      letterSpacing: 'normal',
      lineHeight: '1.5'
    }
  };
  
  // 保存默认设置
  chrome.storage.sync.set({ datetimeComponent: defaultDatetimeSettings }, function() {
    console.log('日期时间组件已重置为默认设置');
    
    // 更新UI显示
    updateUIWithDefaultSettings(defaultDatetimeSettings);
    
    // 如果页面上存在日期时间组件，立即更新其样式
    updateDatetimeStyleInDOM(defaultDatetimeSettings.style);
  });
}

// 更新UI显示为默认设置
function updateUIWithDefaultSettings(defaultSettings) {
  // 更新日期时间格式输入框
  const datetimeFormatInput = document.getElementById('datetimeFormatInput');
  if (datetimeFormatInput) {
    datetimeFormatInput.value = defaultSettings.style.datetimeFormat;
  }
  
  // 更新字体大小滑块
  const fontSizeInput = document.getElementById('fontSizeInput');
  const fontSizeValue = document.getElementById('fontSizeValue');
  if (fontSizeInput) {
    const fontSize = defaultSettings.style.fontSize;
    fontSizeInput.value = parseInt(fontSize);
    if (fontSizeValue) fontSizeValue.textContent = fontSize;
  }
  
  // 更新字体颜色选择器
  const fontColorInput = document.getElementById('fontColorInput');
  if (fontColorInput) {
    fontColorInput.value = defaultSettings.style.color;
  }
  
  // 更新字体选择下拉框
  const fontFamilyInput = document.getElementById('fontFamilyInput');
  if (fontFamilyInput) {
    fontFamilyInput.value = defaultSettings.style.fontFamily;
  }
  
  // 更新分行显示复选框
  const toggleSeparateLine = document.getElementById('toggleSeparateLine');
  if (toggleSeparateLine) {
    toggleSeparateLine.checked = defaultSettings.style.separateLine;
  }
  
  // 更新自动适应壁纸颜色复选框
  const toggleAutoAdjust = document.getElementById('toggleAutoAdjust');
  if (toggleAutoAdjust) {
    toggleAutoAdjust.checked = defaultSettings.style.autoAdjust;
  }
  
  // 更新显示日期时间复选框
  const toggleDatetime = document.getElementById('toggleDatetime');
  if (toggleDatetime) {
    toggleDatetime.checked = defaultSettings.visible;
  }
}