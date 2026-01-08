import {
  Button,
  Input,
  Select,
  Space,
  Table,
  Modal,
  Form,
  message,
  Image,
  Tag,
  Upload,
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
import config from "../../../util/config";
import { UploadButton } from "../../../components/button/UploadButton";

export const SupplierPage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [validate, setValidate] = useState({});
  const [state, setState] = useState({
    list: [],
    loadingTable: false,
    open: false,
  });
  const [filter, setFilter] = useState({ text_search: "" });

  // Close modal
  const handleCloseModal = () => {
    setState((pre) => ({ ...pre, open: false }));
    setEditId(null);
    form.resetFields();
    setValidate({});
    setFileList([]);
  };

  // Open modal (for Add New)
  const handleOpenModal = () => {
    setState((pre) => ({ ...pre, open: true }));
    setEditId(null);
    form.resetFields();
    setValidate({});
    setFileList([]); // <-- reset fileList here
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
    const res = await request("supplier" + query_param, "get");

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
    setEditId(data.id);
    setFileList([
      {
        uid: -data.id,
        name: data.image,
        status: "done",
        url: config.image_path + data.image,
      },
    ]);
    form.setFieldsValue({ ...data });
    setState((pre) => ({ ...pre, open: true }));
  };
  // Delete handler
  const handleDelete = async (data) => {
    Modal.confirm({
      title: "Delete",
      content: "Are you sure you want to delete this?",
      onOk: async () => {
        const res = await request("supplier/" + data.id, "delete");
        if (res && !res.error) {
          message.success(res.message);
          getList();
        }
      },
    });
  };

  const onFinish = async (item) => {
    try {
      let formData = new FormData();
      formData.append("name", item.name);
      formData.append("phone", item.phone);
      formData.append("address", item.address || "");
      formData.append("website", item.website || "");
      formData.append("email", item.email || "");
      formData.append("status", item.status);

      // Only append file if a new file is selected
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      const id = editId;
      formData.append("_method", id ? "PUT" : "POST");

      let url = "supplier";
      if (id) url += "/" + id;

      const res = await request(url, "post", formData);

      if (res && !res.errors) {
        message.success(res.message);
        getList();
        handleCloseModal();
      } else {
        setValidate(res.errors || {});
      }
    } catch (err) {
      console.error(err);
      message.error("Something went wrong!");
    }
  };

  // Table columns
  const columns = [
    {
      title: "NO.",
      dataIndex: "id",
      render: (text, record, index) => index + 1,
      width: 70,
    },
    { title: "Name", dataIndex: "name" },
    {
      title: "Image",
      dataIndex: "image",
      render: (image) => (
        <div
          style={{
            width: 50,
            height: 50,
            margin: "0 auto",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            src={config.image_path + image}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            preview={true}
          />
        </div>
      ),
    },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Website", dataIndex: "website" },
    {
      title: "Address",
      dataIndex: "address",
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
          className="main-page bg-white font-bold"
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
                <div>Supplier Filter: </div>
              </Col>
              <Col xs={24} sm={24} md={8} lg={10} style={{ flexShrink: 0 }}>
                <Input
                  placeholder="Search supplier"
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
              <Col xs={24} sm={24} md={8} lg={6} style={{ flexShrink: 0 }}>
                <Button type="primary" onClick={handleFilter}>
                  <LuTextSearch size={19} /> Search
                </Button>
              </Col>
            </Row>
          </Space>
          <Button type="primary" onClick={handleOpenModal}>
            <FaPlus /> Add Supplier
          </Button>
        </div>

        <Table
          loading={state.loadingTable}
          rowSelection={rowSelection}
          columns={columns}
          size="small"
          scroll={{ x: 1000 }}
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
        title={editId ? "Edit Supplier" : "Add New Supplier"}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                {...validate.name}
                rules={[{ required: true, message: "Please input Name!" }]}
              >
                <Input placeholder="Enter name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone" name="phone" {...validate.phone}>
                <Input placeholder="Enter phone" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="email" name="email" {...validate.email}>
                <Input placeholder="Enter Email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Website" name="website" {...validate.website}>
                <Input placeholder="Enter Website" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="address" name="address" {...validate.address}>
                <Input.TextArea placeholder="Address" rows={4} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="image" label="Image" {...validate.image}>
                <Upload
                  maxCount={1}
                  listType="picture-card"
                  customRequest={(e) => e.onSuccess()}
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                >
                  <UploadButton />
                </Upload>
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
          </Row>
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
