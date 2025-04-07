/**
 * 图片压缩工具
 * 用于压缩壁纸图片，避免超出Chrome存储配额
 */

// 压缩并保存图片
function compressAndSaveImage(dataUrl, callback, maxWidth = 1920, maxHeight = 1080, quality = 0.7) {
  // 创建图片对象
  const img = new Image();
  img.onload = function() {
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
      compressAndSaveImage(compressedDataUrl, callback, width * 0.8, height * 0.8, quality * 0.9);
    } else {
      callback(compressedDataUrl);
    }
  };
  
  // 设置图片源
  img.src = dataUrl;
}

// 导出函数
window.compressAndSaveImage = compressAndSaveImage;