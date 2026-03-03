// Expense Tracker Module

// Expense wizard state
let expenseWizardState = {
    currentStep: 1,
    totalSteps: 4,
    isEditing: false,
    editingExpenseId: null,
    data: {
        category: null,
        itemName: '',
        amount: 0,
        currency: 'JPY',
        exchangeRate: 0.053,
        amountHKD: 0,
        linkedEventId: null,
        payers: [],
        date: null,
        time: null,
        notes: ''
    }
};

// Initialize expense tracker
function initExpenseTracker() {
    // Load expense settings
    Storage.loadExpenseSettings();
    
    // Set up event listeners
    setupExpenseEventListeners();
    
    // Set default currency from settings
    const settings = Storage.expenseSettings;
    if (settings.defaultCurrency) {
        expenseWizardState.data.currency = settings.defaultCurrency;
    }
}

// Set up event listeners for expense tracker
function setupExpenseEventListeners() {
    // Add expense button
    const addExpenseBtn = document.getElementById('add-expense-btn');
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', () => openExpenseModal());
    }
    
    // Expense modal close buttons
    document.querySelectorAll('[data-close-expense-modal]').forEach(el => {
        el.addEventListener('click', closeExpenseModal);
    });
    
    // Expense wizard navigation
    const expenseBackBtn = document.getElementById('expense-wizard-back');
    const expenseNextBtn = document.getElementById('expense-wizard-next');
    const expenseSubmitBtn = document.getElementById('expense-wizard-submit');
    const expenseCancelBtn = document.getElementById('expense-wizard-cancel');
    
    if (expenseBackBtn) expenseBackBtn.addEventListener('click', expenseWizardPrevStep);
    if (expenseNextBtn) expenseNextBtn.addEventListener('click', expenseWizardNextStep);
    if (expenseSubmitBtn) expenseSubmitBtn.addEventListener('click', submitExpense);
    if (expenseCancelBtn) expenseCancelBtn.addEventListener('click', closeExpenseModal);
    
    // Category selection
    const categoryGrid = document.getElementById('expense-category-grid');
    if (categoryGrid) {
        categoryGrid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                categoryGrid.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                expenseWizardState.data.category = card.dataset.expenseCategory;
            });
        });
    }
    
    // Amount and currency inputs
    const amountInput = document.getElementById('expense-amount');
    const currencySelect = document.getElementById('expense-currency');
    const exchangeRateInput = document.getElementById('expense-exchange-rate');
    
    if (amountInput) {
        amountInput.addEventListener('input', updateExpenseAmountHKD);
    }
    
    if (currencySelect) {
        currencySelect.addEventListener('change', (e) => {
            expenseWizardState.data.currency = e.target.value;
            updateCurrencySymbol();
            updateExchangeRate();
            updateExpenseAmountHKD();
        });
    }
    
    if (exchangeRateInput) {
        exchangeRateInput.addEventListener('input', (e) => {
            expenseWizardState.data.exchangeRate = parseFloat(e.target.value) || 0;
            document.getElementById('rate-value').textContent = expenseWizardState.data.exchangeRate.toFixed(4);
            updateExpenseAmountHKD();
        });
    }
    
    // Item name input
    const itemNameInput = document.getElementById('expense-item-name');
    if (itemNameInput) {
        itemNameInput.addEventListener('input', (e) => {
            expenseWizardState.data.itemName = e.target.value;
        });
    }
    
    // Time picker for expense
    setupExpenseTimePicker();
    
    // Date scroller buttons for expense
    const dateScrollLeft = document.getElementById('expense-date-scroll-left');
    const dateScrollRight = document.getElementById('expense-date-scroll-right');
    if (dateScrollLeft) dateScrollLeft.addEventListener('click', () => scrollExpenseDates(-1));
    if (dateScrollRight) dateScrollRight.addEventListener('click', () => scrollExpenseDates(1));
    
    // Expense detail modal close buttons
    document.querySelectorAll('[data-close-expense-detail-modal]').forEach(el => {
        el.addEventListener('click', closeExpenseDetailModal);
    });
    
    // Delete and edit expense buttons
    const deleteExpenseBtn = document.getElementById('delete-expense');
    const editExpenseBtn = document.getElementById('edit-expense');
    
    if (deleteExpenseBtn) {
        deleteExpenseBtn.addEventListener('click', handleDeleteExpense);
    }
    
    if (editExpenseBtn) {
        editExpenseBtn.addEventListener('click', handleEditExpense);
    }
    
    // View linked event button
    const viewLinkedEventBtn = document.getElementById('view-linked-event-btn');
    if (viewLinkedEventBtn) {
        viewLinkedEventBtn.addEventListener('click', () => {
            const linkedEventId = viewLinkedEventBtn.dataset.eventId;
            if (linkedEventId) {
                closeExpenseDetailModal();
                showEventDetail(linkedEventId);
            }
        });
    }
}

// Setup expense time picker listeners
function setupExpenseTimePicker() {
    // Hour controls
    const hourUpBtn = document.querySelector('[data-target="expense-hour-up"]');
    const hourDownBtn = document.querySelector('[data-target="expense-hour-down"]');
    const minuteUpBtn = document.querySelector('[data-target="expense-minute-up"]');
    const minuteDownBtn = document.querySelector('[data-target="expense-minute-down"]');
    const ampmBtn = document.getElementById('expense-ampm');
    
    if (hourUpBtn) {
        hourUpBtn.addEventListener('click', () => {
            let hour = parseInt(document.getElementById('expense-hour').textContent);
            hour = hour >= 12 ? 1 : hour + 1;
            document.getElementById('expense-hour').textContent = hour.toString().padStart(2, '0');
        });
    }
    
    if (hourDownBtn) {
        hourDownBtn.addEventListener('click', () => {
            let hour = parseInt(document.getElementById('expense-hour').textContent);
            hour = hour <= 1 ? 12 : hour - 1;
            document.getElementById('expense-hour').textContent = hour.toString().padStart(2, '0');
        });
    }
    
    if (minuteUpBtn) {
        minuteUpBtn.addEventListener('click', () => {
            let minute = parseInt(document.getElementById('expense-minute').textContent);
            minute = minute >= 45 ? 0 : minute + 15;
            document.getElementById('expense-minute').textContent = minute.toString().padStart(2, '0');
        });
    }
    
    if (minuteDownBtn) {
        minuteDownBtn.addEventListener('click', () => {
            let minute = parseInt(document.getElementById('expense-minute').textContent);
            minute = minute <= 0 ? 45 : minute - 15;
            document.getElementById('expense-minute').textContent = minute.toString().padStart(2, '0');
        });
    }
    
    if (ampmBtn) {
        ampmBtn.addEventListener('click', () => {
            ampmBtn.textContent = ampmBtn.textContent === 'AM' ? 'PM' : 'AM';
        });
    }
}

// Generate expense date buttons
function generateExpenseDateButtons() {
    const dateScroller = document.getElementById('expense-date-scroller');
    if (!dateScroller) return;
    
    dateScroller.innerHTML = '';
    
    const currentTrip = Storage.currentTrip;
    let startDate, endDate;
    
    if (currentTrip.startDate && currentTrip.endDate) {
        startDate = new Date(currentTrip.startDate);
        endDate = new Date(currentTrip.endDate);
    } else {
        // Default: next 30 days
        startDate = new Date();
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
    }
    
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateBtn = document.createElement('button');
        dateBtn.className = 'date-btn';
        dateBtn.dataset.date = d.toISOString().split('T')[0];
        
        const dayName = dayNames[d.getDay()];
        const dateNum = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' });
        
        dateBtn.innerHTML = `
            <span class="date-day">${dayName}</span>
            <span class="date-date">${month} ${dateNum}</span>
        `;
        
        // Select today by default or previously selected date
        const today = new Date().toISOString().split('T')[0];
        if (expenseWizardState.data.date) {
            if (dateBtn.dataset.date === expenseWizardState.data.date) {
                dateBtn.classList.add('selected');
            }
        } else if (dateBtn.dataset.date === today) {
            dateBtn.classList.add('selected');
            expenseWizardState.data.date = today;
        }
        
        dateBtn.addEventListener('click', () => {
            dateScroller.querySelectorAll('.date-btn').forEach(b => b.classList.remove('selected'));
            dateBtn.classList.add('selected');
            expenseWizardState.data.date = dateBtn.dataset.date;
        });
        
        dateScroller.appendChild(dateBtn);
    }
}

// Scroll expense dates
function scrollExpenseDates(direction) {
    const dateScroller = document.getElementById('expense-date-scroller');
    if (!dateScroller) return;
    
    const scrollAmount = 150;
    dateScroller.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// Open expense modal
function openExpenseModal(editMode = false) {
    const modal = document.getElementById('expense-modal');
    if (!modal) return;
    
    // Check if trip is selected
    if (!Storage.currentTrip.id) {
        alert('Please select or create a trip first');
        return;
    }
    
    modal.classList.remove('hidden');
    
    if (!editMode) {
        resetExpenseWizard();
    }
    
    // Initialize step 1
    updateExpenseWizardUI();
    lucide.createIcons();
}

// Close expense modal
function closeExpenseModal() {
    const modal = document.getElementById('expense-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    resetExpenseWizard();
}

// Reset expense wizard
function resetExpenseWizard() {
    expenseWizardState = {
        currentStep: 1,
        totalSteps: 4,
        isEditing: false,
        editingExpenseId: null,
        data: {
            category: null,
            itemName: '',
            amount: 0,
            currency: Storage.expenseSettings.defaultCurrency || 'JPY',
            exchangeRate: currencyOptions[Storage.expenseSettings.defaultCurrency]?.rate || 0.053,
            amountHKD: 0,
            linkedEventId: null,
            payers: [],
            date: null,
            time: null,
            notes: ''
        }
    };
    
    // Reset UI
    document.querySelectorAll('#expense-category-grid .category-card').forEach(c => c.classList.remove('selected'));
    
    const itemNameInput = document.getElementById('expense-item-name');
    const amountInput = document.getElementById('expense-amount');
    const currencySelect = document.getElementById('expense-currency');
    const exchangeRateInput = document.getElementById('expense-exchange-rate');
    const linkedEventSelect = document.getElementById('expense-linked-event');
    const dateInput = document.getElementById('expense-date');
    const timeInput = document.getElementById('expense-time');
    const notesInput = document.getElementById('expense-notes');
    
    if (itemNameInput) itemNameInput.value = '';
    if (amountInput) amountInput.value = '';
    if (currencySelect) currencySelect.value = expenseWizardState.data.currency;
    if (exchangeRateInput) exchangeRateInput.value = expenseWizardState.data.exchangeRate;
    if (linkedEventSelect) linkedEventSelect.value = '';
    if (dateInput) dateInput.value = '';
    if (timeInput) timeInput.value = '';
    if (notesInput) notesInput.value = '';
    
    updateCurrencySymbol();
    updateExpenseAmountHKD();
}

// Update currency symbol display
function updateCurrencySymbol() {
    const symbolEl = document.getElementById('expense-currency-symbol');
    const fromCurrencyEl = document.getElementById('from-currency');
    const currency = expenseWizardState.data.currency;
    const currencyInfo = currencyOptions[currency];
    
    if (symbolEl && currencyInfo) {
        symbolEl.textContent = currencyInfo.symbol;
    }
    if (fromCurrencyEl) {
        fromCurrencyEl.textContent = currency;
    }
}

// Update exchange rate based on selected currency
function updateExchangeRate() {
    const currency = expenseWizardState.data.currency;
    const settings = Storage.expenseSettings;
    
    // Get rate from settings or default
    let rate = settings.exchangeRates?.[currency]?.rate || currencyOptions[currency]?.rate || 1;
    
    expenseWizardState.data.exchangeRate = rate;
    
    const exchangeRateInput = document.getElementById('expense-exchange-rate');
    const rateValueEl = document.getElementById('rate-value');
    
    if (exchangeRateInput) {
        exchangeRateInput.value = rate;
    }
    if (rateValueEl) {
        rateValueEl.textContent = rate.toFixed(4);
    }
}

// Update HKD amount
function updateExpenseAmountHKD() {
    const amountInput = document.getElementById('expense-amount');
    const amountHKDEl = document.getElementById('expense-amount-hkd');
    
    const amount = parseFloat(amountInput?.value) || 0;
    const rate = expenseWizardState.data.exchangeRate;
    
    expenseWizardState.data.amount = amount;
    expenseWizardState.data.amountHKD = amount * rate;
    
    if (amountHKDEl) {
        amountHKDEl.textContent = '$' + expenseWizardState.data.amountHKD.toFixed(2);
    }
}

// Populate events dropdown for linking
function populateEventsForLinking() {
    const select = document.getElementById('expense-linked-event');
    if (!select) return;
    
    select.innerHTML = '<option value="">No event</option>';
    
    const events = Storage.events;
    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = `${event.name} - ${event.location || 'No location'}`;
        select.appendChild(option);
    });
}

// Populate payers list
function populatePayersList() {
    const payerList = document.getElementById('payer-list');
    if (!payerList) return;
    
    payerList.innerHTML = '';
    
    const persons = Storage.expenseSettings.persons || ['Person 1', 'Person 2'];
    
    persons.forEach((person, index) => {
        const payerItem = document.createElement('label');
        payerItem.className = 'payer-item';
        payerItem.innerHTML = `
            <input type="checkbox" value="${index}" class="payer-checkbox">
            <span class="payer-name">${person}</span>
        `;
        
        const checkbox = payerItem.querySelector('.payer-checkbox');
        checkbox.addEventListener('change', updatePayerSelection);
        
        payerList.appendChild(payerItem);
    });
    
    updatePayerSelection();
}

// Update payer selection
function updatePayerSelection() {
    const checkboxes = document.querySelectorAll('.payer-checkbox');
    const selectedPayers = [];
    
    checkboxes.forEach((cb, index) => {
        if (cb.checked) {
            selectedPayers.push(index);
        }
        // Update visual state
        const payerItem = cb.closest('.payer-item');
        if (payerItem) {
            payerItem.classList.toggle('selected', cb.checked);
        }
    });
    
    expenseWizardState.data.payers = selectedPayers;
    
    // Update split summary
    updateSplitSummary();
}

// Update split summary
function updateSplitSummary() {
    const splitSummary = document.getElementById('split-summary');
    if (!splitSummary) return;
    
    const payers = expenseWizardState.data.payers;
    const amountHKD = expenseWizardState.data.amountHKD;
    const persons = Storage.expenseSettings.persons || ['Person 1', 'Person 2'];
    
    if (payers.length === 0) {
        splitSummary.innerHTML = '<p class="split-hint">Select at least one payer</p>';
        return;
    }
    
    const perPerson = amountHKD / payers.length;
    
    let html = `<div class="split-amounts">
        <p class="split-total">Total: HKD $${amountHKD.toFixed(2)}</p>
        <p class="split-per-person">Per person: HKD $${perPerson.toFixed(2)}</p>
    </div>`;
    
    html += '<div class="payer-breakdown">';
    payers.forEach(payerIndex => {
        html += `<span class="payer-tag">${persons[payerIndex]}: HKD $${perPerson.toFixed(2)}</span>`;
    });
    html += '</div>';
    
    splitSummary.innerHTML = html;
}

// Navigate to next step
function expenseWizardNextStep() {
    if (!validateExpenseStep(expenseWizardState.currentStep)) {
        return;
    }
    
    if (expenseWizardState.currentStep < expenseWizardState.totalSteps) {
        expenseWizardState.currentStep++;
        updateExpenseWizardUI();
    }
}

// Navigate to previous step
function expenseWizardPrevStep() {
    if (expenseWizardState.currentStep > 1) {
        expenseWizardState.currentStep--;
        updateExpenseWizardUI();
    }
}

// Validate current step
function validateExpenseStep(step) {
    const t = translations[Storage.currentLang] || translations.en;
    
    switch (step) {
        case 1:
            if (!expenseWizardState.data.category) {
                alert(t.selectCategory || 'Please select a category');
                return false;
            }
            return true;
            
        case 2:
            if (!expenseWizardState.data.itemName) {
                alert(t.enterItemName || 'Please enter item name');
                return false;
            }
            if (!expenseWizardState.data.amount || expenseWizardState.data.amount <= 0) {
                alert(t.enterAmount || 'Please enter a valid amount');
                return false;
            }
            // Save linked event and other data
            const linkedEventSelect = document.getElementById('expense-linked-event');
            expenseWizardState.data.linkedEventId = linkedEventSelect?.value || null;
            return true;
            
        case 3:
            if (expenseWizardState.data.payers.length === 0) {
                alert(t.selectPayer || 'Please select at least one payer');
                return false;
            }
            // Save date, time, notes
            // Date is already saved in expenseWizardState.data.date from the date scroller
            // Time from time picker
            const hour = document.getElementById('expense-hour')?.textContent || '12';
            const minute = document.getElementById('expense-minute')?.textContent || '00';
            const ampm = document.getElementById('expense-ampm')?.textContent || 'PM';
            
            // Convert to 24-hour format for storage
            let hour24 = parseInt(hour);
            if (ampm === 'PM' && hour24 !== 12) {
                hour24 = hour24 + 12;
            } else if (ampm === 'AM' && hour24 === 12) {
                hour24 = 0;
            }
            
            expenseWizardState.data.time = `${hour24.toString().padStart(2, '0')}:${minute}`;
            
            const notesInput = document.getElementById('expense-notes');
            expenseWizardState.data.notes = notesInput?.value || '';
            return true;
            
        default:
            return true;
    }
}

// Update wizard UI
function updateExpenseWizardUI() {
    const t = translations[Storage.currentLang] || translations.en;
    
    // Update progress
    const progressFill = document.getElementById('expense-progress-fill');
    const steps = document.querySelectorAll('#expense-modal .wizard-step');
    
    if (progressFill) {
        progressFill.style.width = `${(expenseWizardState.currentStep / expenseWizardState.totalSteps) * 100}%`;
    }
    
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < expenseWizardState.currentStep) {
            step.classList.add('completed');
        } else if (index + 1 === expenseWizardState.currentStep) {
            step.classList.add('active');
        }
    });
    
    // Show/hide step content
    document.querySelectorAll('#expense-modal .wizard-step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const currentContent = document.querySelector(`#expense-modal .wizard-step-content[data-step="${expenseWizardState.currentStep}"]`);
    if (currentContent) {
        currentContent.classList.add('active');
    }
    
    // Update navigation buttons
    const backBtn = document.getElementById('expense-wizard-back');
    const nextBtn = document.getElementById('expense-wizard-next');
    const submitBtn = document.getElementById('expense-wizard-submit');
    
    if (backBtn) {
        backBtn.classList.toggle('hidden', expenseWizardState.currentStep === 1);
    }
    
    if (nextBtn && submitBtn) {
        if (expenseWizardState.currentStep === expenseWizardState.totalSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
            submitBtn.textContent = expenseWizardState.isEditing ? 'Update Expense' : 'Add Expense';
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }
    
    // Update step headers with translations
    updateExpenseStepHeaders();
    
    // Step-specific initialization
    if (expenseWizardState.currentStep === 2) {
        populateEventsForLinking();
        updateCurrencySymbol();
        updateExchangeRate();
    } else if (expenseWizardState.currentStep === 3) {
        populatePayersList();
        generateExpenseDateButtons();
    } else if (expenseWizardState.currentStep === 4) {
        updateExpenseReviewCard();
    }
    
    lucide.createIcons();
}

// Update step headers with translations
function updateExpenseStepHeaders() {
    const t = translations[Storage.currentLang] || translations.en;
    
    const stepHeaders = {
        1: { title: t.expStep1Title, subtitle: t.expStep1Subtitle },
        2: { title: t.expStep2Title, subtitle: t.expStep2Subtitle },
        3: { title: t.expStep3Title, subtitle: t.expStep3Subtitle },
        4: { title: t.expStep4Title, subtitle: t.expStep4Subtitle }
    };
    
    Object.entries(stepHeaders).forEach(([step, texts]) => {
        const content = document.querySelector(`#expense-modal .wizard-step-content[data-step="${step}"]`);
        if (content) {
            const title = content.querySelector('.step-header h4');
            const subtitle = content.querySelector('.step-header p');
            if (title) title.textContent = texts.title;
            if (subtitle) subtitle.textContent = texts.subtitle;
        }
    });
}

// Update expense review card
function updateExpenseReviewCard() {
    const t = translations[Storage.currentLang] || translations.en;
    const data = expenseWizardState.data;
    const category = expenseCategories[data.category];
    const persons = Storage.expenseSettings.persons || ['Person 1', 'Person 2'];
    
    // Category badge
    const badgeIcon = document.querySelector('#review-expense-category-badge .review-category-icon');
    const badgeName = document.querySelector('#review-expense-category-badge .review-category-name');
    const badgeEl = document.getElementById('review-expense-category-badge');
    
    if (badgeIcon) badgeIcon.textContent = category.icon;
    if (badgeName) badgeName.textContent = t[`exp${data.category.charAt(0).toUpperCase() + data.category.slice(1)}`] || data.category;
    if (badgeEl) badgeEl.style.background = category.color;
    
    // Item name
    const itemName = document.getElementById('review-expense-item-name');
    if (itemName) itemName.textContent = data.itemName;
    
    // Amounts
    const currencyInfo = currencyOptions[data.currency];
    const originalAmount = document.getElementById('review-original-amount');
    const convertedAmount = document.getElementById('review-converted-amount');
    
    if (originalAmount) {
        originalAmount.textContent = `${currencyInfo.symbol}${data.amount.toLocaleString()}`;
    }
    if (convertedAmount) {
        convertedAmount.textContent = `≈ HKD $${data.amountHKD.toFixed(2)}`;
    }
    
    // Payers
    const payersEl = document.getElementById('review-payers');
    if (payersEl) {
        const payerNames = data.payers.map(i => persons[i]).join(', ');
        payersEl.textContent = `${t.paidBy}: ${payerNames}`;
    }
    
    // Date
    const dateContainer = document.getElementById('review-date-container');
    const dateEl = document.getElementById('review-expense-date');
    if (data.date) {
        const date = new Date(data.date);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[date.getDay()];
        dateEl.textContent = `${dayName}, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        dateContainer.classList.remove('hidden');
    } else {
        dateContainer.classList.add('hidden');
    }
    
    // Linked event
    const linkedEventContainer = document.getElementById('review-linked-event-container');
    const linkedEventEl = document.getElementById('review-linked-event');
    if (data.linkedEventId) {
        const linkedEvent = Storage.events.find(e => e.id === data.linkedEventId);
        if (linkedEvent) {
            linkedEventEl.textContent = `${t.linkedEvent}: ${linkedEvent.name}`;
            linkedEventContainer.classList.remove('hidden');
        } else {
            linkedEventContainer.classList.add('hidden');
        }
    } else {
        linkedEventContainer.classList.add('hidden');
    }
    
    // Notes
    const notesContainer = document.getElementById('review-expense-notes-container');
    const notesEl = document.getElementById('review-expense-notes');
    if (data.notes) {
        notesEl.textContent = data.notes;
        notesContainer.classList.remove('hidden');
    } else {
        notesContainer.classList.add('hidden');
    }
}

// Submit expense
function submitExpense() {
    const data = expenseWizardState.data;
    
    const expense = {
        category: data.category,
        itemName: data.itemName,
        amount: data.amount,
        currency: data.currency,
        exchangeRate: data.exchangeRate,
        amountHKD: data.amountHKD,
        linkedEventId: data.linkedEventId,
        payers: data.payers,
        date: data.date,
        time: data.time,
        notes: data.notes
    };
    
    if (expenseWizardState.isEditing && expenseWizardState.editingExpenseId) {
        Storage.updateExpense(expenseWizardState.editingExpenseId, expense);
    } else {
        Storage.addExpense(expense);
    }
    
    closeExpenseModal();
    renderExpenses();
    updateExpenseSummary();
}

// Render expenses list
function renderExpenses() {
    const expenseList = document.getElementById('expense-list');
    const emptyState = document.getElementById('expense-empty-state');
    
    if (!expenseList) return;
    
    const expenses = Storage.expenses;
    
    if (expenses.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        expenseList.querySelectorAll('.expense-date-group').forEach(g => g.remove());
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    // Clear existing list
    expenseList.querySelectorAll('.expense-date-group').forEach(g => g.remove());
    
    // Sort expenses by date (newest first), then by category
    const sortedExpenses = [...expenses].sort((a, b) => {
        // Items without date go to the end
        if (!a.date && !b.date) {
            return a.category.localeCompare(b.category);
        }
        if (!a.date) return 1;
        if (!b.date) return -1;
        
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        
        return a.category.localeCompare(b.category);
    });
    
    // Group by date
    const groupedExpenses = {};
    sortedExpenses.forEach(expense => {
        const dateKey = expense.date || 'no-date';
        if (!groupedExpenses[dateKey]) {
            groupedExpenses[dateKey] = [];
        }
        groupedExpenses[dateKey].push(expense);
    });
    
    // Render groups
    Object.entries(groupedExpenses).forEach(([dateKey, groupExpenses]) => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'expense-date-group';
        
        // Date header
        if (dateKey !== 'no-date') {
            const dateHeader = document.createElement('div');
            dateHeader.className = 'expense-date-header';
            const date = new Date(dateKey);
            dateHeader.textContent = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            dateGroup.appendChild(dateHeader);
        }
        
        // Expense items
        groupExpenses.forEach(expense => {
            const item = createExpenseItem(expense);
            dateGroup.appendChild(item);
        });
        
        expenseList.appendChild(dateGroup);
    });
    
    lucide.createIcons();
}

// Create expense item element
function createExpenseItem(expense) {
    const t = translations[Storage.currentLang] || translations.en;
    const category = expenseCategories[expense.category];
    const currencyInfo = currencyOptions[expense.currency];
    const persons = Storage.expenseSettings.persons || ['Person 1', 'Person 2'];
    
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.dataset.expenseId = expense.id;
    item.style.borderLeftColor = category.color;
    
    const payerNames = expense.payers.map(i => persons[i]).join(', ');
    
    let linkedEventHtml = '';
    if (expense.linkedEventId) {
        const linkedEvent = Storage.events.find(e => e.id === expense.linkedEventId);
        if (linkedEvent) {
            linkedEventHtml = `
                <div class="expense-linked-event">
                    <i data-lucide="link"></i>
                    <span>${linkedEvent.name}</span>
                </div>
            `;
        }
    }
    
    item.innerHTML = `
        <div class="expense-item-header">
            <span class="expense-category-icon">${category.icon}</span>
            <span class="expense-item-name">${expense.itemName}</span>
        </div>
        <div class="expense-item-amounts">
            <span class="expense-original-amount">${currencyInfo.symbol}${expense.amount.toLocaleString()}</span>
            <span class="expense-converted-amount">HKD $${expense.amountHKD.toFixed(2)}</span>
        </div>
        <div class="expense-item-meta">
            <span class="expense-payer">
                <i data-lucide="user"></i>
                ${payerNames}
            </span>
        </div>
        ${linkedEventHtml}
    `;
    
    item.addEventListener('click', () => showExpenseDetail(expense.id));
    
    return item;
}

// Show expense detail modal
function showExpenseDetail(expenseId) {
    const expense = Storage.getExpenseById(expenseId);
    if (!expense) return;
    
    const modal = document.getElementById('expense-detail-modal');
    if (!modal) return;
    
    const t = translations[Storage.currentLang] || translations.en;
    const category = expenseCategories[expense.category];
    const currencyInfo = currencyOptions[expense.currency];
    const persons = Storage.expenseSettings.persons || ['Person 1', 'Person 2'];
    
    // Category badge
    const badge = document.getElementById('detail-expense-category-badge');
    if (badge) {
        badge.style.background = category.color;
        badge.querySelector('.category-icon').textContent = category.icon;
        badge.querySelector('.category-name').textContent = t[`exp${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}`] || expense.category;
    }
    
    // Item name
    document.getElementById('detail-expense-item-name').textContent = expense.itemName;
    
    // Amounts
    document.getElementById('detail-original-amount').textContent = `${currencyInfo.symbol}${expense.amount.toLocaleString()} ${expense.currency}`;
    document.getElementById('detail-converted-amount').textContent = `≈ HKD $${expense.amountHKD.toFixed(2)}`;
    
    // Payers
    const payerNames = expense.payers.map(i => persons[i]).join(', ');
    document.getElementById('detail-payers').textContent = payerNames;
    
    // Date
    const dateItem = document.querySelector('#detail-expense-date').closest('.detail-item');
    if (expense.date) {
        const date = new Date(expense.date);
        document.getElementById('detail-expense-date').textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        dateItem.classList.remove('hidden');
    } else {
        dateItem.classList.add('hidden');
    }
    
    // Linked event
    const linkedEventItem = document.getElementById('detail-linked-event-item');
    if (expense.linkedEventId) {
        const linkedEvent = Storage.events.find(e => e.id === expense.linkedEventId);
        if (linkedEvent) {
            document.getElementById('detail-linked-event-name').textContent = linkedEvent.name;
            document.getElementById('view-linked-event-btn').dataset.eventId = expense.linkedEventId;
            linkedEventItem.classList.remove('hidden');
        } else {
            linkedEventItem.classList.add('hidden');
        }
    } else {
        linkedEventItem.classList.add('hidden');
    }
    
    // Notes
    const notesItem = document.getElementById('detail-expense-notes-item');
    if (expense.notes) {
        document.getElementById('detail-expense-notes').textContent = expense.notes;
        notesItem.classList.remove('hidden');
    } else {
        notesItem.classList.add('hidden');
    }
    
    // Store expense ID for edit/delete
    modal.dataset.expenseId = expenseId;
    
    modal.classList.remove('hidden');
    lucide.createIcons();
}

// Close expense detail modal
function closeExpenseDetailModal() {
    const modal = document.getElementById('expense-detail-modal');
    if (modal) {
        modal.classList.add('hidden');
        delete modal.dataset.expenseId;
    }
}

// Handle delete expense
function handleDeleteExpense() {
    const modal = document.getElementById('expense-detail-modal');
    const expenseId = modal?.dataset.expenseId;
    
    if (!expenseId) return;
    
    if (confirm('Are you sure you want to delete this expense?')) {
        Storage.deleteExpense(expenseId);
        closeExpenseDetailModal();
        renderExpenses();
        updateExpenseSummary();
    }
}

// Handle edit expense
function handleEditExpense() {
    const modal = document.getElementById('expense-detail-modal');
    const expenseId = modal?.dataset.expenseId;
    
    if (!expenseId) return;
    
    const expense = Storage.getExpenseById(expenseId);
    if (!expense) return;
    
    closeExpenseDetailModal();
    
    // Set up wizard for editing
    expenseWizardState.isEditing = true;
    expenseWizardState.editingExpenseId = expenseId;
    expenseWizardState.data = { ...expense };
    
    openExpenseModal(true);
    
    // Populate form fields
    setTimeout(() => {
        // Step 1 - Category
        document.querySelectorAll('#expense-category-grid .category-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.expenseCategory === expense.category);
        });
        
        // Step 2 - Details
        document.getElementById('expense-item-name').value = expense.itemName;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-currency').value = expense.currency;
        document.getElementById('expense-exchange-rate').value = expense.exchangeRate;
        updateCurrencySymbol();
        document.getElementById('rate-value').textContent = expense.exchangeRate.toFixed(4);
        updateExpenseAmountHKD();
        
        if (expense.linkedEventId) {
            document.getElementById('expense-linked-event').value = expense.linkedEventId;
        }
        
        // Step 3 - Payers and date
        populatePayersList();
        setTimeout(() => {
            document.querySelectorAll('.payer-checkbox').forEach((cb, index) => {
                cb.checked = expense.payers.includes(index);
            });
            updatePayerSelection();
        }, 100);
        
        if (expense.date) {
            document.getElementById('expense-date').value = expense.date;
        }
        if (expense.time) {
            document.getElementById('expense-time').value = expense.time;
        }
        if (expense.notes) {
            document.getElementById('expense-notes').value = expense.notes;
        }
    }, 100);
}

// Update expense summary
function updateExpenseSummary() {
    const totalSpentEl = document.getElementById('total-spent');
    const perPersonEl = document.getElementById('per-person');
    const personCountEl = document.getElementById('person-count');
    
    const expenses = Storage.expenses;
    const persons = Storage.expenseSettings.persons || ['Person 1', 'Person 2'];
    
    // Calculate total
    const total = expenses.reduce((sum, exp) => sum + (exp.amountHKD || 0), 0);
    const perPerson = persons.length > 0 ? total / persons.length : 0;
    
    if (totalSpentEl) {
        totalSpentEl.textContent = `HKD $${total.toFixed(2)}`;
    }
    
    if (perPersonEl) {
        perPersonEl.textContent = `HKD $${perPerson.toFixed(2)}`;
    }
    
    if (personCountEl) {
        personCountEl.textContent = persons.length;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initExpenseTracker, 100);
});

// Export functions
window.ExpenseTracker = {
    init: initExpenseTracker,
    render: renderExpenses,
    updateSummary: updateExpenseSummary,
    openModal: openExpenseModal,
    loadExpenses: () => {
        Storage.loadExpenses();
        renderExpenses();
        updateExpenseSummary();
    }
};