export function reference(root, refdata) {
  root.querySelectorAll('cite-ref').forEach(cite => {
    if (cite.index != null) {
      cite.data = refdata[cite.index - 1];
    }
  });
}
