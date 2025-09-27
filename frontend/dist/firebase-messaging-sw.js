// firebase-messaging-sw.js
// Service worker for Firebase Cloud Messaging (FCM) background notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
// These values should match your Firebase project configuration
const firebaseConfig = {
  apiKey: "your_firebase_api_key_here",
  authDomain: "your_project_id.firebaseapp.com", 
  projectId: "your_firebase_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_firebase_app_id",
  measurementId: "your_measurement_id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Extract notification information
  const { notification, data } = payload;
  
  // Customize notification title and options
  const notificationTitle = notification?.title || 'Smart Crop Advisory';
  const notificationOptions = {
    body: notification?.body || 'You have a new notification',
    icon: notification?.icon || '/icons/notification-icon.png',
    badge: notification?.badge || '/icons/badge-icon.png',
    image: notification?.image,
    tag: data?.notificationId || 'default',
    data: data,
    requireInteraction: data?.priority === 'high',
    actions: getNotificationActions(data?.type),
    timestamp: Date.now(),
    vibrate: data?.priority === 'high' ? [200, 100, 200] : [100],
    silent: data?.silent === 'true'
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;
  
  // Close the notification
  notification.close();
  
  // Handle different actions
  let url = '/dashboard'; // default URL
  
  if (action) {
    url = getActionUrl(action, data);
  } else if (data?.url) {
    url = data.url;
  } else if (data?.type) {
    url = getTypeUrl(data.type);
  }
  
  // Focus or open the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        const hadWindowToFocus = clientList.some(function(windowClient) {
          if (windowClient.url === url) {
            return windowClient.focus();
          }
        });
        
        if (!hadWindowToFocus) {
          return clients.openWindow(url).then(function(windowClient) {
            return windowClient ? windowClient.focus() : null;
          });
        }
      })
      .then(() => {
        // Mark notification as read if ID is provided
        if (data?.notificationId) {
          markNotificationAsRead(data.notificationId);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('[firebase-messaging-sw.js] Notification closed.');
  
  const data = event.notification.data;
  
  // Track notification dismissal
  if (data?.notificationId) {
    trackNotificationDismissal(data.notificationId);
  }
});

// Get notification actions based on type
function getNotificationActions(type) {
  const commonActions = [
    {
      action: 'view',
      title: 'View',
      icon: '/icons/view-icon.png'
    },
    {
      action: 'dismiss',
      title: 'Dismiss',
      icon: '/icons/dismiss-icon.png'
    }
  ];
  
  const typeSpecificActions = {
    weather: [
      {
        action: 'view_forecast',
        title: 'View Forecast',
        icon: '/icons/weather-icon.png'
      },
      ...commonActions
    ],
    advisory: [
      {
        action: 'view_details',
        title: 'View Details',
        icon: '/icons/advisory-icon.png'
      },
      ...commonActions
    ],
    market: [
      {
        action: 'view_prices',
        title: 'View Prices',
        icon: '/icons/market-icon.png'
      },
      ...commonActions
    ],
    pest: [
      {
        action: 'view_treatment',
        title: 'View Treatment',
        icon: '/icons/pest-icon.png'
      },
      ...commonActions
    ],
    irrigation: [
      {
        action: 'view_schedule',
        title: 'View Schedule',
        icon: '/icons/irrigation-icon.png'
      },
      ...commonActions
    ]
  };
  
  return typeSpecificActions[type] || commonActions;
}

// Get URL based on action
function getActionUrl(action, data) {
  const actionUrls = {
    view: data?.url || '/dashboard',
    view_forecast: '/weather',
    view_details: '/advisory',
    view_prices: '/market',
    view_treatment: '/pest-detection',
    view_schedule: '/irrigation',
    dismiss: null // Don't navigate anywhere for dismiss
  };
  
  return actionUrls[action] || '/dashboard';
}

// Get URL based on notification type
function getTypeUrl(type) {
  const typeUrls = {
    weather: '/weather',
    advisory: '/advisory',
    market: '/market',
    pest: '/pest-detection',
    irrigation: '/irrigation',
    alert: '/notifications',
    general: '/dashboard'
  };
  
  return typeUrls[type] || '/dashboard';
}

// Mark notification as read (send request to backend)
function markNotificationAsRead(notificationId) {
  const baseUrl = 'http://localhost:5000/api';
  const token = getAuthToken();
  
  if (!token) {
    console.log('No auth token available to mark notification as read');
    return;
  }
  
  fetch(`${baseUrl}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if (response.ok) {
      console.log('Notification marked as read:', notificationId);
    } else {
      console.error('Failed to mark notification as read:', response.status);
    }
  }).catch(error => {
    console.error('Error marking notification as read:', error);
  });
}

// Track notification dismissal
function trackNotificationDismissal(notificationId) {
  const baseUrl = 'http://localhost:5000/api';
  const token = getAuthToken();
  
  if (!token) {
    return;
  }
  
  fetch(`${baseUrl}/notifications/${notificationId}/track`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'dismissed',
      timestamp: new Date().toISOString()
    })
  }).then(response => {
    if (response.ok) {
      console.log('Notification dismissal tracked:', notificationId);
    }
  }).catch(error => {
    console.error('Error tracking notification dismissal:', error);
  });
}

// Get authentication token from IndexedDB or localStorage
function getAuthToken() {
  // This is a simplified version - in a real app, you might need to
  // implement a more robust token retrieval mechanism from IndexedDB
  try {
    // Try to get from broadcast channel or cache
    return null; // Placeholder - implement token retrieval logic
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[firebase-messaging-sw.js] Push subscription changed.');
  
  event.waitUntil(
    // Re-subscribe and update the backend with new subscription
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'your_vapid_key_here'
    }).then(function(newSubscription) {
      console.log('New subscription:', newSubscription);
      // Send new subscription to backend
      return updateSubscriptionOnServer(newSubscription);
    })
  );
});

// Update subscription on server
function updateSubscriptionOnServer(subscription) {
  const baseUrl = 'http://localhost:5000/api';
  const token = getAuthToken();
  
  if (!token) {
    console.log('No auth token available to update subscription');
    return Promise.resolve();
  }
  
  return fetch(`${baseUrl}/notifications/update-subscription`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription: subscription,
      timestamp: new Date().toISOString()
    })
  }).then(response => {
    if (response.ok) {
      console.log('Subscription updated on server');
    } else {
      console.error('Failed to update subscription:', response.status);
    }
  }).catch(error => {
    console.error('Error updating subscription:', error);
  });
}

// Cache management for offline support
self.addEventListener('install', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker installing.');
  
  event.waitUntil(
    caches.open('smart-crop-notifications-v1').then(function(cache) {
      return cache.addAll([
        '/icons/notification-icon.png',
        '/icons/badge-icon.png',
        '/icons/view-icon.png',
        '/icons/dismiss-icon.png',
        '/icons/weather-icon.png',
        '/icons/advisory-icon.png',
        '/icons/market-icon.png',
        '/icons/pest-icon.png',
        '/icons/irrigation-icon.png'
      ]).catch(function(error) {
        // Don't fail installation if icons can't be cached
        console.warn('Failed to cache notification icons:', error);
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[firebase-messaging-sw.js] Service worker activating.');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== 'smart-crop-notifications-v1') {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});