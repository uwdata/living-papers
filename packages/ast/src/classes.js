import {
 VALUE, getPropertyType, getPropertyValue, removeProperty, setValueProperty
} from './properties.js';

export function hasClass(node, className) {
  return getClasses(node).indexOf(className) >= 0;
}

export function getClasses(node) {
  if (getPropertyType(node, 'class') === VALUE) {
    return getPropertyValue(node, 'class').split(/\s+/);
  }
  return [];
}

export function removeClass(node, className) {
  if (getPropertyType(node, 'class') === VALUE) {
    const classes = getClasses(node)
      .filter(c => c !== className)
      .join(' ');
    if (classes) {
      setValueProperty(node, 'class', classes);
    } else {
      removeProperty(node, 'class');
    }
  }
}

export function addClass(node, className) {
  const cls = getClasses(node);
  if (cls.indexOf(className) < 0) {
    setValueProperty(node, 'class', [...cls, className].join(' '));
  }
}
