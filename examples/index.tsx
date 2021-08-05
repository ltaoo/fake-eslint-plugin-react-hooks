import React, { useState, useCallback } from "react";

import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import Form from "antd/lib/form";

function App() {
  const [value, setValue] = useState(null);
  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const handleClick = useCallback(() => {
    const values = form.getFieldsValue();
    if (value === null) {
      setValue(values);
      dispatch({ type: "updateValue", payload: values });
      history.push("/");
    }
  }, []);

  return <div onClick={handleClick}>click it</div>;
}

export default App;
