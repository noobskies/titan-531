
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const scheduleWorkoutReminder = (daysSinceLastWorkout: number) => {
    if (Notification.permission !== 'granted') return;

    // In a real PWA/Native app, we would use a background worker or local notification API.
    // For this web demo, we'll just check on app load or simulation.
    // However, we can trigger a "Welcome Back" notification if it's been a while right now.
    
    if (daysSinceLastWorkout >= 3) {
        new Notification("Time to Train! 🏋️", {
            body: `It's been ${daysSinceLastWorkout} days since your last workout. Keep the streak alive!`,
            icon: '/icon.png' // Placeholder
        });
    }
};

export const sendTestNotification = () => {
    if (Notification.permission === 'granted') {
        new Notification("Titan 531", {
            body: "This is a test notification. Get ready to lift!",
        });
    }
};
