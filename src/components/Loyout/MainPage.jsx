import { Spin } from "antd";
import React from "react";

const MainPage = ({ loading = false, children }) => {
  return <Spin spinning={loading}>{children}</Spin>;
};

export default MainPage;
