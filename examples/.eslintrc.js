module.exports = {
  extends: [require.resolve("@umijs/fabric/dist/eslint")],
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
