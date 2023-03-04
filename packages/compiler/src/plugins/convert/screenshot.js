/**
 * Take a screenshot of a page element.
 * Modifies element classes and styles to isolate selected content,
 * hide other content, and screenshots the target element.
 * @param {ElementHandle} handle The target element to screenshot
 * @param {object} options Screenshot options
 * @param {string} options.format The image format. One of pdf, png, or jpg.
 * @param {Page} options.page The active page containing the target element
 * @param {string} options.path The file path for the output PDF
 */
export async function screenshot(handle, { format, page, path }) {
  // handle inline content by injecting spans to ensure CSS is applied
  // TODO: find a better solution to this issue?
  await handle.evaluate(el => {
    const p = el.parentElement;
    if (p.tagName === 'P' && el.previousSibling) {
      const span = document.createElement('span');
      const sibs = [];
      for (let s = el.previousSibling; s; s = s.previousSibling) {
        sibs.push(s);
      }
      sibs.reverse().forEach(s => span.appendChild(s));
      p.insertBefore(span, el);
    }
  });

  // annotate target element and parents
  await handle.evaluate(el => {
    el.classList.add('lpub-screenshot-target');
    let ancestor = el.parentElement;
    while (ancestor) {
      ancestor.classList.add('lpub-screenshot-parent');
      ancestor = ancestor.parentElement;
    }
  });

  // inject overriding styles
  const styleHandle = await page.addStyleTag({
    content: `
      :not(.lpub-screenshot-parent, .lpub-screenshot-target, .lpub-screenshot-target *) {
        display: none;
      }

      .lpub-screenshot-parent {
        position: static;
        margin: 0 !important;
        padding: 0 !important;
      }

      .lpub-screenshot-target {
        display: inline-block;
        position: absolute;
        left: 0;
        top: 0;
        margin: 0 !important;
      }

      .lpub-screenshot-target > * {
        margin: 0 !important;
      }

      @media print {
        body { break-inside: avoid; margin: 0; padding: 0; }
      }
    `
  });

  // take screenshot
  if (format === 'pdf') {
    const { width, height } = await handle.boundingBox();
    await page.pdf({
      path,
      pageRanges: '1',
      width: `${Math.ceil(width)}px`,
      height: `${Math.ceil(height)}px`
    });
  } else {
    await handle.screenshot({ path });
  }

  // remove style tag
  await styleHandle.evaluate(el => el.remove());

  // remove class annotations
  await handle.evaluate(el => {
    el.classList.remove('lpub-screenshot-target');
    let ancestor = el.parentElement;
    while (ancestor) {
      ancestor.classList.remove('lpub-screenshot-parent');
      ancestor = ancestor.parentElement;
    }
  });
}
