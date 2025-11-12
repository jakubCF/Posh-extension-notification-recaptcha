// background.js


// --- STATE PERSISTENCE FUNCTIONS ---
async function getNotifiedTabs() {
    const data = await chrome.storage.session.get('notifiedTabs');
    return new Set(data.notifiedTabs || []);
}

async function saveNotifiedTabs(notifiedSet) {
    await chrome.storage.session.set({ notifiedTabs: Array.from(notifiedSet) });
}
// ---------------------------------

// --- CORE MESSAGE LISTENER (WAKES THE WORKER) ---
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  try {
    const tabId = sender.tab.id;
    console.log(`[SW] Message received from tab ${tabId}. Action: ${request.action}`); // Log 1
    // 1. Handle Automatic Button Click Confirmation (No action needed here)
    if (request.action === "buttonClicked") {
        // console.log(`Button clicked on tab ${tabId}.`);
        return;
    }

    // 2. Handle reCAPTCHA Notification
    if (request.action === "recaptchaFound" && request.isRecaptcha) {
        
        // Load state from storage (survives service worker termination)
        const notifiedTabs = await getNotifiedTabs(); 

        if (!notifiedTabs.has(tabId)) {
        console.log(`[SW] Creating notification for tab ${tabId}.`); // Log 2
        // Send the desktop notification
        chrome.notifications.create('recaptcha-alert-' + tabId, {
            type: 'basic',
            iconUrl: 'icon.png',
            title: '🚨 CAPTCHA Action Required!',
            message: 'reCAPTCHA challenge found on: ' + request.tabTitle,
            priority: 2
        });
        
        // Update state and save back to storage
        notifiedTabs.add(tabId);
        await saveNotifiedTabs(notifiedTabs); 
        console.log(`[SW] Notification state saved for tab ${tabId}.`); // Log 3
        }
    }
    } catch (e) {
        // Crucial: This will print errors that cause the notification to fail
        console.error("[SW] CRITICAL ERROR during notification process:", e);
    }
});


// --- NOTIFICATION & TAB MANAGEMENT LISTENERS ---

// Listener to remove the tab from the 'notified' list when it's closed
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    const notifiedTabs = await getNotifiedTabs();
    if (notifiedTabs.delete(tabId)) {
        await saveNotifiedTabs(notifiedTabs);
    }
});

// Listener to switch to the tab when the user clicks the notification
chrome.notifications.onClicked.addListener(async (notificationId) => {
    const tabId = parseInt(notificationId.split('-').pop());

    if (tabId && !isNaN(tabId)) {
        // Switch the user back to the tab
        const tab = await chrome.tabs.get(tabId);
        if (tab) {
             chrome.tabs.update(tabId, { active: true });
             chrome.windows.update(tab.windowId, { focused: true });
        }
        
        // Clear the notification
        chrome.notifications.clear(notificationId);
        
        // Update the state to allow future notifications if the reCAPTCHA reappears
        const notifiedTabs = await getNotifiedTabs();
        notifiedTabs.delete(tabId);
        await saveNotifiedTabs(notifiedTabs);
    }
});