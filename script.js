/**
 * 确保页面获得焦点，使键盘快捷键能够立即工作
 * 使用多种方法尝试获取页面焦点
 */
function ensurePageFocus() {
  console.log('尝试确保页面获得焦点...');
  
  // 尝试多种方法获取页面焦点
  window.focus();
  document.body.focus();
  
  // 设置tabIndex使元素可聚焦
  if (document.body.tabIndex === undefined || document.body.tabIndex < 0) {
    document.body.tabIndex = -1;
  }
  
  // 模拟用户交互
  try {
    // 创建并触发一个鼠标事件，模拟用户点击
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    document.body.dispatchEvent(clickEvent);
  } catch (e) {
    console.error('模拟用户交互失败:', e);
  }
  
  // 使用requestAnimationFrame确保在下一帧尝试
  requestAnimationFrame(() => {
    window.focus();
    document.body.focus();
  });
}

// 等待DOM完全加载后再执行
document.addEventListener('DOMContentLoaded', function() {
  // 立即尝试获取页面焦点，使快捷键能够工作
  ensurePageFocus();
  // 阻止浏览器自动聚焦到地址栏
  // 使用多种策略确保焦点设置到搜索框
  
  // 定义一个变量跟踪尝试次数
  let focusAttempts = 0;
  const MAX_FOCUS_ATTEMPTS = 10; // 最大尝试次数
  
  // 定义一个函数来设置焦点到搜索框
  const setFocusToSearchBox = function() {
    // 增加尝试次数
    focusAttempts++;
    
    // 将焦点从地址栏移开
    if (document.activeElement) {
      document.activeElement.blur();
    }
    
    // 获取搜索框元素
    const searchBox = document.querySelector('.search-box');
    
    // 确保元素存在
    if (!searchBox) {
      console.error('搜索框元素不存在');
      return;
    }
    
    // 尝试多种方法设置焦点
    searchBox.focus();
    searchBox.focus({preventScroll: true}); // 使用preventScroll选项
    
    // 检查焦点是否成功设置到搜索框
    if (document.activeElement !== searchBox) {
      console.log(`焦点设置失败，尝试 ${focusAttempts}/${MAX_FOCUS_ATTEMPTS}...`);
      
      // 如果尝试次数未达到最大值，则继续尝试
      if (focusAttempts < MAX_FOCUS_ATTEMPTS) {
        // 递增延迟时间，从100ms开始，逐渐增加
        const delay = 100 + (focusAttempts * 50);
        setTimeout(setFocusToSearchBox, delay);
      }
    } else {
      console.log('成功设置焦点到搜索框');
    }
  };
  
  // 使用多个时间点尝试设置焦点
  // 首次尝试设置焦点，使用较长的延迟
  setTimeout(setFocusToSearchBox, 800);
  // 同时尝试确保页面获得焦点
  setTimeout(ensurePageFocus, 100);
  
  // 在页面完全加载后再次尝试
  window.addEventListener('load', function() {
    setTimeout(setFocusToSearchBox, 300);
    
    // 确保页面获得焦点，这样键盘事件才能立即生效
    ensurePageFocus();
    
    // 延迟一段时间后再次尝试获取焦点
    setTimeout(ensurePageFocus, 500);
  });
  
  // 使用requestAnimationFrame确保在下一帧渲染时尝试
  requestAnimationFrame(function() {
    setTimeout(setFocusToSearchBox, 500);
    
    // 再次尝试获取页面焦点
    ensurePageFocus();
  });
  
  // 使用多个requestAnimationFrame嵌套，确保在多个渲染帧尝试
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ensurePageFocus();
    });
  });
  
  // 配置
  const CONFIG = {
    // 本地壁纸配置
    DEFAULT_WALLPAPER: 'wallpapers/default.svg',
    // 本地壁纸列表
    LOCAL_WALLPAPERS: [
      'wallpapers/default.svg'
    ],
    // 搜索引擎配置
    SEARCH_ENGINES: {
      google: {
        name: 'Google',
        url: 'https://www.google.com/search?q='
      },
      bing: {
        name: 'Bing',
        url: 'https://www.bing.com/search?q='
      },
      baidu: {
        name: '百度',
        url: 'https://www.baidu.com/s?wd='
      },
      duckduckgo: {
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q='
      }
    },
    // 重试配置
    MAX_RETRIES: 3,
    // 请求超时时间(毫秒)
    FETCH_TIMEOUT: 5000
  };

  // 状态管理
  let state = {
    // 组件可见性控制
    componentsVisibility: {
      searchBox: true,
      datetime: true
    },
    datetimeComponent: { // 日期时间组件状态
      visible: true, // 是否显示
      position: { // 位置
        centered: true, // 默认居中
        left: '50%',
        top: '20%'
      },
      style: { // 样式配置
        fontSize: '24px',
        fontWeight: '300',
        color: 'rgba(255, 255, 255, 0.9)',
        textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
        opacity: 1,
        fontFamily: '"Segoe UI", Arial, sans-serif',
        dateFormat: 'YYYY-MM-DD', // 日期格式
        timeFormat: 'HH:mm:ss', // 时间格式
        showSeconds: true, // 是否显示秒
        showDate: true, // 是否显示日期
        showTime: true, // 是否显示时间
        textAlign: 'center', // 文本对齐方式
        letterSpacing: 'normal', // 字母间距
        lineHeight: '1.5', // 行高
        textTransform: 'none', // 文本转换
        fontStyle: 'normal', // 字体样式
        textDecoration: 'none' // 文本装饰
      }
    },
    currentSearchEngine: 'google',
    wallpapers: [],
    retryCount: 0,
    isUsingLocalWallpapers: false, // 标记是否使用本地壁纸
    searchBoxPosition: { // 搜索框位置
      centered: true // 默认居中
    },
    searchBoxStyle: { // 搜索框样式配置
      borderRadius: '15px', // 圆角大小
      width: '40%', // 宽度
      maxWidth: '500px', // 最大宽度
      height: 'auto', // 高度
      padding: '15px 20px', // 内边距
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // 背景颜色
      opacity: 1, // 透明度
      borderWidth: '2px', // 边框宽度
      borderColor: '#ffffff' // 边框颜色(已从rgba转换为十六进制)
    },
    isDragging: false, // 是否正在拖动搜索框
    dragOffset: { x: 0, y: 0 }, // 搜索框拖动偏移量
    datetimeDragging: false, // 是否正在拖动日期时间组件
    datetimeDragOffset: { x: 0, y: 0 }, // 日期时间组件拖动偏移量
    settingsShortcut: { // 设置菜单快捷键
      key: ',', // 默认为逗号
      altKey: true, // 默认需要按Alt键
      ctrlKey: false,
      shiftKey: false
    }
  };

  // DOM元素
  const elements = {
    searchBox: document.querySelector('.search-box'),
    backgroundContainer: document.querySelector('.background-container'),
    settingsButton: document.getElementById('settingsButton'),
    settingsPanel: document.getElementById('settingsPanel'),
    closeSettings: document.getElementById('closeSettings'),
    wallpaperGrid: document.getElementById('wallpaperGrid'),
    searchEngines: document.querySelectorAll('.search-engine'),
    resetPositionButton: document.getElementById('resetPositionButton'),
    currentEngineIcon: document.getElementById('currentEngineIcon'),
    datetimeComponent: document.getElementById('datetime-component')
  };

  // 初始化应用
  initApp();

  // 应用初始化
  function initApp() {
    loadBrowserSearchEngines();
    loadUserSettings();
    setupEventListeners();
    loadWallpapers();
    createDatetimeComponent();
    updateDatetime();
    setInterval(updateDatetime, 1000); // 每秒更新一次时间
  }
  
  // 加载浏览器搜索引擎
  function loadBrowserSearchEngines() {
    // 确保使用默认搜索引擎配置
    updateSearchEnginesPanel();
    
    // 加载用户自定义的搜索引擎
    loadCustomSearchEngines();
  }
  
  // 加载自定义搜索引擎
  function loadCustomSearchEngines() {
    chrome.storage.sync.get(['customSearchEngines'], function(result) {
      if (result.customSearchEngines) {
        // 合并默认和自定义搜索引擎
        CONFIG.SEARCH_ENGINES = {
          ...CONFIG.SEARCH_ENGINES,
          ...result.customSearchEngines
        };
        updateSearchEnginesPanel();
      }
    });
  }
  
  // 添加自定义搜索引擎
  function addCustomSearchEngine(name, url) {
    const engineKey = name.toLowerCase().replace(/\s+/g, '');
    
    // 获取当前自定义搜索引擎
    chrome.storage.sync.get(['customSearchEngines'], function(result) {
      const customEngines = result.customSearchEngines || {};
      
      // 添加新引擎
      customEngines[engineKey] = {
        name: name,
        url: url.replace('{q}', '{searchTerms}')
      };
      
      // 保存
      chrome.storage.sync.set({ customSearchEngines: customEngines }, function() {
        // 重新加载搜索引擎
        loadBrowserSearchEngines();
      });
    });
  }
  
  // 删除自定义搜索引擎
  function removeCustomSearchEngine(engineKey) {
    // 获取当前自定义搜索引擎
    chrome.storage.sync.get(['customSearchEngines'], function(result) {
      const customEngines = result.customSearchEngines || {};
      
      // 删除指定引擎
      delete customEngines[engineKey];
      
      // 保存
      chrome.storage.sync.set({ customSearchEngines: customEngines }, function() {
        // 重新加载搜索引擎
        loadBrowserSearchEngines();
      });
    });
  }

  // 加载用户设置
  function loadUserSettings() {
    // 加载组件可见性设置
    chrome.storage.sync.get(['componentsVisibility'], function(result) {
      if (result.componentsVisibility) {
        state.componentsVisibility = result.componentsVisibility;
        updateComponentsVisibility();
      }
    });
    
    // 加载日期时间组件设置
    chrome.storage.sync.get(['datetimeComponent'], function(result) {
      if (result.datetimeComponent) {
        // 合并设置到状态中
        state.datetimeComponent = {
          ...state.datetimeComponent,
          ...result.datetimeComponent
        };
        
        // 确保style对象存在
        if (result.datetimeComponent.style) {
          state.datetimeComponent.style = {
            ...state.datetimeComponent.style,
            ...result.datetimeComponent.style
          };
        }
        
        // 更新日期时间组件
        updateDatetime();
        updateDatetimeStyle();
      }
    });
    
    // 从sync存储加载搜索引擎、搜索框位置、样式和快捷键设置
    chrome.storage.sync.get(['searchEngine', 'searchBoxPosition', 'searchBoxStyle', 'settingsShortcut'], function(syncResult) {
      // 壁纸设置现在由壁纸管理器处理
      // 不再从chrome.storage.local直接加载壁纸
      // 壁纸管理器会自动加载并设置当前壁纸

        // 加载搜索引擎设置
        if (syncResult.searchEngine && CONFIG.SEARCH_ENGINES[syncResult.searchEngine]) {
          state.currentSearchEngine = syncResult.searchEngine;
          updateSearchEngineUI();
        }
        
        // 加载搜索框位置
        if (syncResult.searchBoxPosition) {
          state.searchBoxPosition = syncResult.searchBoxPosition;
          updateSearchBoxPosition();
        }
        
        // 加载搜索框样式
        if (syncResult.searchBoxStyle) {
          state.searchBoxStyle = syncResult.searchBoxStyle;
          updateSearchBoxStyle();
        }
        
        // 加载快捷键设置
        if (syncResult.settingsShortcut) {
          state.settingsShortcut = syncResult.settingsShortcut;
        }
      });
  }

  // 设置事件监听器
  function setupEventListeners() {
    // 组件可见性切换事件
    document.getElementById('toggleSearchBox')?.addEventListener('change', function() {
      toggleComponentVisibility('searchBox', this.checked);
    });
    
    document.getElementById('toggleDatetime')?.addEventListener('change', function() {
      toggleComponentVisibility('datetime', this.checked);
    });
    // 搜索框事件
    elements.searchBox.addEventListener('keypress', handleSearch);

    // 设置面板事件
    elements.settingsButton.addEventListener('click', toggleSettingsPanel);
    elements.closeSettings.addEventListener('click', toggleSettingsPanel);

    // 搜索引擎选择事件
    elements.searchEngines.forEach(engine => {
      engine.addEventListener('click', function() {
        setSearchEngine(this.dataset.engine);
      });
    });
    
    // 重置搜索框位置按钮事件
    if (elements.resetPositionButton) {
      elements.resetPositionButton.addEventListener('click', resetAllDefaultSettings);
    }
    
    // 自定义搜索引擎事件 - 侧边栏中的添加按钮（保留但不显示）
    document.getElementById('addEngineButton')?.addEventListener('click', function() {
      const name = document.getElementById('engineNameInput').value.trim();
      const url = document.getElementById('engineUrlInput').value.trim();
      
      if (name && url) {
        addCustomSearchEngine(name, url);
        document.getElementById('engineNameInput').value = '';
        document.getElementById('engineUrlInput').value = '';
      }
    });
    
    // 自定义搜索引擎弹窗事件
    document.addEventListener('click', function(e) {
      // 关闭弹窗按钮
      if (e.target.id === 'closeCustomEngineModal' || e.target.closest('#closeCustomEngineModal')) {
        toggleCustomEngineModal();
      }
      
      // 弹窗中的添加按钮
      if (e.target.id === 'modalAddEngineButton') {
        const name = document.getElementById('modalEngineNameInput').value.trim();
        const url = document.getElementById('modalEngineUrlInput').value.trim();
        
        if (name && url) {
          addCustomSearchEngine(name, url);
          document.getElementById('modalEngineNameInput').value = '';
          document.getElementById('modalEngineUrlInput').value = '';
          toggleCustomEngineModal(); // 添加成功后关闭弹窗
        }
      }
      
      // 点击弹窗外部区域关闭弹窗
      if (e.target.id === 'customEngineModal') {
        toggleCustomEngineModal();
      }
    });
    
    // 搜索框拖拽事件
    const searchContainer = document.querySelector('.search-container');
    searchContainer.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // 全局键盘快捷键事件 - 使用捕获阶段以确保尽早捕获键盘事件
    document.addEventListener('keydown', handleKeyboardShortcuts, true);
    // 在window对象上也添加键盘事件监听，增加捕获机会
    window.addEventListener('keydown', handleKeyboardShortcuts, true);
    
    // 快捷键设置表单事件
    setupShortcutSettingsEvents();
    
    // 确保页面能够接收键盘事件
    document.body.tabIndex = -1;
  }
  
  // 开始拖拽
  function handleDragStart(e) {
    // 允许在搜索框内按住鼠标左键拖动
    if (e.target === elements.searchBox && e.button !== 0) return;
    
    state.isDragging = true;
    const searchContainer = document.querySelector('.search-container');
    
    // 计算鼠标点击位置与搜索框左上角的偏移量
    const rect = searchContainer.getBoundingClientRect();
    state.dragOffset.x = e.clientX - rect.left;
    state.dragOffset.y = e.clientY - rect.top;
    
    // 添加拖拽时的样式
    searchContainer.style.cursor = 'grabbing';
  }
  
  // 拖拽移动
  function handleDragMove(e) {
    if (!state.isDragging) return;
    
    const searchContainer = document.querySelector('.search-container');
    
    // 计算新位置（考虑偏移量）
    const left = e.clientX - state.dragOffset.x;
    const top = e.clientY - state.dragOffset.y;
    
    // 更新位置
    searchContainer.style.left = left + 'px';
    searchContainer.style.top = top + 'px';
    searchContainer.style.transform = 'none';
    
    // 更新状态
    state.searchBoxPosition = {
      left: left + 'px',
      top: top + 'px',
      centered: false // 拖动后不再居中
    };
  }
  
  // 结束拖拽
  function handleDragEnd() {
    if (!state.isDragging) return;
    
    state.isDragging = false;
    const searchContainer = document.querySelector('.search-container');
    searchContainer.style.cursor = 'grab';
    
    // 保存位置到存储
    saveSearchBoxPosition();
  }
  
  // 更新搜索框位置
  function updateSearchBoxPosition() {
    const searchContainer = document.querySelector('.search-container');
    
    // 如果是居中位置，使用transform
    if (state.searchBoxPosition.centered) {
      searchContainer.style.left = '50%';
      searchContainer.style.top = '38.2%';
      searchContainer.style.transform = 'translate(-50%, -50%)';
    } else {
      // 否则使用绝对定位
      searchContainer.style.left = state.searchBoxPosition.left;
      searchContainer.style.top = state.searchBoxPosition.top;
      searchContainer.style.transform = 'none';
    }
  }
  
  // 保存搜索框位置
  function saveSearchBoxPosition() {
    chrome.storage.sync.set({ searchBoxPosition: state.searchBoxPosition }, function() {
      console.log('搜索框位置已保存');
    });
  }
  
  // 更新搜索框样式
  function updateSearchBoxStyle() {
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
      searchBox.style.borderRadius = state.searchBoxStyle.borderRadius;
      searchBox.style.width = state.searchBoxStyle.width;
      searchBox.style.maxWidth = state.searchBoxStyle.maxWidth;
      searchBox.style.height = state.searchBoxStyle.height;
      searchBox.style.padding = state.searchBoxStyle.padding;
      searchBox.style.backgroundColor = state.searchBoxStyle.backgroundColor;
      searchBox.style.opacity = state.searchBoxStyle.opacity;
      searchBox.style.borderWidth = state.searchBoxStyle.borderWidth;
      searchBox.style.borderColor = state.searchBoxStyle.borderColor;
    }
  }
  
  // 保存组件可见性设置
  function saveComponentsVisibility() {
    chrome.storage.sync.set({ componentsVisibility: state.componentsVisibility });
  }
  
  // 切换组件可见性
  function toggleComponentVisibility(component, isVisible) {
    state.componentsVisibility[component] = isVisible;
    updateComponentsVisibility();
    saveComponentsVisibility();
  }
  
  // 更新组件可见性
  function updateComponentsVisibility() {
    const searchContainer = document.querySelector('.search-container');
    const datetimeComponent = document.getElementById('datetime-component');
    
    if (searchContainer) {
      searchContainer.style.display = state.componentsVisibility.searchBox ? 'block' : 'none';
    }
    
    if (datetimeComponent) {
      datetimeComponent.style.display = state.componentsVisibility.datetime ? 'block' : 'none';
    }
  }
  
  // 保存搜索框样式
  function saveSearchBoxStyle() {
    chrome.storage.sync.set({ searchBoxStyle: state.searchBoxStyle }, function() {
      console.log('搜索框样式已保存');
    });
  }
  
  // 重置搜索框位置到居中
  function resetAllDefaultSettings() {
  // 重置搜索框位置
  resetSearchBoxPosition();
  
  // 重置搜索框样式
  resetSearchBoxStyle();
}

function resetSearchBoxStyle() {
  // 重置搜索框样式到默认值
  const defaultStyle = state.searchBoxStyle;
  elements.searchBox.style.borderRadius = defaultStyle.borderRadius;
  elements.searchBox.style.width = defaultStyle.width;
  elements.searchBox.style.maxWidth = defaultStyle.maxWidth;
  elements.searchBox.style.height = defaultStyle.height;
  elements.searchBox.style.padding = defaultStyle.padding;
  elements.searchBox.style.backgroundColor = defaultStyle.backgroundColor;
  elements.searchBox.style.opacity = defaultStyle.opacity;
  elements.searchBox.style.borderWidth = defaultStyle.borderWidth;
  elements.searchBox.style.borderColor = defaultStyle.borderColor;
  
  // 保存设置
  saveUserSettings();
}

function resetSearchBoxPosition() {
    // 更新状态为居中
    state.searchBoxPosition = {
      centered: true
    };
    
    // 更新UI
    updateSearchBoxPosition();
    
    // 保存设置
    saveSearchBoxPosition();
  }

  // 处理搜索
  function handleSearch(e) {
    if (e.key === 'Enter') {
      const query = this.value.trim();
      if (query) {
        const searchEngine = CONFIG.SEARCH_ENGINES[state.currentSearchEngine];
        
        try {
          // 检查是否支持chrome.search API直接搜索
          if (chrome.search && chrome.search.query) {
            try {
              // 尝试使用chrome.search API进行搜索
              // 确保提供所有必需的参数
              const queryInfo = {
                disposition: 'CURRENT_TAB',
                text: query
              };
              chrome.search.query(queryInfo, function(success) {
                // 搜索完成的回调
                if (success === false) {
                  console.warn('chrome.search API搜索失败，回退到传统方式');
                  // API返回失败，回退到传统方式
                  window.open(`${searchEngine.url}${encodeURIComponent(query)}`, '_self');
                } else {
                  console.log('搜索已完成');
                }
              });
            } catch (searchError) {
              console.error('使用chrome.search API搜索时出错:', searchError);
              // 出错时回退到传统方式
              window.open(`${searchEngine.url}${encodeURIComponent(query)}`, '_self');
            }
          } else {
            // API不可用，使用传统方式：直接打开搜索URL
            console.log('chrome.search API不可用，使用传统搜索方式');
            window.open(`${searchEngine.url}${encodeURIComponent(query)}`, '_self');
          }
        } catch (error) {
          console.error('搜索处理过程中发生错误:', error);
          // 确保在任何情况下都能搜索
          window.open(`${searchEngine.url}${encodeURIComponent(query)}`, '_self');
        }
      }
    }
  }

  // 切换设置面板
  function toggleSettingsPanel() {
    elements.settingsPanel.classList.toggle('active');
  }
  
  // 处理键盘快捷键
  function handleKeyboardShortcuts(e) {
    // 添加调试信息，帮助排查快捷键问题
    console.log('键盘事件触发:', e.key, '修饰键状态:', e.altKey, e.ctrlKey, e.shiftKey);
    
    // 检查是否按下Esc键关闭设置面板
    if (e.key === 'Escape' && elements.settingsPanel.classList.contains('active')) {
      console.log('ESC键被按下，关闭设置面板');
      toggleSettingsPanel();
      return;
    }
    
    // 检查是否按下设置面板快捷键
    if (e.key === state.settingsShortcut.key && 
        e.altKey === state.settingsShortcut.altKey && 
        e.ctrlKey === state.settingsShortcut.ctrlKey && 
        e.shiftKey === state.settingsShortcut.shiftKey) {
      console.log('设置面板快捷键被触发');
      toggleSettingsPanel();
      e.preventDefault(); // 阻止默认行为
      e.stopPropagation(); // 阻止事件冒泡
    }
  }
  
  // 设置快捷键设置表单事件
  function setupShortcutSettingsEvents() {
    const shortcutInput = document.getElementById('settingsShortcutKey');
    const altKeyCheckbox = document.getElementById('settingsShortcutAlt');
    const ctrlKeyCheckbox = document.getElementById('settingsShortcutCtrl');
    const shiftKeyCheckbox = document.getElementById('settingsShortcutShift');
    
    if (shortcutInput && altKeyCheckbox) {
      // 初始化快捷键设置表单
      shortcutInput.value = state.settingsShortcut.key;
      altKeyCheckbox.checked = state.settingsShortcut.altKey;
      if (ctrlKeyCheckbox) ctrlKeyCheckbox.checked = state.settingsShortcut.ctrlKey;
      if (shiftKeyCheckbox) shiftKeyCheckbox.checked = state.settingsShortcut.shiftKey;
      
      // 快捷键输入框事件
      shortcutInput.addEventListener('keydown', function(e) {
        e.preventDefault();
        // 排除修饰键
        if (e.key !== 'Alt' && e.key !== 'Control' && e.key !== 'Shift') {
          this.value = e.key;
          saveShortcutSettings();
        }
      });
      
      // 修饰键复选框事件
      altKeyCheckbox.addEventListener('change', saveShortcutSettings);
      if (ctrlKeyCheckbox) ctrlKeyCheckbox.addEventListener('change', saveShortcutSettings);
      if (shiftKeyCheckbox) shiftKeyCheckbox.addEventListener('change', saveShortcutSettings);
    }
    
    // 搜索框样式设置事件
    setupSearchBoxStyleControls();
  }
  
  // 设置搜索框样式控制
  function setupSearchBoxStyleControls() {
    // 圆角大小控制
    const borderRadiusInput = document.getElementById('borderRadiusInput');
    if (borderRadiusInput) {
      borderRadiusInput.value = state.searchBoxStyle.borderRadius.replace('px', '');
      borderRadiusInput.addEventListener('input', function() {
        state.searchBoxStyle.borderRadius = this.value + 'px';
        updateSearchBoxStyle();
        saveSearchBoxStyle();
      });
    }
    
    // 宽度控制
    const widthInput = document.getElementById('widthInput');
    if (widthInput) {
      widthInput.value = state.searchBoxStyle.width.replace('%', '');
      widthInput.addEventListener('input', function() {
        state.searchBoxStyle.width = this.value + '%';
        updateSearchBoxStyle();
        saveSearchBoxStyle();
      });
    }
    
    // 最大宽度控制
    const maxWidthInput = document.getElementById('maxWidthInput');
    if (maxWidthInput) {
      maxWidthInput.value = state.searchBoxStyle.maxWidth.replace('px', '');
      maxWidthInput.addEventListener('input', function() {
        state.searchBoxStyle.maxWidth = this.value + 'px';
        updateSearchBoxStyle();
        saveSearchBoxStyle();
      });
    }
    
    // 高度控制
    const heightInput = document.getElementById('heightInput');
    if (heightInput) {
      heightInput.value = state.searchBoxStyle.height === 'auto' ? '' : state.searchBoxStyle.height.replace('px', '');
      heightInput.addEventListener('input', function() {
        state.searchBoxStyle.height = this.value ? this.value + 'px' : 'auto';
        updateSearchBoxStyle();
        saveSearchBoxStyle();
      });
    }
    
    // 内边距控制
    const paddingInput = document.getElementById('paddingInput');
    if (paddingInput) {
      paddingInput.value = state.searchBoxStyle.padding;
      paddingInput.addEventListener('input', function() {
        state.searchBoxStyle.padding = this.value;
        updateSearchBoxStyle();
        saveSearchBoxStyle();
      });
    }
    
    // 背景透明度控制
    const opacityInput = document.getElementById('opacityInput');
    if (opacityInput) {
      opacityInput.value = state.searchBoxStyle.opacity;
      opacityInput.addEventListener('input', function() {
        state.searchBoxStyle.opacity = parseFloat(this.value);
        updateSearchBoxStyle();
        saveSearchBoxStyle();
      });
    }
    
    // 边框宽度控制
    const borderWidthInput = document.getElementById('borderWidthInput');
    if (borderWidthInput) {
      borderWidthInput.value = state.searchBoxStyle.borderWidth.replace('px', '');
      borderWidthInput.addEventListener('input', function() {
        state.searchBoxStyle.borderWidth = this.value + 'px';
        updateSearchBoxStyle();
        saveSearchBoxStyle();
      });
    }
    
    // 边框颜色控制
    const borderColorInput = document.getElementById('borderColorInput');
    if (borderColorInput) {
      borderColorInput.value = state.searchBoxStyle.borderColor;
      borderColorInput.addEventListener('input', function() {
        state.searchBoxStyle.borderColor = this.value;
        updateSearchBoxStyle();
        saveSearchBoxStyle();
      });
    }
  }
  
  // 保存快捷键设置
  function saveShortcutSettings() {
    const shortcutInput = document.getElementById('settingsShortcutKey');
    const altKeyCheckbox = document.getElementById('settingsShortcutAlt');
    const ctrlKeyCheckbox = document.getElementById('settingsShortcutCtrl');
    const shiftKeyCheckbox = document.getElementById('settingsShortcutShift');
    
    if (shortcutInput && altKeyCheckbox) {
      state.settingsShortcut = {
        key: shortcutInput.value,
        altKey: altKeyCheckbox.checked,
        ctrlKey: ctrlKeyCheckbox ? ctrlKeyCheckbox.checked : false,
        shiftKey: shiftKeyCheckbox ? shiftKeyCheckbox.checked : false
      };
      
      // 保存到存储
      chrome.storage.sync.set({ settingsShortcut: state.settingsShortcut }, function() {
        console.log('快捷键设置已保存');
      });
    }
  }

  // 设置搜索引擎
  function setSearchEngine(engineKey) {
    if (CONFIG.SEARCH_ENGINES[engineKey]) {
      state.currentSearchEngine = engineKey;
      chrome.storage.sync.set({ searchEngine: engineKey });
      updateSearchEngineUI();
    }
  }

  // 更新搜索引擎面板
  function updateSearchEnginesPanel() {
    // 获取搜索引擎容器
    const searchEnginesContainer = document.querySelector('.search-engines');
    if (!searchEnginesContainer) return;
    
    // 清空现有内容
    searchEnginesContainer.innerHTML = '';
    
    // 添加所有可用的搜索引擎
    Object.keys(CONFIG.SEARCH_ENGINES).forEach(engineKey => {
      const engine = CONFIG.SEARCH_ENGINES[engineKey];
      
      // 创建搜索引擎元素
      const engineElement = document.createElement('div');
      engineElement.className = 'search-engine';
      engineElement.dataset.engine = engineKey;
      
      if (engineKey === state.currentSearchEngine) {
        engineElement.classList.add('active');
      }
      
      // 创建图标
      const img = document.createElement('img');
      
      // 尝试使用域名获取favicon
      const domain = new URL(engine.url).hostname;
      img.src = `https://${domain}/favicon.ico`;
      img.alt = engine.name;
      
      // 添加错误处理，如果图标加载失败，使用默认图标
      img.onerror = function() {
        this.src = 'icons/icon16.png';
      };
      
      // 创建名称
      const span = document.createElement('span');
      span.textContent = engine.name;
      
      // 添加到容器
      engineElement.appendChild(img);
      engineElement.appendChild(span);
      
      // 添加点击事件
      engineElement.addEventListener('click', function() {
        setSearchEngine(engineKey);
      });
      
      searchEnginesContainer.appendChild(engineElement);
    });
    
    // 添加"添加"按钮
    const addButtonElement = document.createElement('div');
    addButtonElement.className = 'search-engine add-engine-button';
    
    // 创建加号图标
    const addIcon = document.createElement('i');
    addIcon.className = 'fas fa-plus';
    addIcon.style.fontSize = '20px';
    addIcon.style.marginBottom = '5px';
    
    // 创建文本
    const addText = document.createElement('span');
    addText.textContent = '添加';
    
    // 添加到容器
    addButtonElement.appendChild(addIcon);
    addButtonElement.appendChild(addText);
    
    // 添加点击事件 - 显示自定义搜索引擎弹窗
    addButtonElement.addEventListener('click', function() {
      // 显示自定义搜索引擎弹窗
      toggleCustomEngineModal();
      
      // 聚焦到第一个输入框
      setTimeout(() => {
        const nameInput = document.getElementById('modalEngineNameInput');
        if (nameInput) {
          nameInput.focus();
        }
      }, 100);
    });
    
    searchEnginesContainer.appendChild(addButtonElement);
    
    // 更新DOM引用
    elements.searchEngines = document.querySelectorAll('.search-engine:not(.add-engine-button)');
  }
  
  // 更新搜索引擎UI
  function updateSearchEngineUI() {
    // 更新设置面板中的搜索引擎选择
    elements.searchEngines.forEach(engine => {
      if (engine.dataset.engine === state.currentSearchEngine) {
        engine.classList.add('active');
      } else {
        engine.classList.remove('active');
      }
    });
    
    // 更新搜索框中的搜索引擎图标
    const currentEngineIcon = document.getElementById('currentEngineIcon');
    if (currentEngineIcon && CONFIG.SEARCH_ENGINES[state.currentSearchEngine]) {
      const engineKey = state.currentSearchEngine;
      const engineName = CONFIG.SEARCH_ENGINES[engineKey].name;
      
      // 清空当前内容
      currentEngineIcon.innerHTML = '';
      
      // 创建图标
      const img = document.createElement('img');
      
      // 尝试使用域名获取favicon
      const domain = new URL(CONFIG.SEARCH_ENGINES[engineKey].url).hostname;
      img.src = `https://${domain}/favicon.ico`;
      img.alt = engineName;
      img.title = `${engineName}`;
      
      // 添加错误处理，如果图标加载失败，使用默认图标
      img.onerror = function() {
        this.src = 'icons/icon16.png';
      };
      
      currentEngineIcon.appendChild(img);
      
      // 更新搜索框占位符文本
      elements.searchBox.placeholder = `${engineName}`;
    }
  }

  

  // 加载壁纸
  function loadWallpapers() {
    // 使用壁纸管理器加载壁纸
    if (window.wallpaperManager) {
      // 显示加载中提示
      elements.wallpaperGrid.innerHTML = '<div class="loading-wallpapers">正在加载壁纸...</div>';
      
      // 监听壁纸加载完成事件
      window.wallpaperManager.addEventListener('wallpapersLoaded', function() {
        // 使用壁纸管理器渲染壁纸网格
        window.wallpaperManager.renderWallpaperGrid(elements.wallpaperGrid);
      });
    } else {
      console.error('壁纸管理器未初始化');
    }
  }
  
  // 创建日期时间组件
  function createDatetimeComponent() {
    // 如果组件已存在则不再创建
    if (elements.datetimeComponent) return;
    
    // 创建组件DOM
    const datetimeEl = document.createElement('div');
    datetimeEl.id = 'datetime-component';
    datetimeEl.className = 'datetime-component';
    
    // 添加到body
    document.body.appendChild(datetimeEl);
    
    // 更新DOM引用
    elements.datetimeComponent = datetimeEl;
    
    // 应用初始样式
    updateDatetimeStyle();
    
    // 添加拖动功能
    setupDatetimeDrag();
  }
  
  // 更新日期时间显示
  function updateDatetime() {
    // 实际实现
    _updateDatetime();
  }
  
  // 将updateDatetime函数暴露为全局函数，以便其他模块调用
  window.updateDatetime = updateDatetime;
  
  // 更新日期时间显示的内部实现
  function _updateDatetime() {
    if (!elements.datetimeComponent) return;
    
    const now = new Date();
    const style = state.datetimeComponent.style || {};
    
    // 使用合并的日期时间格式
    let displayText = '';
    
    // 获取日期时间格式，默认为'YYYY-MM-DD HH:mm:ss'
    const datetimeFormat = style.datetimeFormat || 'YYYY-MM-DD HH:mm:ss';
    
    // 格式化日期时间
    displayText = datetimeFormat
      .replace('YYYY', now.getFullYear())
      .replace('MM', String(now.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(now.getDate()).padStart(2, '0'))
      .replace('HH', String(now.getHours()).padStart(2, '0'))
      .replace('mm', String(now.getMinutes()).padStart(2, '0'))
      .replace('ss', String(now.getSeconds()).padStart(2, '0'));
    
    // 检查是否需要分行显示
    const separateLine = style.separateLine === true;
    
    // 如果启用了分行显示，在日期和时间之间添加换行
    if (separateLine) {
      // 尝试在日期和时间之间添加换行（假设格式中有空格分隔）
      displayText = displayText.replace(' ', '<br>');
    }
    
    // 明确检查showDate是否为false，默认为true
    const showDate = style.showDate !== false;
    
    // 如果不显示日期，则清空显示文本
    if (!showDate) {
      displayText = '';
    }
    
    // 使用innerHTML以支持换行标签
    elements.datetimeComponent.innerHTML = displayText;
    
    // 如果启用了自动适应壁纸颜色，则检查并调整文字颜色
    if (style.autoAdjust !== false) {
      // 调用text-contrast.js中的adjustTextContrast函数来调整文字颜色
      if (window.textContrast && window.textContrast.adjustTextContrast) {
        // 获取背景容器
        const backgroundContainer = document.querySelector('.background-container');
        if (backgroundContainer) {
          // 获取背景图片URL
          const bgImage = getComputedStyle(backgroundContainer).backgroundImage;
          const bgColor = getComputedStyle(backgroundContainer).backgroundColor;
          
          // 如果有背景图片，使用图片亮度来确定文字颜色
          if (bgImage && bgImage !== 'none') {
            // 提取图片URL
            const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
            if (urlMatch && urlMatch[1]) {
              // 使用text-contrast.js中的函数计算图片亮度
              window.textContrast.calculateImageBrightness(urlMatch[1], function(brightness) {
                window.textContrast.adjustTextContrast(brightness);
              });
            }
          }
        }
      }
    }
  }
  
  // 更新日期时间组件样式
  function updateDatetimeStyle() {
    // 调用内部实现函数
    _updateDatetimeStyle();
  }
  
  // 将updateDatetimeStyle函数暴露为全局函数，以便其他模块调用
  window.updateDatetimeStyle = updateDatetimeStyle;
  
  // 更新日期时间组件样式的内部实现
  function _updateDatetimeStyle() {
    if (!elements.datetimeComponent) return;
    
    // 从存储中获取最新的样式设置
    chrome.storage.sync.get(['datetimeComponent'], function(result) {
      // 如果存储中有样式设置，则使用存储中的设置
      if (result.datetimeComponent && result.datetimeComponent.style) {
        // 更新状态
        state.datetimeComponent.style = {...state.datetimeComponent.style, ...result.datetimeComponent.style};
      }
      
      const style = state.datetimeComponent.style;
      const position = state.datetimeComponent.position;
      
      // 自动调整字体颜色和透明度以适应背景
      let autoColor = 'rgba(255, 255, 255, 0.9)';
      let autoTextShadow = '0 1px 3px rgba(0, 0, 0, 0.8)';
      
      // 使用壁纸背景来确定文字颜色
      const backgroundContainer = document.querySelector('.background-container');
      if (backgroundContainer) {
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
                autoColor = 'rgba(0, 0, 0, 0.9)';
                autoTextShadow = '0 1px 3px rgba(255, 255, 255, 0.5)';
              } else { // 暗色背景
                autoColor = 'rgba(255, 255, 255, 0.9)';
                autoTextShadow = '0 1px 3px rgba(0, 0, 0, 0.8)';
              }
              
              // 应用样式
              applyDatetimeStyle(style, position, autoColor, autoTextShadow);
            });
            return; // 异步计算亮度，提前返回
          }
        }
        
        // 如果没有背景图片或无法提取URL，使用背景颜色
        const isDarkBg = isColorDark(bgColor);
        autoColor = isDarkBg ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
        autoTextShadow = isDarkBg ? '0 1px 3px rgba(0, 0, 0, 0.8)' : '0 1px 3px rgba(255, 255, 255, 0.5)';
      }
      
      // 应用样式
      applyDatetimeStyle(style, position, autoColor, autoTextShadow);
    });
  }
  
  // 应用日期时间组件样式
  function applyDatetimeStyle(style, position, autoColor, autoTextShadow) {
    if (!elements.datetimeComponent) return;
    
    // 应用样式
    elements.datetimeComponent.style.cssText = `
      font-size: ${style.fontSize};
      font-weight: ${style.fontWeight};
      color: ${style.autoAdjust !== false ? autoColor : style.color};
      text-shadow: ${style.autoAdjust !== false ? autoTextShadow : style.textShadow};
      opacity: ${style.opacity};
      font-family: ${style.fontFamily};
      position: fixed;
      left: ${position.left};
      top: ${position.top};
      transform: ${position.centered ? 'translateX(-50%)' : 'none'};
      z-index: 5;
      cursor: grab;
      user-select: none;
      transition: all 0.3s ease;
      text-align: ${style.textAlign};
      letter-spacing: ${style.letterSpacing};
      line-height: ${style.lineHeight};
      text-transform: ${style.textTransform};
      font-style: ${style.fontStyle};
      text-decoration: ${style.textDecoration};
    `;
  }
  
  // 判断背景颜色是否为深色
  function isColorDark(color) {
    // 将颜色转换为rgb值
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return false;
    
    // 计算亮度
    const brightness = (parseInt(rgb[0]) * 299 + 
                       parseInt(rgb[1]) * 587 + 
                       parseInt(rgb[2]) * 114) / 1000;
    return brightness < 128;
  }
  
  // 设置日期时间组件拖动功能
  function setupDatetimeDrag() {
    // 使用与搜索框相同的拖动实现方式
    elements.datetimeComponent.addEventListener('mousedown', handleDatetimeDragStart);
    document.addEventListener('mousemove', handleDatetimeDragMove);
    document.addEventListener('mouseup', handleDatetimeDragEnd);
  }
  
  // 开始拖拽日期时间组件
  function handleDatetimeDragStart(e) {
    // 只响应鼠标左键
    if (e.button !== 0) return;
    
    state.datetimeDragging = true;
    
    // 计算鼠标点击位置与组件左上角的偏移量
    const rect = elements.datetimeComponent.getBoundingClientRect();
    state.datetimeDragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // 添加拖拽时的样式
    elements.datetimeComponent.style.cursor = 'grabbing';
    
    // 禁用过渡效果，确保拖动时立即响应
    elements.datetimeComponent.style.transition = 'none';
    
    e.preventDefault();
  }
  
  // 拖拽移动日期时间组件
  function handleDatetimeDragMove(e) {
    if (!state.datetimeDragging) return;
    
    // 计算新位置（考虑偏移量）
    const left = e.clientX - state.datetimeDragOffset.x;
    const top = e.clientY - state.datetimeDragOffset.y;
    
    // 更新位置
    elements.datetimeComponent.style.left = left + 'px';
    elements.datetimeComponent.style.top = top + 'px';
    elements.datetimeComponent.style.transform = 'none';
    
    // 更新状态
    state.datetimeComponent.position = {
      centered: false,
      left: left + 'px',
      top: top + 'px'
    };
  }
  
  // 结束拖拽日期时间组件
  function handleDatetimeDragEnd() {
    if (!state.datetimeDragging) return;
    
    state.datetimeDragging = false;
    elements.datetimeComponent.style.cursor = 'grab';
    
    // 恢复过渡效果
    elements.datetimeComponent.style.transition = 'all 0.3s ease';
    
    // 保存位置到存储
    saveDatetimePosition();
  }
  
  // 保存日期时间组件位置
  function saveDatetimePosition() {
    chrome.storage.sync.set({ datetimeComponent: state.datetimeComponent }, function() {
      console.log('日期时间组件位置已保存');
    });
  }
  
// 获取随机本地壁纸
  function openFilePicker() {
    // 使用壁纸管理器打开文件选择器
    if (window.wallpaperManager) {
      window.wallpaperManager.openFilePicker();
    } else {
      console.error('壁纸管理器未初始化');
    }
  }

function getRandomLocalWallpaper() {
    if (CONFIG.LOCAL_WALLPAPERS.length === 0) {
      return CONFIG.DEFAULT_WALLPAPER;
    }
    const randomIndex = Math.floor(Math.random() * CONFIG.LOCAL_WALLPAPERS.length);
    return CONFIG.LOCAL_WALLPAPERS[randomIndex];
  }

   // 渲染壁纸网格和添加壁纸到网格的功能已由壁纸管理器提供
   // 这些函数已被移除，请使用wallpaperManager.renderWallpaperGrid和wallpaperManager.addWallpaperToGrid
   
   // 设置壁纸
   function setWallpaper(wallpaperUrl) {
     // 使用壁纸管理器设置壁纸
     if (window.wallpaperManager) {
       // 如果是文件对象，使用壁纸管理器的addWallpaper方法
       if (wallpaperUrl instanceof File) {
         window.wallpaperManager.addWallpaper(wallpaperUrl);
         return;
       }
       
       // 否则使用setCurrentWallpaper方法
       window.wallpaperManager.setCurrentWallpaper(wallpaperUrl);
     } else {
       console.error('壁纸管理器未初始化');
     }
   }
});
