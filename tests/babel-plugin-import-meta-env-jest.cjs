/**
 * Jest runs source through Babel; `import.meta` is not valid in the Jest CJS pipeline.
 * Replaces `import.meta.env.VITE_APP_VERSION` with `global.import.meta.env.VITE_APP_VERSION`
 * (see setupTests.js). Vite build does not use this file.
 */
module.exports = function babelPluginImportMetaEnvJest({ types: t }) {
  function isImportMeta(node) {
    return (
      t.isMetaProperty(node) &&
      t.isIdentifier(node.meta, { name: 'import' }) &&
      t.isIdentifier(node.property, { name: 'meta' })
    );
  }

  function globalImportMetaEnvViteVersion() {
    return t.memberExpression(
      t.memberExpression(
        t.memberExpression(
          t.memberExpression(t.identifier('global'), t.identifier('import')),
          t.identifier('meta')
        ),
        t.identifier('env')
      ),
      t.identifier('VITE_APP_VERSION')
    );
  }

  return {
    name: 'import-meta-env-jest',
    visitor: {
      MemberExpression(path) {
        const { node } = path;
        if (!t.isIdentifier(node.property, { name: 'VITE_APP_VERSION' })) return;
        if (!t.isMemberExpression(node.object)) return;
        if (!t.isIdentifier(node.object.property, { name: 'env' })) return;
        if (!isImportMeta(node.object.object)) return;
        path.replaceWith(globalImportMetaEnvViteVersion());
      },
    },
  };
};
