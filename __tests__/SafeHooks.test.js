/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const ESLintTester = require("eslint").RuleTester;

const ReactHooksESLintPlugin = require("../dist");
const ReactHooksESLintRule = ReactHooksESLintPlugin.rules["exhaustive-deps"];

/**
 * A string template tag that removes padding from the left side of multi-line strings
 * @param {Array} strings array of code strings (only one expected)
 */
function normalizeIndent(strings) {
  const codeLines = strings[0].split("\n");
  const leftPadding = codeLines[1].match(/\s+/)[0];
  return codeLines.map((line) => line.substr(leftPadding.length)).join("\n");
}

// ***************************************************
// For easier local testing, you can add to any case:
// {
//   skip: true,
//   --or--
//   only: true,
//   ...
// }
// ***************************************************

// Tests that are valid/invalid across all parsers
const tests = {
  valid: [
    {
      code: normalizeIndent`
	  function MyComponent() {
	    const local = {};
	    useEffect(() => {
	      console.log(local);
	    });
	  }
	`,
    },
    {
      code: normalizeIndent`
      function MyComponent() {
        const dispatch = useDispatch();
        useEffect(() => {
          dispatch({});
        }, []);
      }
      `,
      options: [
        {
          safeHooks: [["useDispatch"], ["useHistory"], ["useForm", 0]],
        },
      ],
    },
    {
      code: normalizeIndent`
	  function MyComponent() {
	    const local = useCallback(() => {}, []);
	    useEffect(() => {
        local();
	    }, []);
	  }
	`,
    },
  ],
  invalid: [
    {
      code: normalizeIndent`
	  function MyComponent(props) {
	    useCallback(() => {
	      console.log(props.foo?.toString());
	    }, []);
	  }
	`,
      errors: [
        {
          message:
            "React Hook useCallback has a missing dependency: 'props.foo'. " +
            "Either include it or remove the dependency array.",
          suggestions: [
            {
              desc: "Update the dependencies array to be: [props.foo]",
              output: normalizeIndent`
		  function MyComponent(props) {
		    useCallback(() => {
		      console.log(props.foo?.toString());
		    }, [props.foo]);
		  }
		`,
            },
          ],
        },
      ],
    },
    {
      code: normalizeIndent`
      function MyComponent() {
        const dispatch = useDispatch();
        useEffect(() => {
          dispatch({});
        }, []);
      }
      `,
      errors: [
        {
          message:
            "React Hook useEffect has a missing dependency: 'dispatch'. " +
            "Either include it or remove the dependency array.",
          suggestions: [
            {
              desc: "Update the dependencies array to be: [dispatch]",
              output: normalizeIndent`
        function MyComponent() {
          const dispatch = useDispatch();
          useEffect(() => {
            dispatch({});
          }, [dispatch]);
        }
      `,
            },
          ],
        },
      ],
    },
  ],
};

// Tests that are only valid/invalid across parsers supporting Flow
const testsFlow = {
  valid: [
    // Ignore Generic Type Variables for arrow functions
    {
      code: normalizeIndent`
	  function Example({ prop }) {
	    const bar = useEffect(<T>(a: T): Hello => {
	      prop();
	    }, [prop]);
	  }
	`,
    },
  ],
  invalid: [
    {
      code: normalizeIndent`
	function Foo() {
	  const foo = ({}: any);
	  useMemo(() => {
	    console.log(foo);
	  }, [foo]);
	}
      `,
      errors: [
        {
          message:
            "The 'foo' object makes the dependencies of useMemo Hook (at line 6) change on every render. " +
            "Move it inside the useMemo callback. Alternatively, wrap the initialization of 'foo' in its own useMemo() Hook.",
          suggestions: undefined,
        },
      ],
    },
  ],
};

// Tests that are only valid/invalid across parsers supporting TypeScript
const testsTypescript = {
  valid: [
    {
      // `ref` is still constant, despite the cast.
      code: normalizeIndent`
	  function MyComponent() {
	    const ref = useRef() as React.MutableRefObject<HTMLDivElement>;
	    useEffect(() => {
	      console.log(ref.current);
	    }, []);
	  }
	`,
    },
    {
      code: normalizeIndent`
	  function MyComponent() {
	    const [state, setState] = React.useState<number>(0);
  
	    useEffect(() => {
	      const someNumber: typeof state = 2;
	      setState(prevState => prevState + someNumber);
	    }, [])
	  }
	`,
    },
    {
      code: normalizeIndent`
	  function App() {
	    const foo = {x: 1};
	    React.useEffect(() => {
	      const bar = {x: 2};
	      const baz = bar as typeof foo;
	      console.log(baz);
	    }, []);
	  }
	`,
    },
  ],
  invalid: [
    {
      // `local` is still non-constant, despite the cast.
      code: normalizeIndent`
	  function MyComponent() {
	    const local = {} as string;
	    useEffect(() => {
	      console.log(local);
	    }, []);
	  }
	`,
      errors: [
        {
          message:
            "React Hook useEffect has a missing dependency: 'local'. " +
            "Either include it or remove the dependency array.",
          suggestions: [
            {
              desc: "Update the dependencies array to be: [local]",
              output: normalizeIndent`
		  function MyComponent() {
		    const local = {} as string;
		    useEffect(() => {
		      console.log(local);
		    }, [local]);
		  }
		`,
            },
          ],
        },
      ],
    },
  ],
};

// For easier local testing
if (!process.env.CI) {
  let only = [];
  let skipped = [];
  [
    ...tests.valid,
    ...tests.invalid,
    //     ...testsFlow.valid,
    //     ...testsFlow.invalid,
    //     ...testsTypescript.valid,
    //     ...testsTypescript.invalid,
    //     ...testsTypescriptEslintParserV4.valid,
    //     ...testsTypescriptEslintParserV4.invalid,
  ].forEach((t) => {
    if (t.skip) {
      delete t.skip;
      skipped.push(t);
    }
    if (t.only) {
      delete t.only;
      only.push(t);
    }
  });
  const predicate = (t) => {
    if (only.length > 0) {
      return only.indexOf(t) !== -1;
    }
    if (skipped.length > 0) {
      return skipped.indexOf(t) === -1;
    }
    return true;
  };
  tests.valid = tests.valid.filter(predicate);
  tests.invalid = tests.invalid.filter(predicate);
  //   testsFlow.valid = testsFlow.valid.filter(predicate);
  //   testsFlow.invalid = testsFlow.invalid.filter(predicate);
  //   testsTypescript.valid = testsTypescript.valid.filter(predicate);
  //   testsTypescript.invalid = testsTypescript.invalid.filter(predicate);
}

describe("react-hooks", () => {
  const parserOptions = {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 6,
    sourceType: "module",
  };

  const testsBabelEslint = {
    valid: [
      //     ...testsFlow.valid,
      ...tests.valid,
    ],
    invalid: [
      //     ...testsFlow.invalid,
      ...tests.invalid,
    ],
  };

  //   new ESLintTester({
  //     parser: require.resolve("babel-eslint"),
  //     parserOptions,
  //   }).run("parser: babel-eslint", ReactHooksESLintRule, testsBabelEslint);

  new ESLintTester({
    parser: require.resolve("@babel/eslint-parser"),
    parserOptions,
  }).run(
    "parser: @babel/eslint-parser",
    ReactHooksESLintRule,
    testsBabelEslint
  );

  //   const testsTypescriptEslintParser = {
  //     valid: [...testsTypescript.valid, ...tests.valid],
  //     invalid: [...testsTypescript.invalid, ...tests.invalid],
  //   };

  //   new ESLintTester({
  //     parser: require.resolve("@typescript-eslint/parser-v2"),
  //     parserOptions,
  //   }).run(
  //     "parser: @typescript-eslint/parser@2.x",
  //     ReactHooksESLintRule,
  //     testsTypescriptEslintParser
  //   );

  //   new ESLintTester({
  //     parser: require.resolve("@typescript-eslint/parser-v3"),
  //     parserOptions,
  //   }).run(
  //     "parser: @typescript-eslint/parser@3.x",
  //     ReactHooksESLintRule,
  //     testsTypescriptEslintParser
  //   );

  //   new ESLintTester({
  //     parser: require.resolve("@typescript-eslint/parser-v4"),
  //     parserOptions,
  //   }).run("parser: @typescript-eslint/parser@4.x", ReactHooksESLintRule, {
  //     valid: [
  //       ...testsTypescriptEslintParserV4.valid,
  //       ...testsTypescriptEslintParser.valid,
  //     ],
  //     invalid: [
  //       ...testsTypescriptEslintParserV4.invalid,
  //       ...testsTypescriptEslintParser.invalid,
  //     ],
  //   });
});
