# eslint-plugin-fake-react-hooks

## Usage

可以手动将仓库中的 `dist/index.js` 覆盖项目中 `node_modules/eslint-plugin-react-hooks/cjs/eslint-plugin-react-hooks.development.js` 文件，全量覆盖即可。

在 `.eslintrc` 文件中，增加配置项

```js
module.exports = {
  plugins: ["react-hooks"],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        safeHooks: [["useDispatch"], ["useHistory"], ["useForm", 0]],
      },
    ],
  },
};
```

> 配置项具体含义可参考 https://github.com/facebook/react/issues/20205#issuecomment-792134189

## Example

本项目安装依赖后，执行

```bash
yarn replace
# 等同于 node scripts/replace
```

会将 `node_modules` 中的 `eslint-plugin-react-hooks` 源码替换为本项目打包的源码。
然后就可以实际运行测试了。

```bash
yarn test
# 等同于 yarn eslint examples/index.tsx --config examples/.eslintrc.js
```

修改 `eslintrc` 中的配置项后重新 `yarn test` 能看到插件是否真的生效了。

## 原理

核心原理在 `src/ExhaustiveDeps.ts` 文件中 `237-289`，其他部分几乎没有改动。

## todo

更多测试用例
