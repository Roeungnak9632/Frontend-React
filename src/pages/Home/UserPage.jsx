import {
  Button,
  Input,
  Space,
  Flex,
  Table,
  Modal,
  Form,
  message,
  Row,
  Col,
} from "antd";
import { useEffect, useState } from "react";
import { ImBin } from "react-icons/im";
import { FiEdit } from "react-icons/fi";
import { LuTextSearch } from "react-icons/lu";
import { SearchOutlined } from "@ant-design/icons";
import { FaPlus } from "react-icons/fa6";
import { request } from "../../util/request";

const UserPage = () => {
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [validate, setValidate] = useState({});

  const [state, setState] = useState({
    list: [],
    loadingTable: false,
    open: false,
  });

  const [filter, setFilter] = useState({
    text_search: "",
  });

  /* ========================== MODAL ========================== */
  const openModal = () => {
    setEditId(null);
    setValidate({});
    form.resetFields();
    setState((pre) => ({ ...pre, open: true }));
  };

  const closeModal = () => {
    setEditId(null);
    setValidate({});
    form.resetFields();
    setState((pre) => ({ ...pre, open: false }));
  };

  /* ========================== API ========================== */
  const getList = async () => {
    try {
      let query = "?page=1";
      if (filter.text_search) {
        query += `&text_search=${filter.text_search}`;
      }

      setState((pre) => ({ ...pre, loadingTable: true }));

      const res = await request("users" + query, "get");

      if (res && !res.errors) {
        setState((pre) => ({
          ...pre,
          list: Array.isArray(res.list)
            ? res.list.sort((a, b) => b.id - a.id)
            : [],
        }));
      }
    } catch {
      message.error("Failed to load users");
    } finally {
      setState((pre) => ({ ...pre, loadingTable: false }));
    }
  };

  useEffect(() => {
    getList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ========================== CRUD ========================== */
  const onFinish = async (values) => {
    try {
      const method = editId ? "put" : "post";
      const url = editId ? `users/${editId}` : "users";

      const res = await request(url, method, values);

      if (res?.success) {
        message.success(res.message);
        closeModal();
        getList();
      } else {
        setValidate({
          name: {
            validateStatus: "error",
            help: res?.errors?.name?.[0],
          },
          email: {
            validateStatus: "error",
            help: res?.errors?.email?.[0],
          },
        });
      }
    } catch {
      message.error("Save failed");
    }
  };

  const handleEdit = (record) => {
    setEditId(record.id);
    form.setFieldsValue(record);
    setState((pre) => ({ ...pre, open: true }));
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete User",
      content: "Are you sure you want to delete this user?",
      onOk: async () => {
        try {
          const res = await request(`users/${record.id}`, "delete");
          if (res?.success) {
            message.success(res.message);
            getList();
          }
        } catch {
          message.error("Delete failed");
        }
      },
    });
  };

  /* ========================== TABLE ========================== */
  const columns = [
    {
      title: "NO.",
      render: (_, __, index) => index + 1,
      width: 70,
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
      width: 250,
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Action",
      align: "center",
      render: (_, record) => (
        <Space>
          <FiEdit
            color="green"
            size={18}
            style={{ cursor: "pointer" }}
            onClick={() => handleEdit(record)}
          />
          |
          <ImBin
            color="red"
            size={18}
            style={{ cursor: "pointer" }}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="user-page">
      {/* ========================== FILTER ========================== */}
      <div
        className="main-page bg-white "
        style={{ padding: 15, marginBottom: 10, borderRadius: 5 }}
      >
        <Space>
          <Row
            gutter={[16, 16]}
            style={{
              whiteSpace: "nowrap",
              overflowX: "auto",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Col style={{ flexShrink: 0 }}>
              <div>User Filter:</div>
            </Col>
            <Col xs={24} sm={24} md={8} lg={10} style={{ flexShrink: 0 }}>
              <Input
                placeholder="Search name"
                prefix={<SearchOutlined />}
                allowClear
                onPressEnter={getList}
                onChange={(e) =>
                  setFilter((pre) => ({
                    ...pre,
                    text_search: e.target.value,
                  }))
                }
              />
            </Col>
            <Button type="primary" onClick={getList}>
              <LuTextSearch size={18} /> Search
            </Button>
          </Row>
        </Space>

        <Button type="primary" onClick={openModal}>
          <FaPlus /> Add User
        </Button>
      </div>

      {/* ========================== TABLE ========================== */}
      <Flex vertical gap="middle">
        <Table
          rowKey="id"
          size="small"
          scroll={{ x: 1000 }}
          loading={state.loadingTable}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          columns={columns}
          dataSource={state.list}
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#BBCB64",
                    color: "#fff",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                />
              ),
            },
          }}
        />
      </Flex>

      {/* ========================== MODAL ========================== */}
      <Modal
        title={editId ? "Edit User" : "Add New User"}
        open={state.open}
        onCancel={closeModal}
        footer={null}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {editId && (
            <Form.Item label="ID" name="id">
              <Input disabled />
            </Form.Item>
          )}

          <Form.Item
            label="Name"
            name="name"
            {...validate.name}
            rules={[{ required: true, message: "Please input name!" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            {...validate.email}
            rules={[
              { required: true, message: "Please input email!" },
              { type: "email", message: "Invalid email format!" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={closeModal}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editId ? "Save Change" : "Save"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserPage;
