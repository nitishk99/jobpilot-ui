function replaceViteEnv({ types }) {
  return {
    visitor: {
      MemberExpression(path) {
        const { object, property } = path.node;
        if (
          types.isMetaProperty(object)
          && object.meta.name === 'import'
          && object.property.name === 'meta'
          && types.isIdentifier(property, { name: 'env' })
        ) {
          path.replaceWith(types.memberExpression(types.identifier('process'), types.identifier('env')));
        }
      },
    },
  };
}

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [replaceViteEnv],
};
