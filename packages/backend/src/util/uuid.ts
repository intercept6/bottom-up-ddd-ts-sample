export function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
    .replace(/y/g, () => (Math.floor(Math.random() * 4) + 8).toString(16));
}
