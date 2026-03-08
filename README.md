# reCAPTCHA Notifier

A Chrome extension that alerts you when a reCAPTCHA challenge appears on Poshmark.com, helping you stay on top of verification requests without constantly monitoring the page.

## Features

- **Automatic Notifications**: Sends a desktop notification when a reCAPTCHA iframe is detected on Poshmark pages
- **Auto-Click "Try Again"**: Automatically clicks the "Try Again" button if a share failure dialog appears
- **One-Time Alerts**: Intelligently notifies you only once per tab, avoiding notification spam
- **Quick Navigation**: Click the notification to switch directly to the affected tab
- **Smart State Management**: Clears notification state when tabs are closed or when you interact with notifications
- **Continuous Monitoring**: Uses MutationObserver and interval-based checks for dynamic page changes

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select the extension folder
5. The reCAPTCHA Notifier extension will now be active

## How It Works

### Content Script (`content.js`)
- Runs on all web pages and continuously monitors for reCAPTCHA elements
- Checks for reCAPTCHA iframes and the "Try Again" button
- Sends messages to the background service worker when reCAPTCHA is detected
- Uses both MutationObserver and interval-based polling for reliability

### Background Service Worker (`background.js`)
- Listens for messages from the content script
- Creates desktop notifications when reCAPTCHA is found
- Manages notification state to prevent duplicate alerts per tab
- Handles notification clicks to switch focus to the affected tab
- Clears state when tabs are closed or notifications are dismissed

## Permissions

The extension requires the following permissions:
- **notifications**: To display desktop alerts
- **scripting**: To inject content scripts
- **tabs**: To manage tabs and window focus
- **storage**: To persist notification state

## Host Permissions

Currently configured to monitor:
- `https://poshmark.ca/*`
- `https://www.poshmark.ca/*`
- `https://poshmark.com/*`
- `https://www.poshmark.com/*`

Add or modify these in `manifest.json` if you need to monitor different sites.

## File Structure

```
├── manifest.json       # Extension configuration and permissions
├── background.js       # Service worker handling notifications
├── content.js         # Content script for monitoring reCAPTCHA
└── README.md          # This file
```

## Configuration

To modify which sites the extension monitors:
1. Edit the `host_permissions` array in `manifest.json`
2. Reload the extension in `chrome://extensions/`

To change the monitoring interval, edit this line in `content.js`:
```javascript
setInterval(checkRecaptcha, 3000); // Change 3000 to desired milliseconds
```

## Troubleshooting

- **No notifications appearing?** Check that notifications are enabled for Chrome in your system settings
- **Extension not loading?** Verify all files are in the same directory and manifest.json is valid JSON
- **Notifications showing multiple times?** This shouldn't happen due to state management, but you can clear storage at `chrome://extensions/` → Details

## License

MIT License

## Contributing

Feel free to fork, modify, and submit improvements!
