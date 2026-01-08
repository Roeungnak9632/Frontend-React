import React, { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Flex,
  message,
  Spin,
  Divider,
  Typography,
  Space,
} from "antd";
import { profileStore } from "../../store/ProfileStore";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../../util/request";
import logo from "../../assets/img/logo_brand.png";

const LoginPage = () => {
  const { setProfile, setAccessToken, setPermisison } = profileStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const params = {
      email: values.username,
      password: values.password,
    };
    setLoading(true);
    const res = await request("login", "post", params);
    console.log("API RESPONSE:", res);
    if (res && !res.errors) {
      setProfile({
        ...res.user?.profile,
        ...res.user,
      });
      setAccessToken(res.access_token);
      setPermisison(res.permission);
      navigate("/");
      message.success(res.message);
    } else {
      message.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Spin spinning={loading} tip={"loading..."}>
        <div
          style={{
            width: 370,
            height: "auto",
            backgroundColor: "white",
            // boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
            border: "1px solid gray",
            padding: 25,
            borderRadius: 5,
          }}
        >
          <div
            style={{
              marginBottom: 6,
              display: "flex",
              justifyContent: "left",
              alignItems: "center",
              gap: 5,
            }}
          >
            <div className="rounded-4xl" style={{ marginBottom: 2 }}>
              <img
                src={logo}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1px solid gray",
                }}
                alt=""
              />
            </div>
            <div>
              <h2
                className="font-bold"
                style={{ fontSize: 13, color: "#57564F" }}
              >
                KSPHOP COMPUTER NK
              </h2>
              <p style={{ fontSize: 9, color: "#7A7A73" }}>
                {" "}
                Computer Software and Hardware
              </p>
            </div>
          </div>
          <div
            className="flex  flex-col justify-center items-center"
            style={{ marginTop: 5 }}
          >
            <h4 className="font-bold">Welcome Back!</h4>
            <p style={{ fontSize: 12, color: "gray" }}>
              Please login in to your account
            </p>
          </div>
          <Form
            name="login"
            layout="vertical"
            initialValues={{ remember: true }}
            style={{ maxWidth: 360, marginTop: 12 }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Email Address"
              name="username"
              rules={[{ required: true, message: "Please input your Email!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item>
              <Flex justify="space-between" align="center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <a href="">Forgot password</a>
              </Flex>
            </Form.Item>
            <Form.Item>
              <Button block type="primary" htmlType="submit">
                Login
              </Button>

              {/* <p style={{ textAlign: "center", marginTop: 10 }}>
                You don't have an account ?{" "}
                <Link to="/register">Register now!</Link>
              </p> */}
            </Form.Item>
          </Form>
          <p style={{ fontSize: 9, textAlign: "center", color: "gray" }}>
            &copy; copyright 2025 Roeung Nak. All rights reserved.
          </p>
        </div>
      </Spin>
    </div>
  );
};

export default LoginPage;
