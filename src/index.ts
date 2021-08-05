import RulesOfHooks from "./RulesOfHooks";
import ExhaustiveDeps from "./ExhaustiveDeps";

export const configs = {
  recommended: {
    plugins: ["react-hooks"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
};

export const rules = {
  "rules-of-hooks": RulesOfHooks,
  "exhaustive-deps": ExhaustiveDeps,
};
