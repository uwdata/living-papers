import { Runtime } from '@observablehq/runtime';

/**
 * Resolve a file attachment name.
 * @param {string} name the file name to resolve
 * @returns the resolved file URL or null if not found
 */
function resolve(name) {
  // for now simply use the name as the URL!
  return name;
}

export const FileAttachment = Runtime.prototype.fileAttachments(resolve);
