// Configuration and Constants
const eventCategories = {
    hotel: { color: '#28a745', icon: '🏨' },
    breakfast: { color: '#ffc107', icon: '🍳' },
    lunch: { color: '#17a2b8', icon: '🍱' },
    dinner: { color: '#dc3545', icon: '🍛' },
    view: { color: '#6f42c1', icon: '🏞️' },
    play: { color: '#fd7e14', icon: '🎡' },
    transportation: { color: '#17a2b8', icon: '🚌' }
};

// Language translations
const translations = {
    en: {
        // Navigation
        navSchedules: "Schedules",
        navChecklist: "Checklist",
        navAddTrip: "Add Trip",
        navTrack: "Track",
        navSettings: "Settings",
        
        // New Navigation Labels
        navTripList: "Trip List",
        navSchedule: "Schedule",
        navMap: "Map",
        navAddEvent: "Add Event",
        
        // Page Headers
        navbarTitle: "My Trip Planner",
        schedulesTitle: "Your Trips",
        schedulesSubtitle: "Your Trips",
        checklistTitle: "Checklist",
        checklistSubtitle: "Checklist",
        addTripTitle: "Create New Trip",
        addTripSubtitle: "Create New Trip",
        trackTitle: "Expense Tracker",
        trackSubtitle: "Expense Tracker",
        settingsTitle: "Settings",
        settingsSubtitle: "Settings",
        
        // Home Page
        welcome: "Welcome to Your Trip Planner",
        chooseTrip: "Start by creating a new trip or choosing from our templates",
        noTripsYet: "No trips yet",
        noTripsHint: "Go to \"Add Trip\" to create your first adventure!",
        
        // Trip Options
        tripOptions: "Choose from Templates",
        tripOptionsSubtitle: "Choose from Templates",
        japanToyama: "4-Day Japan Toyama Trip",
        exploreToyama: "Explore the beautiful Toyama prefecture",
        customTrip: "Custom Trip",
        createItinerary: "Create your own itinerary",
        createCustomTrip: "Create Custom Trip",
        
        // Trip Planner
        tripSchedule: "My Trip",
        schedule: "Schedule",
        addEvent: "Add Event",
        eventName: "Event Name",
        tripName: "Trip Name",
        location: "Location",
        time: "Time",
        dateAndTime: "Date & Time",
        dateRange: "Date Range",
        startDate: "Start Date",
        endDate: "End Date",
        to: "to",
        category: "Category",
        description: "Description",
        selectCategory: "Select Category",
        selectDate: "Select Date",
        selectTime: "Select Time",
        
        // Categories
        hotel: "Hotel",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        view: "View/Attraction",
        play: "Activity/Play",
        transportation: "Transportation",
        
        // Buttons
        cancel: "Cancel",
        addEventBtn: "Add Event",
        createTripBtn: "Create Trip",
        saveTrip: "Save Trip",
        backToHome: "Back to Home",
        editEvent: "Edit",
        deleteEvent: "Delete",
        viewEvent: "View",
        select: "Select",
        
        // Event Status
        editMode: "Edit Mode",
        noEvents: "No events yet",
        noEventsHint: "Click on the map or tap \"+\" to create one",
        eventsCount: "events",
        
        // Filters
        date: "Date",
        allDates: "All Dates",
        allCategories: "All Categories",
        
        // Language
        language: "Language",
        english: "English",
        chinese: "繁體中文",
        
        // Data
        data: "Data",
        clearAllData: "Clear All Data",
        confirmClear: "Are you sure you want to clear all data? This cannot be undone.",
        
        // Placeholders
        enterEventName: "Enter event name",
        enterTripName: "Enter trip name",
        enterLocation: "Enter location",
        addNotes: "Add notes about this event",
        searchLocation: "Search location...",
        
        // Template Preview
        templatePreview: "Template Preview",
        itineraryPreview: "Itinerary Preview",
        saveThisTrip: "Save This Trip",
        days: "days",
        
        // Coming Soon
        comingSoon: "Coming Soon",
        prepareTrip: "Prepare for your trip with a checklist",
        trackExpenses: "Track your trip expenses",
        
        // Detail Modal
        detailLocation: "Location",
        detailTime: "Time",
        detailDescription: "Description",
        
        // Map
        map: "Map",
        collapseMap: "Collapse Map",
        expandMap: "Expand Map",
        
        // Checklist
        itemsPacked: "items packed",
        addItem: "Add Item",
        enterItemName: "Enter item name"
    },
    'zh-TW': {
        // Navigation
        navSchedules: "行程表",
        navChecklist: "準備",
        navAddTrip: "加新行程",
        navTrack: "記賬",
        navSettings: "設置",
        
        // New Navigation Labels
        navTripList: "行程列表",
        navSchedule: "行程表",
        navMap: "地圖",
        navAddEvent: "新增活動",
        
        // Page Headers
        navbarTitle: "我的行程規劃器",
        schedulesTitle: "你的旅程",
        schedulesSubtitle: "Your Trips",
        checklistTitle: "準備",
        checklistSubtitle: "Checklist",
        addTripTitle: "創建新行程",
        addTripSubtitle: "Create New Trip",
        trackTitle: "記賬",
        trackSubtitle: "Expense Tracker",
        settingsTitle: "設置",
        settingsSubtitle: "Settings",
        
        // Home Page
        welcome: "歡迎使用您的行程規劃工具",
        chooseTrip: "開始創建新行程或從我們的模板中選擇",
        noTripsYet: "尚無行程",
        noTripsHint: "前往「加新行程」創建您的第一次冒險！",
        
        // Trip Options
        tripOptions: "從模板選擇",
        tripOptionsSubtitle: "Choose from Templates",
        japanToyama: "4 天日本富山之旅",
        exploreToyama: "探索美麗的富山縣",
        customTrip: "自訂行程",
        createItinerary: "創建您自己的行程",
        createCustomTrip: "創建自訂行程",
        
        // Trip Planner
        tripSchedule: "我的行程",
        schedule: "行程表",
        addEvent: "新增活動",
        eventName: "活動名稱",
        tripName: "行程名稱",
        location: "地點",
        time: "時間",
        dateAndTime: "日期與時間",
        dateRange: "日期範圍",
        startDate: "開始日期",
        endDate: "結束日期",
        to: "至",
        category: "類別",
        description: "描述",
        selectCategory: "選擇類別",
        selectDate: "選擇日期",
        selectTime: "選擇時間",
        
        // Categories
        hotel: "飯店",
        breakfast: "早餐",
        lunch: "午餐",
        dinner: "晚餐",
        view: "景點",
        play: "活動",
        transportation: "交通",
        
        // Buttons
        cancel: "取消",
        addEventBtn: "新增活動",
        createTripBtn: "創建行程",
        saveTrip: "儲存行程",
        backToHome: "返回首頁",
        editEvent: "編輯",
        deleteEvent: "刪除",
        viewEvent: "查看",
        select: "選擇",
        
        // Event Status
        editMode: "編輯模式",
        noEvents: "尚無活動",
        noEventsHint: "點擊地圖或輕觸「+」來創建",
        eventsCount: "個活動",
        
        // Filters
        date: "日期",
        allDates: "所有日期",
        allCategories: "所有類別",
        
        // Language
        language: "語言",
        english: "English",
        chinese: "繁體中文",
        
        // Data
        data: "資料",
        clearAllData: "清除所有資料",
        confirmClear: "確定要清除所有資料嗎？此操作無法復原。",
        
        // Placeholders
        enterEventName: "輸入活動名稱",
        enterTripName: "輸入行程名稱",
        enterLocation: "輸入地點",
        addNotes: "為此活動添加備註",
        searchLocation: "搜尋地點...",
        
        // Template Preview
        templatePreview: "模板預覽",
        itineraryPreview: "行程預覽",
        saveThisTrip: "儲存此行程",
        days: "天",
        
        // Coming Soon
        comingSoon: "即將推出",
        prepareTrip: "使用清單準備您的旅程",
        trackExpenses: "追蹤您的旅行支出",
        
        // Detail Modal
        detailLocation: "地點",
        detailTime: "時間",
        detailDescription: "描述",
        
        // Map
        map: "地圖",
        collapseMap: "收起地圖",
        expandMap: "展開地圖",
        
        // Checklist
        itemsPacked: "項目已打包",
        addItem: "新增項目",
        enterItemName: "輸入項目名稱"
    }
};

// Template data
function getTemplateData(templateId) {
    const templates = {
        'japan-toyama': {
            name: '富山 4日間の旅',
            description: '4-Day Japan Toyama Trip',
            days: 4,
            events: [
                { name: 'Arrival in Toyama', location: 'Toyama Station', category: 'hotel', time: '10:00', latLng: [36.6997, 137.2152] },
                { name: 'Tateyama Kurobe Alpine Route', location: 'Tateyama Ropeway', category: 'view', time: '08:00', latLng: [36.5833, 137.5833] },
                { name: 'Shirakawa-go', location: 'Shirakawa-go', category: 'view', time: '09:00', latLng: [36.2667, 136.9167] },
                { name: 'Toyama Bay and Departure', location: 'Toyama Bay', category: 'dinner', time: '14:00', latLng: [36.8, 137.3833] }
            ]
        }
    };
    return templates[templateId] || null;
}

// Default trip template (legacy)
function getJapanToyamaItinerary() {
    return [
        {
            name: 'Day 1: Arrival in Toyama',
            location: 'Toyama Station',
            time: '2024-04-01T10:00',
            description: 'Arrive at Toyama Station and check into hotel.',
            category: 'hotel',
            latLng: [36.6997, 137.2152]
        },
        {
            name: 'Day 2: Tateyama Kurobe Alpine Route',
            location: 'Tateyama Ropeway',
            time: '2024-04-02T08:00',
            description: 'Experience the famous Alpine Route with stunning mountain views.',
            category: 'view',
            latLng: [36.5833, 137.5833]
        },
        {
            name: 'Day 3: Shirakawa-go',
            location: 'Shirakawa-go',
            time: '2024-04-03T09:00',
            description: 'Visit the UNESCO World Heritage site.',
            category: 'view',
            latLng: [36.2667, 136.9167]
        },
        {
            name: 'Day 4: Toyama Bay and Departure',
            location: 'Toyama Bay',
            time: '2024-04-04T14:00',
            description: 'Enjoy fresh seafood at the bay before departing.',
            category: 'dinner',
            latLng: [36.8, 137.3833]
        }
    ];
}