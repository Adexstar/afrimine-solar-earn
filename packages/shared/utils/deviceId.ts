export function getOrCreateDeviceId() {
  try {
    const KEY = 'afrimine_device_id';
    let id = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, id);
    }
    return id;
  } catch (e) {
    return `node-${Date.now()}`;
  }
}
