/**
 * Notification Constants - Intent-Based Notification System
 * 
 * This file defines canonical constants for the notification system.
 * Every notification communicates WHY it exists, not just what happened.
 */

// ============================================================================
// NOTIFICATION INTENTS - Drives color, icon, and grouping
// ============================================================================
export const NotificationIntent = {
    OPERATIONAL: 'operational',             // Day-to-day execution (orders, inventory, etc.)
    FINANCIAL: 'financial',                 // Money, payments, debt
    RISK_SECURITY: 'risk_security',         // Suspensions, failures, security alerts
    STRATEGIC_INSIGHT: 'strategic_insight', // AI, analytics, business insights
    ACCOUNTABILITY: 'accountability'        // Action required from user
};

// ============================================================================
// NOTIFICATION PRIORITIES - Drives ordering and emphasis
// ============================================================================
export const NotificationPriority = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
};

// ============================================================================
// INTENT UI MAPPING - Visual semantics by intent
// ============================================================================
export const IntentUIMap = {
    operational: {
        color: 'blue',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
        textClass: 'text-blue-600',
        iconBgClass: 'bg-blue-100',
        icon: 'Activity',
        label: 'Operations'
    },
    financial: {
        color: 'green',
        bgClass: 'bg-green-50',
        borderClass: 'border-green-200',
        textClass: 'text-green-600',
        iconBgClass: 'bg-green-100',
        icon: 'CreditCard',
        label: 'Finance'
    },
    risk_security: {
        color: 'red',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
        textClass: 'text-red-600',
        iconBgClass: 'bg-red-100',
        icon: 'AlertTriangle',
        label: 'Alerts'
    },
    strategic_insight: {
        color: 'purple',
        bgClass: 'bg-purple-50',
        borderClass: 'border-purple-200',
        textClass: 'text-purple-600',
        iconBgClass: 'bg-purple-100',
        icon: 'TrendingUp',
        label: 'Insights'
    },
    accountability: {
        color: 'yellow',
        bgClass: 'bg-yellow-50',
        borderClass: 'border-yellow-200',
        textClass: 'text-yellow-700',
        iconBgClass: 'bg-yellow-100',
        icon: 'UserCheck',
        label: 'Actions'
    }
};

// Default UI config for unknown intents
export const DefaultIntentUI = {
    color: 'gray',
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    textClass: 'text-gray-600',
    iconBgClass: 'bg-gray-100',
    icon: 'Bell',
    label: 'General'
};

// ============================================================================
// PRIORITY STYLES - UX emphasis based on urgency
// ============================================================================
export const getPriorityStyle = (priority) => {
    switch (priority) {
        case 'urgent':
            return {
                highlight: true,
                pulse: true,
                ringClass: 'ring-2 ring-red-400 ring-opacity-50',
                badgeClass: 'bg-red-500 text-white'
            };
        case 'high':
            return {
                highlight: true,
                ringClass: 'ring-1 ring-orange-300',
                badgeClass: 'bg-orange-500 text-white'
            };
        case 'normal':
            return {
                highlight: false,
                ringClass: '',
                badgeClass: 'bg-blue-500 text-white'
            };
        case 'low':
            return {
                muted: true,
                ringClass: '',
                badgeClass: 'bg-gray-400 text-white'
            };
        default:
            return {
                highlight: false,
                ringClass: '',
                badgeClass: 'bg-gray-500 text-white'
            };
    }
};

// ============================================================================
// INTENT FILTER TABS - For semantic inbox views
// ============================================================================
export const IntentTabs = [
    { key: 'all', label: 'All', icon: 'Bell', intent: null },
    { key: 'operational', label: 'Operations', icon: 'Activity', intent: 'operational' },
    { key: 'financial', label: 'Finance', icon: 'CreditCard', intent: 'financial' },
    { key: 'risk_security', label: 'Alerts', icon: 'AlertTriangle', intent: 'risk_security' },
    { key: 'accountability', label: 'Actions', icon: 'UserCheck', intent: 'accountability' },
    { key: 'strategic_insight', label: 'Insights', icon: 'TrendingUp', intent: 'strategic_insight' }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get UI configuration for a given intent
 * @param {string} intent - The notification intent
 * @returns {object} UI configuration object
 */
export const getIntentUI = (intent) => {
    return IntentUIMap[intent] || DefaultIntentUI;
};

/**
 * Filter notifications by intent
 * @param {array} notifications - Array of notifications
 * @param {string} intent - Intent to filter by (null for all)
 * @returns {array} Filtered notifications
 */
export const filterByIntent = (notifications, intent) => {
    if (!intent) return notifications;
    return notifications.filter(n => n.intent === intent);
};

/**
 * Filter notifications by role
 * @param {array} notifications - Array of notifications
 * @param {string} role - Role to filter by
 * @returns {array} Filtered notifications
 */
export const filterByRole = (notifications, role) => {
    if (!role) return notifications;
    return notifications.filter(n => n.role === role);
};

/**
 * Sort notifications by priority (urgent first)
 * @param {array} notifications - Array of notifications
 * @returns {array} Sorted notifications
 */
export const sortByPriority = (notifications) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    return [...notifications].sort((a, b) => {
        const aPriority = priorityOrder[a.priority] ?? 2;
        const bPriority = priorityOrder[b.priority] ?? 2;
        return aPriority - bPriority;
    });
};

export default {
    NotificationIntent,
    NotificationPriority,
    IntentUIMap,
    DefaultIntentUI,
    IntentTabs,
    getPriorityStyle,
    getIntentUI,
    filterByIntent,
    filterByRole,
    sortByPriority
};
