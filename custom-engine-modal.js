/**
 * 自定义搜索引擎弹窗功能
 */

// 创建自定义搜索引擎弹窗
function createCustomEngineModal() {
  // 检查是否已存在弹窗
  if (document.getElementById('customEngineModal')) {
    return;
  }
  
  // 创建弹窗容器
  const modal = document.createElement('div');
  modal.id = 'customEngineModal';
  modal.className = 'custom-engine-modal';
  
  // 创建弹窗内容
  const modalContent = document.createElement('div');
  modalContent.className = 'custom-engine-modal-content';
  
  // 创建弹窗头部
  const modalHeader = document.createElement('div');
  modalHeader.className = 'custom-engine-modal-header';
  
  const modalTitle = document.createElement('h3');
  modalTitle.textContent = '添加自定义搜索引擎';
  
  const closeButton = document.createElement('button');
  closeButton.id = 'closeCustomEngineModal';
  closeButton.className = 'close-button';
  closeButton.innerHTML = '<i class="fas fa-times"></i>';
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  
  // 创建弹窗表单
  const modalForm = document.createElement('div');
  modalForm.className = 'custom-engine-modal-form';
  
  // 名称输入框
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'modalEngineNameInput';
  nameInput.placeholder = '搜索引擎名称';
  
  // URL输入框
  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.id = 'modalEngineUrlInput';
  urlInput.placeholder = '搜索URL (使用{q}代替查询词)';
  
  // 添加按钮
  const addButton = document.createElement('button');
  addButton.id = 'modalAddEngineButton';
  addButton.className = 'modal-add-button';
  addButton.textContent = '添加';
  
  // 添加表单元素到表单容器
  modalForm.appendChild(nameInput);
  modalForm.appendChild(urlInput);
  modalForm.appendChild(addButton);
  
  // 组装弹窗
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalForm);
  modal.appendChild(modalContent);
  
  // 添加到页面
  document.body.appendChild(modal);
}

// 切换自定义搜索引擎弹窗显示状态
function toggleCustomEngineModal() {
  const modal = document.getElementById('customEngineModal');
  
  // 如果弹窗不存在，先创建
  if (!modal) {
    createCustomEngineModal();
    setTimeout(() => {
      document.getElementById('customEngineModal').classList.add('active');
    }, 10);
    return;
  }
  
  // 切换显示状态
  modal.classList.toggle('active');
  
  // 如果弹窗被关闭，清空输入框
  if (!modal.classList.contains('active')) {
    document.getElementById('modalEngineNameInput').value = '';
    document.getElementById('modalEngineUrlInput').value = '';
  }
}

// 监听ESC键关闭弹窗
document.addEventListener('keydown', function(e) {
  const modal = document.getElementById('customEngineModal');
  if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
    toggleCustomEngineModal();
  }
});