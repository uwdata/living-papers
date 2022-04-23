export function injectStyle(document, className, uri) {
  const head = document.head;
  if (head.querySelector(`link.${className}`)) {
    return; // already there
  }

  const link = document.createElement('link');
  link.class = className;
  link.rel = 'stylesheet';
  link.href = uri;

  head.appendChild(link);
}
