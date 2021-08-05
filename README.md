# eslint-plugin-fake-react-hooks

## 背景

在使用了 `eslint-plugin-react-hooks` 插件后能够对 `hook deps` 进行校验，提示缺少哪些依赖。如

```tsx
function App() {
  const [value, setValue] = useState(0);

  const handleClick = useCallback(() => {
    if (value > 10) {
      setValue(value - 1);
      return;
    }
    setValue(value + 1);
  }, []);

  return <div onClick={handleClick}>click it</div>;
}
```

此时会提示

```bash
React Hook useCallback has missing dependencies: 'value'. Either include them or remove the dependency array
```

`value` 是需要依赖的，`setValue` 不需要，这是插件内部判断的。

但实际业务开发中，存在许多三方 `hooks` 以及自定义 `hooks`，最常见的如 `useDispatch`、`useForm`

```tsx
function App() {
  const dispatch = useDispatch();

  const handleClick = useCallback(() => {
    dispatch({ type: "updateValue" });
  }, []);

  return <div onClick={handleClick}>click it</div>;
}
```

我们知道 `dispatch` 是不会变的，但 `eslint` 仍会提示

```bash
React Hook useCallback has missing dependencies: 'dispatch'. Either include them or remove the dependency array
```

## 进度

这个问题在 `react issues` 中也被提过多次了，有问如何避免校验 `dispatch` 的，然后出现了许多「骚操作」

```js
const mounted = () => {
  dispatch(something());
};

useEffect(mounted, []);
```

又或者

```js
const initFetch = useCallback(() => {
  dispatch(fetchPosts());
}, [dispatch]);

useEffect(() => {
  initFetch();
}, [initFetch]);
```

这些都没有从根本上解决这个问题，即支持指定某些 `hooks` 是「安全」、「稳定」的，就好像 `useState` 返回值中的 `setter`。
幸运的是已经有人[提出并正在开发](https://github.com/facebook/react/issues/20205)，但不幸的是这个进度不是很理想。

基于这些原因，本项目产生了，它支持自定义 `safeHooks`

## 使用方式

考虑到官方之后还是会增加该功能，所以没有作为 `npm` 包发布，可以手动将仓库中的 `dist/index.js` 覆盖项目中 `node_modules/eslint-plugin-react-hooks/cjs/eslint-plugin-react-hooks.development.js` 文件，全量覆盖即可。

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

配置完成后，之前会报错的如下代码将不再报错

```tsx
function App() {
  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const handleClick = useCallback(() => {
    const values = form.getFieldsValue();
    dispatch({ type: "updateValue" });
    history.push("/");
  }, []);

  return <div onClick={handleClick}>click it</div>;
}
```

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
