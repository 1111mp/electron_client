try {
  window.ROOT_PATH = window.location.href.startsWith('file') ? '../../' : '/';
  window.platform = process.platform;
} catch (error) {

}

console.log('preload complete');
