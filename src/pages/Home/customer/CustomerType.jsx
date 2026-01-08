import {
  Button,
  Input,
  Select,
  Space,
  Table,
  Modal,
  Form,
  message,
  Tag,
  Col,
  Row,
} from "antd";
import { request } from "../../../util/request";
import { useEffect, useState } from "react";
import { ImBin } from "react-icons/im";
import { FiEdit } from "react-icons/fi";
import { LuTextSearch } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";
import { SearchOutlined } from "@ant-design/icons";

export const CustomerType = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [validate, setValidate] = useState({});
  const [state, setState] = useState({
    list: [],
    loadingTable: false,
    open: false,
  });
  const [filter, setFilter] = useState({ text_search: "" });

  // Modal handlers
  const handleCloseModal = () => {
    setState((pre) => ({ ...pre, open: false }));
    setEditId(null);
    form.resetFields();
    setValidate({});
  };
  const handleOpenModal = () => {
    setState((pre) => ({ ...pre, open: true }));
    setEditId(null);
    form.resetFields();
    setValidate({});
  };

  // Table row selection
  const onSelectChange = (newSelectedRowKeys) =>
    setSelectedRowKeys(newSelectedRowKeys);
  const rowSelection = { selectedRowKeys, onChange: onSelectChange };

  // Fetch list
  const getList = async () => {
    let query_param = "?page=1";
    if (filter.text_search) query_param += "&text_search=" + filter.text_search;

    setState((pre) => ({ ...pre, loadingTable: true }));
    const res = await request("customer/customer-type" + query_param, "get");

    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        list: res.list.sort((a, b) => b.id - a.id),
      }));
    }
    setState((pre) => ({ ...pre, loadingTable: false }));
  };

  useEffect(() => {
    getList();
  }, []);

  const handleFilter = () => getList();

  const handleEdit = (data) => {
    setState((pre) => ({ ...pre, open: true }));
    setEditId(data.id);
    form.setFieldsValue({ ...data });
  };

  const handleDelete = async (data) => {
    Modal.confirm({
      title: "Delete",
      content: "Are you sure you want to delete this?",
      onOk: async () => {
        const res = await request(
          "customer/customer-type/" + data.id,
          "delete"
        );
        if (res && !res.error) {
          message.success(res.message);
          getList();
        }
      },
    });
  };

  const onFinish = async (item) => {
    const id = editId;
    const method = id ? "put" : "post";
    let url = "customer/customer-type";
    if (id) url += "/" + id;

    const res = await request(url, method, item);
    if (res && !res.errors) {
      message.success(res.message);
      getList();
      handleCloseModal();
    } else {
      setValidate(res.errors || {});
    }
  };

  const columns = [
    {
      title: "NO.",
      dataIndex: "id",
      render: (text, record, index) => index + 1,
      width: 70,
    },
    { title: "Name", dataIndex: "name", width: 300 },
    {
      title: "Description",
      dataIndex: "description",
      render: (text) => <div>{text || "-"}</div>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const color = status === "active" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
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

  const dataSource = state.list?.map((item, index) => ({
    key: index,
    ...item,
  }));

  return (
    <div>
      <div className="role-page">
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
                <div>CustomerType Filter: </div>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} style={{ flexShrink: 0 }}>
                <Input
                  placeholder="Search customer types"
                  prefix={<SearchOutlined style={{ color: "gray" }} />}
                  allowClear
                  onChange={(e) =>
                    setFilter((pre) => ({
                      ...pre,
                      text_search: e.target.value,
                    }))
                  }
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
            <FaPlus /> Add CustomerType
          </Button>
        </div>

        <Table
          loading={state.loadingTable}
          rowSelection={rowSelection}
          size="small"
          scroll={{ x: 1000 }}
          columns={columns}
          dataSource={dataSource}
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#FF9A00",
                    color: "#fff",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                />
              ),
            },
          }}
        />
      </div>

      <Modal
        title={editId ? "Edit CustomerType" : "Add New CustomerType"}
        open={state.open}
        onCancel={handleCloseModal}
        footer={null}
        maskClosable={false}
      >
        <Form form={form} name="roleForm" layout="vertical" onFinish={onFinish}>
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
          >
            <Input.TextArea placeholder="Description" rows={4} />
          </Form.Item>

          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select
              placeholder="Select Status"
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
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
  );
};
