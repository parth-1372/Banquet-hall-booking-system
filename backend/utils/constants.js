/**
 * User Roles Enum
 */
const USER_ROLES = Object.freeze({
    CUSTOMER: 'customer',
    ADMIN1: 'admin1',
    ADMIN2: 'admin2',
    ADMIN3: 'super_admin',
    SUPER_ADMIN: 'super_admin', // Alias for ADMIN3
});

/**
 * Booking Status Enum
 */
const BOOKING_STATUS = Object.freeze({
    ACTION_PENDING: 'action-pending',
    CHANGE_REQUESTED: 'change-requested',
    REJECTED: 'rejected',
    APPROVED_ADMIN1: 'approved-admin1',
    PAYMENT_REQUESTED: 'payment-requested',
    PAYMENT_REVIEW: 'payment-review',
    APPROVED_ADMIN2: 'approved-admin2',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
});

/**
 * Time Slots for Booking
 */
const TIME_SLOTS = Object.freeze([
    {
        id: 'morning',
        label: 'Morning',
        startTime: '06:00',
        endTime: '12:00',
    },
    {
        id: 'afternoon',
        label: 'Afternoon',
        startTime: '12:00',
        endTime: '18:00',
    },
    {
        id: 'evening',
        label: 'Evening',
        startTime: '18:00',
        endTime: '23:59',
    },
    {
        id: 'full-day',
        label: 'Full Day',
        startTime: '06:00',
        endTime: '23:59',
    },
]);

/**
 * Payment Status Enum
 */
const PAYMENT_STATUS = Object.freeze({
    PENDING: 'pending',
    PAID: 'paid',
    REFUNDED: 'refunded',
    FAILED: 'failed',
});

/**
 * Hall Types Enum
 */
const HALL_TYPES = Object.freeze({
    BANQUET: 'banquet',
    CONFERENCE: 'conference',
    WEDDING: 'wedding',
    PARTY: 'party',
});

module.exports = {
    USER_ROLES,
    BOOKING_STATUS,
    TIME_SLOTS,
    PAYMENT_STATUS,
    HALL_TYPES,
};
