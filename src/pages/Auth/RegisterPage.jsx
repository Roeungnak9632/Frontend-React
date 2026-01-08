import React, { useState } from "react";
import { LockOutlined, UserOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Col, Upload, Card, Typography } from "antd";
import { MdOutlineEmail, MdPhone } from "react-icons/md";
import { profileStore } from "../../store/ProfileStore";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../../util/request";

const { Title, Text } = Typography;

export const RegisterPage = () => {
  const { setProfile, setAccessToken } = profileStore();
  const navigate = useNavigate();
  const [errors, setError] = useState({});
  const [fileList, setFileList] = useState([]);

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("password", values.password);
    formData.append("password_confirmation", values.password_confirmation);
    formData.append("address", values.address || "");

    if (values.image?.file?.originFileObj) {
      formData.append("image", values.image.file.originFileObj);
    }

    const res = await request("register", "post", formData);

    if (res && !res.errors) {
      setProfile(res.user);
      setAccessToken(res.access_token);
      navigate("/login");
    } else {
      setError(res.errors || {});
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
      }}
    >
      <Card
        style={{
          width: 370,
          borderRadius: 10,
          border: "1px solid gray",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <Title level={3} style={{ marginBottom: 1 }}>
            Register Account
          </Title>
          <Text type="secondary">Enter your information</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Row gutter={6}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Your name" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                {...errors?.email}
                rules={[{ required: true, message: "Email is required" }]}
              >
                <Input prefix={<MdOutlineEmail />} placeholder="Email" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                {...errors?.password}
                rules={[{ required: true, message: "Password is required" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Confirm Password"
                name="password_confirmation"
                {...errors?.password_confirmation}
                rules={[{ required: true, message: "Confirm password" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm password"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: "Phone is required" }]}
              >
                <Input prefix={<MdPhone />} placeholder="Phone number" />
              </Form.Item>
            </Col>

            <Col span={16}>
              <Form.Item label="Address" name="address">
                <Input.TextArea rows={3} placeholder="Address (optional)" />
              </Form.Item>
            </Col>

            {/* Image Upload */}
            <Col span={8} style={{ textAlign: "center" }}>
              <Form.Item label="Profile Image" name="image">
                <Upload
                  accept="image/*"
                  listType="picture-card"
                  fileList={fileList}
                  customRequest={(e) => e.onSuccess()}
                  onChange={({ fileList }) => setFileList(fileList)}
                  style={{ width: 80, height: 80 }}
                >
                  {fileList.length >= 1 ? null : <PlusOutlined />}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit" block size="large">
            Sign In
          </Button>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Text>
              Already have an account? <Link to="/login">Login now</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};
