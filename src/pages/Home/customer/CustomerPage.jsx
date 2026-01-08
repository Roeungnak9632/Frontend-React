import {
  Button,
  Input,
  Space,
  Table,
  Modal,
  Form,
  message,
  Tag,
  Select,
  Row,
  Col,
} from "antd";
import { useEffect, useState } from "react";
import { request } from "../../../util/request";
import { FiEdit } from "react-icons/fi";
import { ImBin } from "react-icons/im";
import { FaPlus } from "react-icons/fa6";
import { SearchOutlined } from "@ant-design/icons";
import { IoMdRefresh } from "react-icons/io";
import { LuTextSearch } from "react-icons/lu";
import dayjs from "dayjs";
import { dateClient } from "../../../util/helper";

export const CustomerPage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);

  const [state, setState] = useState({
    list: [],
    customer_type: [],
    loadingTable: false,
    open: false,
  });

  const [filter, setFilter] = useState({
    text_search: null,
    status_filter: null,
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  /* ================= FETCH ================= */

  const getList = async (param_filter = {}) => {
    param_filter = { ...filter, ...param_filter };
    let query = "?page=1";

    if (param_filter.text_search)
      query += "&text_search=" + param_filter.text_search;
    if (param_filter.status_filter)
      query += "&status_filter=" + param_filter.status_filter;
    if (param_filter.gender_filter)
      query += "&gender_filter=" + param_filter.gender_filter;

    setState((pre) => ({ ...pre, loadingTable: true }));

    const res = await request("customer" + query, "get");

    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        list: res.list || [],
        customer_type: res.customer_type || [],
      }));
    }

    setState((pre) => ({ ...pre, loadingTable: false }));
  };

  const getCustomerType = async () => {
    const res = await request("customer/customer-type", "get");
    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        customer_type: res.list || res.data || [],
      }));
    }
  };

  useEffect(() => {
    getList();
    getCustomerType();
  }, []);

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "NO.",
      render: (_, __, index) => index + 1,
      width: 70,
    },
    {
      title: "Customer Type",
      dataIndex: "customer_type_id",
      render: (id, record) => {
        const type = state.customer_type.find((t) => t.id === id);
        return <span>{type?.name || record.customer_type?.name || "-"}</span>;
      },
    },
    { title: "Name", dataIndex: "name" },
    {
      title: "Email",

      dataIndex: "email",
      render: (t) => t || "-",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (t) => t || "-",
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (t) => t || "-",
    },
    {
      title: "gender",
      dataIndex: "gender",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        if (!status) return "-";
        const color =
          status === "active"
            ? "green"
            : status === "inactive"
            ? "red"
            : "default";
        return <Tag color={color}>{status}</Tag>;
      },
    },

    {
      title: "Created At",
      dataIndex: "created_at",
      render: (d) => (d ? dateClient(d, "DD MMM YYYY h:mma") : "-"),
    },
    {
      title: "Action",
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <FiEdit
            color="green"
            style={{ cursor: "pointer", fontSize: 18 }}
            onClick={() => handleEdit(record)}
          />
          <ImBin
            color="red"
            style={{ cursor: "pointer", fontSize: 18 }}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const dataSource = state.list.map((item) => ({
    key: item.id,
    ...item,
  }));

  /* ================= CRUD ================= */

  const onFinish = async (values) => {
    const payload = {
      ...values,
      customer_date: values.customer_date
        ? values.customer_date.format("YYYY-MM-DD")
        : null,
    };

    const method = editId ? "put" : "post";
    const url = editId ? `customer/${editId}` : "customer";

    const res = await request(url, method, payload);

    if (res && !res.errors) {
      message.success(res.message);
      getList();
      handleCloseModal();
    } else {
      message.error(res?.message || "Failed to save customer");
    }
  };

  const handleOpenModal = () => {
    setState((p) => ({ ...p, open: true }));
    setEditId(null);
    form.resetFields();
  };

  const handleCloseModal = () => {
    setState((p) => ({ ...p, open: false }));
    setEditId(null);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditId(record.id);
    setState((p) => ({ ...p, open: true }));

    form.setFieldsValue({
      ...record,
      customer_date: record.customer_date ? dayjs(record.customer_date) : null,
      customer_type_id: record.customer_type_id,
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Customer",
      content: "Are you sure you want to delete this customer?",
      onOk: async () => {
        const res = await request(`customer/${record.id}`, "delete");
        if (res && !res.errors) {
          message.success(res.message);
          getList();
        }
      },
    });
  };

  const handleSearch = () => getList();

  const resetFilter = () => {
    const data = {
      text_search: null,
      status_filter: null,
      gender_filter: null,
    };
    setFilter(data);
    getList(data);
  };

  /* ================= RENDER ================= */

  return (
    <div>
      {/* FILTER */}
      <div
        className="bg-white font-bold"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 15,
          padding: 15,
          borderRadius: 5,
        }}
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
              <div>Customer Filter:</div>
            </Col>
            <Col xs={24} sm={24} md={8} lg={4} style={{ flexShrink: 0 }}>
              <Input
                placeholder="Search customer"
                prefix={<SearchOutlined />}
                allowClear
                value={filter.text_search}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, text_search: e.target.value }))
                }
                onPressEnter={handleSearch}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={4} style={{ flexShrink: 0 }}>
              <Select
                allowClear
                placeholder="Select By Status"
                style={{ width: 150 }}
                value={filter.status_filter}
                onChange={(v) =>
                  setFilter((p) => ({ ...p, status_filter: v || null }))
                }
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={6} style={{ flexShrink: 0 }}>
              <Select
                allowClear
                placeholder="Select By Gender"
                style={{ width: 150 }}
                value={filter.gender_filter}
                onChange={(v) =>
                  setFilter((p) => ({ ...p, gender_filter: v || null }))
                }
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                  { label: "Other", value: "Other" },
                ]}
              />
            </Col>
            <Col style={{ flexShrink: 0 }}>
              <Button type="primary" danger onClick={resetFilter}>
                <IoMdRefresh /> Reset
              </Button>
            </Col>
            <Col style={{ flexShrink: 0 }}>
              <Button type="primary" onClick={handleSearch}>
                <LuTextSearch /> Search
              </Button>
            </Col>
          </Row>
        </Space>

        <Button type="primary" onClick={handleOpenModal}>
          <FaPlus /> Add Customer
        </Button>
      </div>

      {/* TABLE */}
      <Table
        rowSelection={rowSelection}
        loading={state.loadingTable}
        size="small"
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} customer`,
        }}
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                style={{
                  backgroundColor: "#647E68",
                  color: "#fff",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              />
            ),
          },
        }}
        columns={columns}
        dataSource={dataSource}
      />

      {/* MODAL */}
      <Modal
        title={editId ? "Edit Customer" : "Add Customer"}
        open={state.open}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ customer_status: "pending" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Customer Type"
                name="customer_type_id"
                rules={[{ required: true, message: "Select customer type" }]}
              >
                <Select
                  placeholder="Select Customer Type"
                  options={state.customer_type.map((type) => ({
                    label: type.name,
                    value: type.id,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Name" name="name">
                <Input placeholder="Enter name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="Enter phone" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select Status"
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select Gender"
                  options={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "Other", value: "Other" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Address" name="address">
                <Input.TextArea placeholder="Address" rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editId ? "Update Customer" : "Create Customer"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
