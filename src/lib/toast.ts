// Toast notification utility
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
}

// Create toast function
export function showToast(
  message: string,
  type: ToastType = 'info',
  options: ToastOptions = {}
) {
  const { duration = 3000, position = 'top' } = options;

  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      ${position}: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[type];

  toast.className = `
    ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg
    flex items-center gap-3 mb-2 animate-in fade-in slide-in-from-right
    pointer-events-auto
  `;
  toast.textContent = message;

  // Add icon
  const icon = document.createElement('span');
  icon.textContent = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[type];
  toast.insertBefore(icon, toast.firstChild);

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);

  // Add style for animation
  if (!document.querySelector('style[data-toast]')) {
    const style = document.createElement('style');
    style.setAttribute('data-toast', 'true');
    style.textContent = `
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

export function showSuccess(message: string, options?: ToastOptions) {
  showToast(message, 'success', options);
}

export function showError(message: string, options?: ToastOptions) {
  showToast(message, 'error', options);
}

export function showInfo(message: string, options?: ToastOptions) {
  showToast(message, 'info', options);
}

export function showWarning(message: string, options?: ToastOptions) {
  showToast(message, 'warning', options);
}
