/**
 * Checks if a given date is within the current week (Sunday to Saturday).
 * @param date The date to check.
 * @returns True if the date is within the current week, false otherwise.
 */
export const isWithinCurrentWeek = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sunday as the first day of the week
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());

    // Saturday as the last day of the week
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
};

/**
 * A simple utility to grow a textarea based on its content.
 * @param textarea The textarea element to resize.
 */
export const autoGrowTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
        textarea.style.height = 'auto'; // Reset height
        textarea.style.height = textarea.scrollHeight + 'px';
    }
};
