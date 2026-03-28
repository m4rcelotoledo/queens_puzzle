/**
 * Jest runs source through Babel; `import.meta` is not valid in the Jest CJS pipeline.
 * Replaces `import.meta.env.<KEY>` with `global.import.meta.env.<KEY>` (see setupTests.js).
 * Vite build does not use this file.
 */
module.exports = function babelPluginImportMetaEnvJest({ types: t }) {
  function isImportMeta(node) {
    return (
      t.isMetaProperty(node) &&
      t.isIdentifier(node.meta, { name: 'import' }) &&
      t.isIdentifier(node.property, { name: 'meta' })
    );
  }

  function globalImportMetaEnvMember(key) {
    return t.memberExpression(
      t.memberExpression(
        t.memberExpression(
          t.memberExpression(t.identifier('global'), t.identifier('import')),
          t.identifier('meta')
        ),
        t.identifier('env')
      ),
      t.identifier(key)
    );
  }

  return {
    name: 'import-meta-env-jest',
    visitor: {
      MemberExpression(path) {
        const { node } = path;
        // import.meta.env.ANY_KEY
        if (!t.isIdentifier(node.property)) return;
        if (!t.isMemberExpression(node.object)) return;
        const envAccess = node.object;
        if (!t.isIdentifier(envAccess.property, { name: 'env' })) return;
        if (!isImportMeta(envAccess.object)) return;

        path.replaceWith(globalImportMetaEnvMember(node.property.name));
      },
    },
  };
};
