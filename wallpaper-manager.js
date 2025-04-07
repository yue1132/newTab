/**
 * 壁纸管理器
 * 用于管理壁纸的存储、加载和显示
 * 解决chrome.storage.local存储配额限制问题
 * 使用FileSystem API将壁纸保存到插件安装目录而非使用Chrome存储API
 */

// 壁纸管理器对象
const WallpaperManager = {
  // 壁纸存储目录
  WALLPAPER_DIR: 'wallpapers',
  
  // 壁纸列表（按添加时间倒序）
  wallpapers: [],
  
  // 当前壁纸URL
  currentWallpaper: '',
  
  // 文件系统对象
  fileSystem: null,
  
  // 文件系统根目录
  fileSystemRoot: null,
  
  // 初始化壁纸管理器
  init: function() {
    console.log('初始化壁纸管理器...');
    // 初始化文件系统
    this.initFileSystem(() => {
      this.loadWallpaperList();
      
      // 添加键盘事件监听器
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' && this.currentWallpaper && !this.wallpapers.find(wp => wp.path === this.currentWallpaper)?.isDefault) {
          this.deleteWallpaper(this.currentWallpaper);
        }
      });
    });
    return this;
  },
  
  // 初始化文件系统
  initFileSystem: function(callback) {
    // 请求持久化文件系统，配额为100MB
    window.webkitRequestFileSystem(
      window.PERSISTENT,
      100 * 1024 * 1024, // 100MB
      (fs) => {
        console.log('文件系统初始化成功');
        this.fileSystem = fs;
        this.fileSystemRoot = fs.root;
        
        // 确保壁纸目录存在
        this.ensureWallpaperDirectory(() => {
          if (callback) callback();
        });
      },
      (error) => {
        console.error('文件系统初始化失败:', error);
        // 如果文件系统初始化失败，回退到使用IndexedDB
        this.initDB(() => {
          if (callback) callback();
        });
      }
    );
  },
  
  // 确保壁纸目录存在
  ensureWallpaperDirectory: function(callback) {
    this.fileSystemRoot.getDirectory(
      this.WALLPAPER_DIR,
      {create: true},
      (dirEntry) => {
        console.log('壁纸目录已就绪:', dirEntry.fullPath);
        if (callback) callback();
      },
      (error) => {
        console.error('创建壁纸目录失败:', error);
        if (callback) callback();
      }
    );
  },
  
  // 加载壁纸列表
  loadWallpaperList: function() {
    // 从storage中获取壁纸列表信息
    chrome.storage.sync.get(['wallpaperList', 'currentWallpaper'], (result) => {
      // 默认壁纸
      const defaultWallpaper = {
        id: 'default',
        path: 'wallpapers/default.svg',
        isDefault: true,
        timestamp: Date.now()
      };
      
      // 首先检查storage中是否有保存的壁纸列表
      const hasSavedWallpapers = result.wallpaperList && Array.isArray(result.wallpaperList) && result.wallpaperList.length > 0;
      
      // 如果有文件系统，则从文件系统加载壁纸列表
      if (this.fileSystem) {
        this.loadWallpapersFromFileSystem((wallpapers) => {
          // 合并文件系统中的壁纸和storage中保存的壁纸列表
          if (wallpapers && wallpapers.length > 0) {
            // 确保默认壁纸始终存在
            const hasDefault = wallpapers.some(wp => wp.isDefault);
            if (!hasDefault) {
              wallpapers.push(defaultWallpaper);
            }
            this.wallpapers = wallpapers;
          } else if (hasSavedWallpapers) {
            // 如果文件系统中没有壁纸，但storage中有，则使用storage中的壁纸列表
            this.wallpapers = result.wallpaperList;
            // 确保默认壁纸存在
            if (!this.wallpapers.some(wp => wp.isDefault)) {
              this.wallpapers.push(defaultWallpaper);
            }
          } else {
            // 如果文件系统和storage中都没有壁纸，则使用默认壁纸
            this.wallpapers = [defaultWallpaper];
          }
          
          // 加载当前壁纸
          if (result.currentWallpaper) {
            // 确保当前壁纸在壁纸列表中存在
            const wallpaperExists = this.wallpapers.some(wp => wp.path === result.currentWallpaper);
            if (wallpaperExists) {
              this.currentWallpaper = result.currentWallpaper;
              // 立即应用当前壁纸
              this.applyCurrentWallpaper();
            } else {
              // 如果当前壁纸不存在，则使用第一个壁纸
              this.currentWallpaper = this.wallpapers[0].path;
              // 立即应用当前壁纸
              this.applyCurrentWallpaper();
            }
          } else {
            this.currentWallpaper = this.wallpapers[0].path;
            // 立即应用当前壁纸
            this.applyCurrentWallpaper();
          }
          
          // 触发壁纸列表加载完成事件
          this.dispatchEvent('wallpapersLoaded');
        });
      } else {
        // 如果没有文件系统，则从storage中加载
        if (hasSavedWallpapers) {
          this.wallpapers = result.wallpaperList;
          // 确保默认壁纸存在
          if (!this.wallpapers.some(wp => wp.isDefault)) {
            this.wallpapers.push(defaultWallpaper);
          }
        } else {
          this.wallpapers = [defaultWallpaper];
        }
        
        // 加载当前壁纸
        if (result.currentWallpaper) {
          // 确保当前壁纸在壁纸列表中存在
          const wallpaperExists = this.wallpapers.some(wp => wp.path === result.currentWallpaper);
          if (wallpaperExists) {
            this.currentWallpaper = result.currentWallpaper;
            // 立即应用当前壁纸
            this.applyCurrentWallpaper();
          } else {
            // 如果当前壁纸不存在，则使用第一个壁纸
            this.currentWallpaper = this.wallpapers[0].path;
            // 立即应用当前壁纸
            this.applyCurrentWallpaper();
          }
        } else {
          this.currentWallpaper = this.wallpapers[0].path;
          // 立即应用当前壁纸
          this.applyCurrentWallpaper();
        }
        
        // 触发壁纸列表加载完成事件
        this.dispatchEvent('wallpapersLoaded');
      }
    });
  },
  
  // 从文件系统加载壁纸列表
  loadWallpapersFromFileSystem: function(callback) {
    if (!this.fileSystem) {
      callback([]);
      return;
    }
    
    this.fileSystemRoot.getDirectory(
      this.WALLPAPER_DIR,
      {create: false},
      (dirEntry) => {
        const reader = dirEntry.createReader();
        const wallpapers = [];
        
        // 递归读取所有文件
        const readEntries = () => {
          reader.readEntries((entries) => {
            if (entries.length === 0) {
              // 读取完成，按时间戳倒序排列
              wallpapers.sort((a, b) => b.timestamp - a.timestamp);
              callback(wallpapers);
              return;
            }
            
            // 处理每个文件
            entries.forEach((entry) => {
              if (entry.isFile && !entry.name.startsWith('.')) {
                // 从文件名中提取信息
                const match = entry.name.match(/wallpaper_(\d+)_([a-z0-9]+)\.(\w+)/);
                if (match) {
                  const timestamp = parseInt(match[1]);
                  const randomStr = match[2];
                  
                  wallpapers.push({
                    id: `${timestamp}_${randomStr}`,
                    path: `${this.WALLPAPER_DIR}/${entry.name}`,
                    isDefault: false,
                    timestamp: timestamp
                  });
                }
              }
            });
            
            // 继续读取
            readEntries();
          }, (error) => {
            console.error('读取壁纸目录失败:', error);
            callback(wallpapers);
          });
        };
        
        // 开始读取
        readEntries();
      },
      (error) => {
        console.error('获取壁纸目录失败:', error);
        callback([]);
      }
    );
  },
  
  // 保存壁纸列表
  saveWallpaperList: function(callback) {
    // 保存当前壁纸路径和壁纸列表信息到storage
    // 确保在页面刷新后能够恢复壁纸设置
    chrome.storage.sync.set({
      currentWallpaper: this.currentWallpaper,
      wallpaperList: this.wallpapers
    }, () => {
      console.log('壁纸设置已保存');
      if (callback) callback();
    });
  },
  
  // 添加壁纸
  addWallpaper: function(file, callback) {
    if (!file || !(file instanceof File)) {
      console.error('无效的文件对象');
      return;
    }
    
    // 生成唯一文件名（时间戳+随机数）
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `wallpaper_${timestamp}_${randomStr}.${fileExt}`;
    const filePath = `${this.WALLPAPER_DIR}/${fileName}`;
    
    // 读取文件内容
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target.result;
      
      // 压缩图片以减小存储空间
      this.compressImage(fileData, (compressedData) => {
        // 创建壁纸对象
        const wallpaper = {
          id: `${timestamp}_${randomStr}`,
          path: filePath,
          isDefault: false,
          timestamp: timestamp
        };
        
        // 将壁纸添加到列表（添加到开头，实现倒序）
        this.wallpapers.unshift(wallpaper);
        
        const saveToStorage = () => {
          // 保存壁纸列表，确保保存完成
          this.saveWallpaperList(() => {
            console.log('壁纸列表已保存');
            // 设置为当前壁纸
            this.setCurrentWallpaper(wallpaper.path);
            // 触发壁纸添加完成事件
            this.dispatchEvent('wallpaperAdded', wallpaper);
            
            if (callback) callback(wallpaper);
          });
        };
        
        // 如果有文件系统，则保存到文件系统
        if (this.fileSystem) {
          this.saveWallpaperToFileSystem(fileName, compressedData, () => {
            saveToStorage();
          });
        } else {
          // 否则保存到IndexedDB
          this.saveWallpaperData(wallpaper.id, compressedData, () => {
            saveToStorage();
          });
        }
      });
    };
    reader.readAsDataURL(file);
  },
  
  // 压缩图片
  compressImage: function(dataUrl, callback, maxWidth = 1920, maxHeight = 1080, quality = 0.7) {
    // 创建图片对象
    const img = new Image();
    img.onload = () => {
      // 计算新的尺寸，保持宽高比
      let width = img.width;
      let height = img.height;
      
      // 如果图片尺寸超过最大限制，按比例缩小
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      // 创建Canvas元素
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // 在Canvas上绘制调整后的图片
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // 将Canvas内容转换为压缩后的数据URL
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // 检查压缩后的大小
      const originalSize = dataUrl.length;
      const compressedSize = compressedDataUrl.length;
      
      console.log(`图片压缩: ${(originalSize / 1024).toFixed(2)}KB -> ${(compressedSize / 1024).toFixed(2)}KB (${(compressedSize / originalSize * 100).toFixed(2)}%)`);
      
      // 如果压缩后仍然太大，进一步压缩
      if (compressedSize > 1024 * 1024) { // 如果大于1MB
        this.compressImage(compressedDataUrl, callback, width * 0.8, height * 0.8, quality * 0.9);
      } else {
        callback(compressedDataUrl);
      }
    };
    
    // 设置图片源
    img.src = dataUrl;
  },
  
  // 初始化IndexedDB
  initDB: function(callback) {
    const request = indexedDB.open('WallpaperDB', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // 创建壁纸存储对象
      if (!db.objectStoreNames.contains('wallpapers')) {
        db.createObjectStore('wallpapers', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      this.db = event.target.result;
      if (callback) callback();
    };
    
    request.onerror = (event) => {
      console.error('IndexedDB初始化失败:', event.target.error);
    };
  },
  
  // 保存壁纸数据到IndexedDB
  saveWallpaperData: function(id, data, callback) {
    if (!this.db) {
      this.initDB(() => this.saveWallpaperData(id, data, callback));
      return;
    }
    
    const transaction = this.db.transaction(['wallpapers'], 'readwrite');
    const store = transaction.objectStore('wallpapers');
    
    const wallpaperData = {
      id: id,
      data: data,
      timestamp: Date.now()
    };
    
    const request = store.put(wallpaperData);
    
    request.onsuccess = () => {
      console.log('壁纸数据已保存到IndexedDB');
      if (callback) callback();
    };
    
    request.onerror = (event) => {
      console.error('保存壁纸数据失败:', event.target.error);
    };
  },
  
  // 从IndexedDB获取壁纸数据
  getWallpaperData: function(id, callback) {
    if (!this.db) {
      this.initDB(() => this.getWallpaperData(id, callback));
      return;
    }
    
    const transaction = this.db.transaction(['wallpapers'], 'readonly');
    const store = transaction.objectStore('wallpapers');
    const request = store.get(id);
    
    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result) {
        callback(result.data);
      } else {
        callback(null);
      }
    };
    
    request.onerror = (event) => {
      console.error('获取壁纸数据失败:', event.target.error);
      callback(null);
    };
  },
  
  // 删除壁纸
  deleteWallpaper: function(path, callback) {
    // 查找壁纸索引
    const index = this.wallpapers.findIndex(wp => wp.path === path);
    if (index === -1) {
      console.error('壁纸不存在:', path);
      return;
    }
    
    // 不允许删除默认壁纸
    if (this.wallpapers[index].isDefault) {
      console.error('不能删除默认壁纸');
      return;
    }
    
    // 保存壁纸ID和文件名用于删除数据
    const wallpaper = this.wallpapers[index];
    const wallpaperId = wallpaper.id;
    const fileName = path.split('/').pop();
    
    // 从列表中移除
    this.wallpapers.splice(index, 1);
    
    // 如果删除的是当前壁纸，则设置为第一个壁纸（最新添加的）
    if (this.currentWallpaper === path) {
      this.setCurrentWallpaper(this.wallpapers[0].path);
    }
    
    // 保存更新后的壁纸列表
    this.saveWallpaperList();
    
    // 如果有文件系统，则从文件系统删除
    if (this.fileSystem) {
      this.deleteWallpaperFromFileSystem(fileName, () => {
        // 触发壁纸删除事件
        this.dispatchEvent('wallpaperDeleted', path);
        // 更新UI
        this.updateWallpaperGrid();
        
        if (callback) callback();
      });
    } else {
      // 否则从IndexedDB中删除壁纸数据
      this.deleteWallpaperData(wallpaperId, () => {
        // 触发壁纸删除事件
        this.dispatchEvent('wallpaperDeleted', path);
        // 更新UI
        this.updateWallpaperGrid();
        
        if (callback) callback();
      });
    }
  },
  
  // 从IndexedDB删除壁纸数据
  deleteWallpaperData: function(id, callback) {
    if (!this.db) {
      this.initDB(() => this.deleteWallpaperData(id, callback));
      return;
    }
    
    const transaction = this.db.transaction(['wallpapers'], 'readwrite');
    const store = transaction.objectStore('wallpapers');
    const request = store.delete(id);
    
    request.onsuccess = () => {
      console.log('壁纸数据已从IndexedDB删除');
      if (callback) callback();
    };
    
    request.onerror = (event) => {
      console.error('删除壁纸数据失败:', event.target.error);
    };
  },
  
  // 设置当前壁纸
  setCurrentWallpaper: function(path) {
    this.currentWallpaper = path;
    
    // 查找壁纸对象
    const wallpaper = this.wallpapers.find(wp => wp.path === path);
    if (!wallpaper) {
      console.error('壁纸不存在:', path);
      return;
    }
    
    // 更新UI中的激活状态
    this.updateActiveWallpaperUI(path);
    
    // 如果是默认壁纸，直接设置
    if (wallpaper.isDefault) {
      const wallpaperUrl = chrome.runtime.getURL(path);
      document.querySelector('.background-container').style.backgroundImage = `url(${wallpaperUrl})`;
      
      // 分析背景亮度并调整文字对比度
      if (window.textContrast) {
        window.textContrast.calculateImageBrightness(wallpaperUrl, function(brightness) {
          console.log('背景亮度:', brightness);
          window.textContrast.adjustTextContrast(brightness);
        });
      }
      
      // 触发日期时间组件样式更新
      if (window.updateDatetimeStyle) {
        window.updateDatetimeStyle();
      }
      
      // 保存当前壁纸设置，确保保存完成
      this.saveWallpaperList(() => {
        console.log('默认壁纸设置已保存');
        // 触发壁纸更改事件
        this.dispatchEvent('wallpaperChanged', path);
      });
      return;
    }
    
    // 如果有文件系统，则从文件系统获取壁纸
    if (this.fileSystem) {
      const fileName = path.split('/').pop();
      this.getWallpaperFromFileSystem(fileName, (data) => {
        if (data) {
          // 设置背景图片
          document.querySelector('.background-container').style.backgroundImage = `url(${data})`;
          
          // 分析背景亮度并调整文字对比度
          if (window.textContrast) {
            window.textContrast.calculateImageBrightness(data, function(brightness) {
              console.log('背景亮度:', brightness);
              window.textContrast.adjustTextContrast(brightness);
            });
          }
          
          // 触发日期时间组件样式更新
          if (window.updateDatetimeStyle) {
            window.updateDatetimeStyle();
          }
          
          // 保存当前壁纸设置，确保保存完成
          this.saveWallpaperList(() => {
            console.log('文件系统壁纸设置已保存');
            // 触发壁纸更改事件
            this.dispatchEvent('wallpaperChanged', path);
          });
        } else {
          console.error('壁纸文件不存在:', fileName);
        }
      });
    } else {
      // 否则从IndexedDB获取壁纸数据
      this.getWallpaperData(wallpaper.id, (data) => {
        if (data) {
          // 设置背景图片
          document.querySelector('.background-container').style.backgroundImage = `url(${data})`;
          
          // 分析背景亮度并调整文字对比度
          if (window.textContrast) {
            window.textContrast.calculateImageBrightness(data, function(brightness) {
              console.log('背景亮度:', brightness);
              window.textContrast.adjustTextContrast(brightness);
            });
          }
          
          // 触发日期时间组件样式更新
          if (window.updateDatetimeStyle) {
            window.updateDatetimeStyle();
          }
          
          // 保存当前壁纸设置，确保保存完成
          this.saveWallpaperList(() => {
            console.log('IndexedDB壁纸设置已保存');
            // 触发壁纸更改事件
            this.dispatchEvent('wallpaperChanged', path);
          });
        } else {
          console.error('壁纸数据不存在:', wallpaper.id);
        }
      });
    }
  },
  
  // 应用当前壁纸
  applyCurrentWallpaper: function() {
    // 如果当前壁纸已设置，则应用它
    if (this.currentWallpaper) {
      this.setCurrentWallpaper(this.currentWallpaper);
    }
  },
  
  // 更新UI中的激活壁纸状态
  updateActiveWallpaperUI: function(path) {
    // 获取所有壁纸项
    const wallpaperItems = document.querySelectorAll('.wallpaper-item');
    
    // 移除所有激活状态
    wallpaperItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // 为当前壁纸添加激活状态
    wallpaperItems.forEach(item => {
      if (item.dataset.path === path) {
        item.classList.add('active');
      }
    });
  },
  
  // 渲染壁纸网格
  renderWallpaperGrid: function(container) {
    if (!container) {
      container = document.getElementById('wallpaperGrid');
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 添加"添加壁纸"按钮
    const addButton = document.createElement('div');
    addButton.className = 'wallpaper-item add-wallpaper';
    addButton.innerHTML = '<div class="add-icon"><i class="fas fa-plus"></i></div><div class="add-text">添加壁纸</div>';
    addButton.addEventListener('click', () => this.openFilePicker());
    container.appendChild(addButton);
    
    // 添加壁纸项
    this.wallpapers.forEach(wallpaper => {
      this.addWallpaperToGrid(wallpaper, container);
    });
  },
  
  // 添加壁纸到网格
  addWallpaperToGrid: function(wallpaper, container) {
    if (!container) {
      container = document.getElementById('wallpaperGrid');
    }
    
    const wallpaperItem = document.createElement('div');
    wallpaperItem.className = `wallpaper-item${wallpaper.path === this.currentWallpaper ? ' active' : ''}`;
    wallpaperItem.dataset.path = wallpaper.path; // 添加data-path属性以便于识别
    
    const img = document.createElement('img');
    
    // 如果是默认壁纸，使用chrome.runtime.getURL获取URL
    if (wallpaper.isDefault) {
      img.src = chrome.runtime.getURL(wallpaper.path);
    } else if (this.fileSystem) {
      // 如果有文件系统，从文件系统获取壁纸
      const fileName = wallpaper.path.split('/').pop();
      this.getWallpaperFromFileSystem(fileName, (data) => {
        if (data) {
          img.src = data;
        } else {
          console.error('壁纸文件不存在:', fileName);
          // 使用占位图
          img.src = chrome.runtime.getURL('wallpapers/default.svg');
        }
      });
    } else {
      // 否则从IndexedDB获取壁纸数据
      this.getWallpaperData(wallpaper.id, (data) => {
        if (data) {
          img.src = data;
        } else {
          console.error('壁纸数据不存在:', wallpaper.id);
          // 使用占位图
          img.src = chrome.runtime.getURL('wallpapers/default.svg');
        }
      });
    }
    
    img.alt = '壁纸';
    wallpaperItem.appendChild(img);
    
    // 添加点击事件
    wallpaperItem.addEventListener('click', () => {
      this.setCurrentWallpaper(wallpaper.path);
    });
    
    // 添加右键菜单事件
    wallpaperItem.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      
      // 创建右键菜单
      const contextMenu = document.createElement('div');
      contextMenu.className = 'wallpaper-context-menu';
      
      // 设置为标签页壁纸选项
      const setOption = document.createElement('div');
      setOption.className = 'context-menu-item';
      setOption.innerHTML = '<i class="fas fa-image"></i> 设置为标签页壁纸';
      setOption.addEventListener('click', () => {
        this.setCurrentWallpaper(wallpaper.path);
        document.body.removeChild(contextMenu);
      });
      
      // 删除壁纸选项（不允许删除默认壁纸）
      if (!wallpaper.isDefault) {
        const deleteOption = document.createElement('div');
        deleteOption.className = 'context-menu-item';
        deleteOption.innerHTML = '<i class="fas fa-trash"></i> 删除壁纸';
        deleteOption.addEventListener('click', () => {
          this.deleteWallpaper(wallpaper.path, () => {
            this.renderWallpaperGrid(container);
          });
          document.body.removeChild(contextMenu);
        });
        contextMenu.appendChild(deleteOption);
      }
      
      // 添加选项到菜单
      contextMenu.appendChild(setOption);
      
      // 设置菜单位置
      contextMenu.style.left = e.pageX + 'px';
      contextMenu.style.top = e.pageY + 'px';
      
      // 添加到页面
      document.body.appendChild(contextMenu);
      
      // 点击其他区域关闭菜单
      document.addEventListener('click', function closeMenu() {
        if (document.body.contains(contextMenu)) {
          document.body.removeChild(contextMenu);
        }
        document.removeEventListener('click', closeMenu);
      });
    });
    
    container.appendChild(wallpaperItem);
  },
  
  // 打开文件选择器
  openFilePicker: function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        this.addWallpaper(file, () => {
          this.renderWallpaperGrid();
        });
      }
    };
    input.click();
  },
  
  // 事件处理
  eventListeners: {},
  
  // 添加事件监听器
  addEventListener: function(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  },
  
  // 移除事件监听器
  removeEventListener: function(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  },
  
  // 触发事件
  dispatchEvent: function(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }
};

// 文件系统API相关方法

// 保存壁纸到文件系统
WallpaperManager.saveWallpaperToFileSystem = function(fileName, data, callback) {
  if (!this.fileSystem) {
    console.error('文件系统未初始化');
    if (callback) callback(false);
    return;
  }
  
  // 获取壁纸目录
  this.fileSystemRoot.getDirectory(
    this.WALLPAPER_DIR,
    {create: true},
    (dirEntry) => {
      // 创建文件
      dirEntry.getFile(
        fileName,
        {create: true, exclusive: false},
        (fileEntry) => {
          // 创建写入器
          fileEntry.createWriter((fileWriter) => {
            fileWriter.onwriteend = () => {
              console.log('壁纸已保存到文件系统:', fileName);
              if (callback) callback(true);
            };
            
            fileWriter.onerror = (error) => {
              console.error('保存壁纸到文件系统失败:', error);
              if (callback) callback(false);
            };
            
            // 将Base64数据转换为Blob
            const byteString = atob(data.split(',')[1]);
            const mimeString = data.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            // 将二进制字符串转换为字节数组
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            
            // 创建Blob对象
            const blob = new Blob([ab], {type: mimeString});
            
            // 写入文件
            fileWriter.write(blob);
          }, (error) => {
            console.error('创建文件写入器失败:', error);
            if (callback) callback(false);
          });
        },
        (error) => {
          console.error('创建文件失败:', error);
          if (callback) callback(false);
        }
      );
    },
    (error) => {
      console.error('获取壁纸目录失败:', error);
      if (callback) callback(false);
    }
  );
};

// 从文件系统获取壁纸
WallpaperManager.getWallpaperFromFileSystem = function(fileName, callback) {
  if (!this.fileSystem) {
    console.error('文件系统未初始化');
    if (callback) callback(null);
    return;
  }
  
  // 获取壁纸目录
  this.fileSystemRoot.getDirectory(
    this.WALLPAPER_DIR,
    {create: false},
    (dirEntry) => {
      // 获取文件
      dirEntry.getFile(
        fileName,
        {create: false},
        (fileEntry) => {
          // 获取文件URL
          const fileUrl = fileEntry.toURL();
          if (callback) callback(fileUrl);
        },
        (error) => {
          console.error('获取文件失败:', error);
          if (callback) callback(null);
        }
      );
    },
    (error) => {
      console.error('获取壁纸目录失败:', error);
      if (callback) callback(null);
    }
  );
};

// 从文件系统删除壁纸
WallpaperManager.deleteWallpaperFromFileSystem = function(fileName, callback) {
  if (!this.fileSystem) {
    console.error('文件系统未初始化');
    if (callback) callback(false);
    return;
  }
  
  // 获取壁纸目录
  this.fileSystemRoot.getDirectory(
    this.WALLPAPER_DIR,
    {create: false},
    (dirEntry) => {
      // 获取文件
      dirEntry.getFile(
        fileName,
        {create: false},
        (fileEntry) => {
          // 删除文件
          fileEntry.remove(
            () => {
              console.log('壁纸已从文件系统删除:', fileName);
              if (callback) callback(true);
            },
            (error) => {
              console.error('删除文件失败:', error);
              if (callback) callback(false);
            }
          );
        },
        (error) => {
          console.error('获取文件失败:', error);
          if (callback) callback(false);
        }
      );
    },
    (error) => {
      console.error('获取壁纸目录失败:', error);
      if (callback) callback(false);
    }
  );
};

// 初始化壁纸管理器
window.wallpaperManager = WallpaperManager.init();