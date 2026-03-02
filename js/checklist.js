// Checklist Module - Packing checklist management per trip

// Default checklist items organized by category
const defaultChecklistItems = [
    // Documents
    { id: 'doc_1', text: '護照', category: 'documents', checked: false },
    { id: 'doc_2', text: '身份證', category: 'documents', checked: false },
    { id: 'doc_3', text: '回鄉證 (&副本)', category: 'documents', checked: false },
    
    // Money
    { id: 'money_1', text: '錢', category: 'money', checked: false },
    { id: 'money_2', text: '銀聯提款卡 (activate 海外提款)', category: 'money', checked: false },
    { id: 'money_3', text: '信用卡', category: 'money', checked: false },
    
    // Electronics
    { id: 'elec_1', text: '手機', category: 'electronics', checked: false },
    { id: 'elec_2', text: '耳筒', category: 'electronics', checked: false },
    { id: 'elec_3', text: '上網卡 with 針', category: 'electronics', checked: false },
    { id: 'elec_4', text: '手機充電器', category: 'electronics', checked: false },
    { id: 'elec_5', text: 'portable 充電', category: 'electronics', checked: false },
    { id: 'elec_6', text: '手機繩', category: 'electronics', checked: false },
    { id: 'elec_7', text: '相機', category: 'electronics', checked: false },
    { id: 'elec_8', text: '鏡頭筆', category: 'electronics', checked: false },
    { id: 'elec_9', text: '後備電', category: 'electronics', checked: false },
    { id: 'elec_10', text: '腳架', category: 'electronics', checked: false },
    { id: 'elec_11', text: '萬能蘇', category: 'electronics', checked: false },
    
    // Bags & Containers
    { id: 'bag_1', text: '膠袋', category: 'bags', checked: false },
    { id: 'bag_2', text: '洗衫袋', category: 'bags', checked: false },
    { id: 'bag_3', text: '細袋', category: 'bags', checked: false },
    { id: 'bag_4', text: '戒指盒', category: 'bags', checked: false },
    
    // Toiletries
    { id: 'toil_1', text: '牙膏', category: 'toiletries', checked: false },
    { id: 'toil_2', text: '牙刷', category: 'toiletries', checked: false },
    { id: 'toil_3', text: '面巾', category: 'toiletries', checked: false },
    { id: 'toil_4', text: '浴巾', category: 'toiletries', checked: false },
    { id: 'toil_5', text: '紙巾', category: 'toiletries', checked: false },
    { id: 'toil_6', text: 'm巾', category: 'toiletries', checked: false },
    { id: 'toil_7', text: '棉花棒', category: 'toiletries', checked: false },
    { id: 'toil_8', text: '爽膚', category: 'toiletries', checked: false },
    { id: 'toil_9', text: '卸妝', category: 'toiletries', checked: false },
    
    // Personal Care
    { id: 'care_1', text: '髮夾', category: 'personal', checked: false },
    { id: 'care_2', text: '指甲鉗', category: 'personal', checked: false },
    { id: 'care_3', text: '眉鉗', category: 'personal', checked: false },
    { id: 'care_4', text: '梳', category: 'personal', checked: false },
    { id: 'care_5', text: '衫架', category: 'personal', checked: false },
    { id: 'care_6', text: '(風筒)', category: 'personal', checked: false },
    
    // Sun Protection
    { id: 'sun_1', text: '防曬', category: 'sun', checked: false },
    { id: 'sun_2', text: '太陽眼鏡', category: 'sun', checked: false },
    { id: 'sun_3', text: '傘', category: 'sun', checked: false },
    { id: 'sun_4', text: '帽', category: 'sun', checked: false },
    { id: 'sun_5', text: '潤唇膏', category: 'sun', checked: false },
    { id: 'sun_6', text: '鏡', category: 'sun', checked: false },
    
    // Clothing
    { id: 'cloth_1', text: '拖鞋', category: 'clothing', checked: false },
    { id: 'cloth_2', text: '睡衣', category: 'clothing', checked: false },
    { id: 'cloth_3', text: '外套(厚,薄)', category: 'clothing', checked: false },
    { id: 'cloth_4', text: '大褸', category: 'clothing', checked: false },
    { id: 'cloth_5', text: '頸巾', category: 'clothing', checked: false },
    { id: 'cloth_6', text: '衫', category: 'clothing', checked: false },
    { id: 'cloth_7', text: '褲', category: 'clothing', checked: false },
    { id: 'cloth_8', text: '襪', category: 'clothing', checked: false },
    { id: 'cloth_9', text: '內衣褲', category: 'clothing', checked: false },
    
    // Food & Drinks
    { id: 'food_1', text: '零食', category: 'food', checked: false },
    { id: 'food_2', text: '早餐', category: 'food', checked: false },
    { id: 'food_3', text: '水', category: 'food', checked: false },
    
    // Medicine
    { id: 'med_1', text: '止暈', category: 'medicine', checked: false },
    { id: 'med_2', text: '幸福傷風素', category: 'medicine', checked: false },
    { id: 'med_3', text: '必理痛', category: 'medicine', checked: false },
    { id: 'med_4', text: '白花油', category: 'medicine', checked: false },
    { id: 'med_5', text: '蚊膏', category: 'medicine', checked: false },
    { id: 'med_6', text: '口罩', category: 'medicine', checked: false },
    { id: 'med_7', text: '夏桑菊葛根湯', category: 'medicine', checked: false }
];

// Category display names
const categoryNames = {
    documents: '證件',
    money: '金錢',
    electronics: '電子產品',
    bags: '袋/收納',
    toiletries: '洗漱用品',
    personal: '個人護理',
    sun: '防曬/配件',
    clothing: '衣物',
    food: '食物/飲品',
    medicine: '藥品'
};

// Checklist state
let checklistItems = [];

// Storage key for global checklist
const CHECKLIST_STORAGE_KEY = 'trip_planner_checklist';

// Load checklist from localStorage
function loadChecklist() {
    const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    
    if (saved) {
        checklistItems = JSON.parse(saved);
    } else {
        // Use default items
        checklistItems = JSON.parse(JSON.stringify(defaultChecklistItems));
        saveChecklist();
    }
    renderChecklist();
}

// Save checklist to localStorage
function saveChecklist() {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklistItems));
    updateProgress();
}

// Render checklist items
function renderChecklist() {
    const container = document.getElementById('checklist-items');
    if (!container) return;
    
    // Group items by category
    const categories = {};
    checklistItems.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = [];
        }
        categories[item.category].push(item);
    });
    
    // Render each category
    let html = '';
    for (const [category, items] of Object.entries(categories)) {
        html += `
            <div class="checklist-category">
                <div class="checklist-category-title">${categoryNames[category] || category}</div>
                ${items.map(item => renderChecklistItem(item)).join('')}
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Setup swipe handlers
    setupSwipeHandlers();
    
    // Update progress
    updateProgress();
    
    // Refresh Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Render single checklist item
function renderChecklistItem(item) {
    return `
        <div class="checklist-item-wrapper" data-item-id="${item.id}">
            <div class="checklist-item ${item.checked ? 'checked' : ''}">
                <div class="checklist-checkbox">
                    <i data-lucide="check"></i>
                </div>
                <span class="checklist-item-text">${item.text}</span>
            </div>
            <div class="checklist-delete-action">
                <i data-lucide="trash-2"></i>
            </div>
        </div>
    `;
}

// Setup swipe handlers for delete
function setupSwipeHandlers() {
    const items = document.querySelectorAll('.checklist-item');
    
    items.forEach(item => {
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        
        const wrapper = item.closest('.checklist-item-wrapper');
        
        // Touch start
        item.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
            item.classList.add('swiping');
        });
        
        // Touch move
        item.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            currentX = e.touches[0].clientX;
            const diffX = startX - currentX;
            
            // Only allow swipe left
            if (diffX > 0) {
                const translateX = Math.min(diffX, 80);
                item.style.transform = `translateX(-${translateX}px)`;
            }
        });
        
        // Touch end
        item.addEventListener('touchend', (e) => {
            isSwiping = false;
            item.classList.remove('swiping');
            
            const diffX = startX - currentX;
            
            if (diffX > 60) {
                // Show delete action
                item.classList.add('swiped');
            } else {
                // Reset position
                item.style.transform = '';
                item.classList.remove('swiped');
            }
        });
        
        // Click to toggle check
        item.addEventListener('click', (e) => {
            // Don't toggle if swiped
            if (item.classList.contains('swiped')) {
                item.classList.remove('swiped');
                item.style.transform = '';
                return;
            }
            
            const itemId = wrapper.dataset.itemId;
            toggleItemCheck(itemId);
        });
        
        // Delete action
        const deleteAction = wrapper.querySelector('.checklist-delete-action');
        deleteAction.addEventListener('click', (e) => {
            e.stopPropagation();
            const itemId = wrapper.dataset.itemId;
            deleteChecklistItem(itemId);
        });
    });
}

// Toggle item checked state
function toggleItemCheck(itemId) {
    const item = checklistItems.find(i => i.id === itemId);
    if (item) {
        item.checked = !item.checked;
        saveChecklist();
        
        // Update UI
        const wrapper = document.querySelector(`[data-item-id="${itemId}"]`);
        const itemEl = wrapper.querySelector('.checklist-item');
        if (item.checked) {
            itemEl.classList.add('checked');
        } else {
            itemEl.classList.remove('checked');
        }
    }
}

// Delete item
function deleteChecklistItem(itemId) {
    checklistItems = checklistItems.filter(i => i.id !== itemId);
    saveChecklist();
    renderChecklist();
}

// Add new item
function addChecklistItem(text, category = 'personal') {
    const newItem = {
        id: 'item_' + Date.now(),
        text: text,
        category: category,
        checked: false
    };
    checklistItems.push(newItem);
    saveChecklist();
    renderChecklist();
}

// Update progress display
function updateProgress() {
    const checkedCount = document.getElementById('checked-count');
    const totalCount = document.getElementById('total-count');
    
    if (checkedCount && totalCount) {
        const checked = checklistItems.filter(i => i.checked).length;
        const total = checklistItems.length;
        
        checkedCount.textContent = checked;
        totalCount.textContent = total;
    }
}

// Setup add item form
function setupAddItemForm() {
    const addBtn = document.getElementById('add-checklist-item-btn');
    const container = document.querySelector('.checklist-container');
    
    if (addBtn && container) {
        addBtn.addEventListener('click', () => {
            // Check if form already exists
            let formContainer = document.querySelector('.add-item-form-container');
            if (formContainer) {
                formContainer.remove();
                return;
            }
            
            // Create form
            formContainer = document.createElement('div');
            formContainer.className = 'add-item-form-container';
            formContainer.innerHTML = `
                <div class="add-item-form">
                    <input type="text" class="add-item-input" placeholder="Enter item name" id="new-item-input">
                    <select id="new-item-category" class="datetime-select" style="width: auto;">
                        <option value="documents">${categoryNames.documents}</option>
                        <option value="money">${categoryNames.money}</option>
                        <option value="electronics">${categoryNames.electronics}</option>
                        <option value="bags">${categoryNames.bags}</option>
                        <option value="toiletries">${categoryNames.toiletries}</option>
                        <option value="personal" selected>${categoryNames.personal}</option>
                        <option value="sun">${categoryNames.sun}</option>
                        <option value="clothing">${categoryNames.clothing}</option>
                        <option value="food">${categoryNames.food}</option>
                        <option value="medicine">${categoryNames.medicine}</option>
                    </select>
                    <button type="button" class="btn-primary" id="confirm-add-item" style="padding: 12px;">
                        <i data-lucide="plus"></i>
                    </button>
                </div>
            `;
            
            // Insert after header
            const header = container.querySelector('.checklist-header');
            header.insertAdjacentElement('afterend', formContainer);
            
            // Focus input
            document.getElementById('new-item-input').focus();
            
            // Refresh Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Handle add
            document.getElementById('confirm-add-item').addEventListener('click', () => {
                const input = document.getElementById('new-item-input');
                const categorySelect = document.getElementById('new-item-category');
                const text = input.value.trim();
                
                if (text) {
                    addChecklistItem(text, categorySelect.value);
                    formContainer.remove();
                }
            });
            
            // Handle enter key
            document.getElementById('new-item-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const input = document.getElementById('new-item-input');
                    const categorySelect = document.getElementById('new-item-category');
                    const text = input.value.trim();
                    
                    if (text) {
                        addChecklistItem(text, categorySelect.value);
                        formContainer.remove();
                    }
                }
            });
        });
    }
}

// Initialize checklist
function initChecklist() {
    loadChecklist();
    setupAddItemForm();
}

// Export functions
window.Checklist = {
    init: initChecklist,
    load: loadChecklist,
    render: renderChecklist,
    addItem: addChecklistItem,
    deleteItem: deleteChecklistItem,
    toggleCheck: toggleItemCheck
};
