import {
  Input,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Col,
  Row,
} from "antd";
import { request } from "../../util/request";
import { useEffect, useState } from "react";
import { FaAddressBook, FaEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { dateClient } from "../../util/helper";
import MainPage from "../../components/Loyout/MainPage";
import { FiEdit } from "react-icons/fi";
import { ImBin } from "react-icons/im";
import { SearchOutlined } from "@ant-design/icons";
import { LuTextSearch } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";

export const Category = () => {
  const [state, setState] = useState({
    list: [],
    total: 0,
    loading: false,
    open: false,
  });

  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [validate, setValidate] = useState({});

  const [filter, setFilter] = useState({
    text_search: "",
    status_filter: "",
  });

  const getList = async () => {
    setState((pre) => ({ ...pre, loading: true }));

    let query_param = "?page=1";

    if (filter.text_search !== "" && filter.text_search !== null) {
      query_param += "&text_search=" + filter.text_search;
    }
    if (filter.status_filter !== "" && filter.status_filter !== null) {
      query_param += "&status_filter=" + filter.status_filter;
    }

    const res = await request("categories" + query_param, "get");

    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        list: res.list.sort((a, b) => b.id - a.id) || [],
        total: (res.list || []).length,
        loading: false,
      }));
    } else {
      setState((pre) => ({ ...pre, loading: false }));
      if (res.errors?.message) {
        message.error(res.errors?.message);
      }
    }
  };

  useEffect(() => {
    getList();
  }, []);

  // Modal handlers
  const handleOpenModal = () => {
    setEditId(null);
    form.resetFields();
    setValidate({});
    setState((pre) => ({ ...pre, open: true }));
  };

  const handleCloseModal = () => {
    form.resetFields();
    setValidate({});
    setEditId(null);
    setState((pre) => ({ ...pre, open: false }));
  };

  // Table columns
  const columns = [
    {
      title: "NO.",
      key: "index",
      align: "center",
      render: (text, record, index) => index + 1,
    },
    { key: "name", title: "Name", dataIndex: "name", align: "center" },

    {
      key: "description",
      title: <div style={{ textAlign: "left" }}>Description</div>,
      dataIndex: "description",
    },

    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (value) => (
        <Tag color={value === 1 ? "green" : "red"}>
          {value === 1 ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      key: "created_at",
      title: "Created At",
      dataIndex: "created_at",
      align: "center",
      render: (value) => dateClient(value),
    },

    {
      key: "action",
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (_, data) => (
        <Space>
          <FiEdit color="green" size={18} onClick={() => handleEdit(data)} />
          |
          <ImBin color="red" size={18} onClick={() => handleDelete(data)} />
        </Space>
      ),
    },
  ];

  const handleEdit = (data) => {
    setEditId(data.id);
    form.setFieldsValue({ ...data });
    setState((pre) => ({ ...pre, open: true }));
  };

  const handleDelete = async (data) => {
    Modal.confirm({
      title: "Delete",
      content: "Are you sure you want to delete this?",
      onOk: async () => {
        const res = await request("categories/" + data.id, "delete");
        if (res && !res.error) {
          message.success(res.message);
          getList();
        }
      },
    });
  };

  // Submit form
  const onFinish = async (item) => {
    const id = editId;
    const method = id ? "put" : "post";
    let url = "categories";

    if (id) {
      url += "/" + id;
    }

    const res = await request(url, method, item);
    console.log("categories Page onFinish res: ", res);
    if (res && !res.errors) {
      message.success(res.message);
      getList();
      handleCloseModal();
    } else {
      console.log("Error obj:", res);
      setValidate(res.errors || {});
    }
  };

  // Filtering
  const handleFilter = () => {
    getList();
  };

  return (
    <MainPage loading={state.loading}>
      <div className="role-page">
        <div
          className="main-page  bg-white"
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
                <div>Categories Filter: </div>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} style={{ flexShrink: 0 }}>
                <Input
                  prefix={<SearchOutlined style={{ color: "gray" }} />}
                  placeholder="Search categories"
                  allowClear
                  onChange={(e) =>
                    setFilter((pre) => ({
                      ...pre,
                      text_search: e.target.value,
                    }))
                  }
                />
              </Col>
              <Col xs={24} sm={24} md={8} lg={6} style={{ flexShrink: 0 }}>
                <Select
                  allowClear
                  placeholder="Select Status"
                  style={{ width: 150 }}
                  onChange={(value) =>
                    setFilter((pre) => ({
                      ...pre,
                      status_filter: value ?? "",
                    }))
                  }
                  options={[
                    { label: "Active", value: 1 },
                    { label: "Inactive", value: 0 },
                  ]}
                />
              </Col>
              <Col style={{ flexShrink: 0 }}>
                <Button type="primary" onClick={handleFilter}>
                  <LuTextSearch size={19} /> Search
                </Button>
              </Col>
            </Row>
          </Space>

          <Button type="primary" onClick={handleOpenModal}>
            <FaPlus /> Add Categories
          </Button>

          <Modal
            title={editId ? "Edit Categories" : "Add New Categories "}
            open={state.open}
            onCancel={handleCloseModal}
            footer={null}
            maskClosable={false}
          >
            <Form
              form={form}
              name="roleForm"
              layout="vertical"
              onFinish={onFinish}
            >
              {editId && (
                <Form.Item label="ID" name="id">
                  <Input disabled />
                </Form.Item>
              )}

              <Form.Item
                label="Name"
                name="name"
                {...validate.name}
                rules={[{ required: true, message: "Please input Name!" }]}
              >
                <Input placeholder="Enter name" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                {...validate.description}
                rules={[
                  { required: true, message: "Please input Description!" },
                ]}
              >
                <Input.TextArea placeholder="Description" rows={4} />
              </Form.Item>

              <Form.Item
                label="Status"
                name="status"
                {...validate.status}
                rules={[{ required: true, message: "Please select Status!" }]}
              >
                <Select
                  placeholder="Select Status"
                  options={[
                    { label: "Active", value: 1 },
                    { label: "Inactive", value: 0 },
                  ]}
                />
              </Form.Item>

              <div style={{ textAlign: "right" }}>
                <Space>
                  <Button onClick={handleCloseModal}>Cancel</Button>
                  <Button type="primary" htmlType="submit">
                    {editId ? "Save Change" : "Save"}
                  </Button>
                </Space>
              </div>
            </Form>
          </Modal>
        </div>

        <Table
          dataSource={state.list}
          columns={columns}
          size="small"
          scroll={{ x: 1000 }}
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#789DBC",
                    color: "#fff",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                />
              ),
            },
          }}
          rowKey="id"
        />
      </div>
    </MainPage>
  );
};
