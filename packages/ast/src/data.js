export function getArticleData(ast) {
  return ast.data;
}

export function setArticleDataProperty(ast, name, value) {
  const data = ast.data || (ast.data = {});
  data[name] = value;
}

export function setArticleDataProperties(ast, properties) {
  const data = ast.data || (ast.data = {});
  for (const key in properties) {
    data[key] = properties[key];
  }
}
