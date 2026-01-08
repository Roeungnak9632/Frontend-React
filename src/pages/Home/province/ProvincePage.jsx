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
} from "antd";
import { request } from "../../../util/request";
import { useEffect, useState } from "react";
import { FaAddressBook, FaEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { dateClient } from "../../../util/helper";
import MainPage from "../../../components/Loyout/MainPage";

export const ProvincePage = () => {
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

    const res = await request("provinces" + query_param, "get");

    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        list: (res.list || []).sort((a, b) => b.id - a.id),
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
      title: "លរ.",
      key: "index",
      align: "center",
      render: (text, record, index) => index + 1,
    },
    { key: "name", title: "ឈ្មោះ", dataIndex: "name", align: "center" },
    { key: "code", title: "Code", dataIndex: "code", align: "center" },

    {
      key: "description",
      title: "បរិយាយ",
      dataIndex: "description",
      align: "center",
    },

    {
      key: "distand_from_city",
      title: "Distand From City",
      dataIndex: "distand_from_city",
      align: "center",
    },
    {
      key: "status",
      title: "ស្ថានភាព",
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
      title: "បង្កើតនៅថ្ងៃ",
      dataIndex: "created_at",
      align: "center",
      render: (value) => dateClient(value),
    },

    {
      key: "action",
      title: "សកម្មភាព",
      dataIndex: "action",
      align: "center",
      render: (_, data) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(data)}>
            <FaEdit size={18} /> Edit
          </Button>
          <Button danger type="primary" onClick={() => handleDelete(data)}>
            <MdDeleteOutline size={20} /> Delete
          </Button>
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
        const res = await request("provinces/" + data.id, "delete");
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
    let url = "provinces";

    if (id) {
      url += "/" + id;
    }

    const res = await request(url, method, item);
    console.log("provinces Page onFinish res: ", res);
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
        <div className="main-page" style={{ marginBottom: 16 }}>
          <Space>
            <div>មុខតំណែង: {state.total}</div>

            <Input.Search
              placeholder="Search"
              allowClear
              onChange={(e) =>
                setFilter((pre) => ({
                  ...pre,
                  text_search: e.target.value,
                }))
              }
            />

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

            <Button type="primary" onClick={handleFilter}>
              Filter
            </Button>
          </Space>

          <Button type="primary" onClick={handleOpenModal}>
            <FaAddressBook /> បង្កើតថ្មី
          </Button>

          <Modal
            title={editId ? "Edit Provinces" : "Add New Provinces "}
            open={state.open}
            onCancel={handleCloseModal}
            footer={null}
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
                label="Code"
                name="code"
                {...validate.code}
                rules={[{ required: true, message: "Please input Code!" }]}
              >
                <Input placeholder="Enter you code" />
              </Form.Item>
              <Form.Item
                label="Distand From City"
                name="distand_from_city"
                {...validate.distand_from_city}
                rules={[
                  {
                    required: true,
                    message: "Please input Distand From City!",
                  },
                ]}
              >
                <Input placeholder="Enter your Distand From City" />
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
                    {editId ? "Edit" : "Save"}
                  </Button>
                </Space>
              </div>
            </Form>
          </Modal>
        </div>

        <Table dataSource={state.list} columns={columns} rowKey="id" />
      </div>
    </MainPage>
  );
};
