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
  Upload,
  Image,
  Col,
  Row,
} from "antd";
import { request } from "../../../util/request";
import { useEffect, useState } from "react";
import { FaAddressBook, FaEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { dateClient, isPermissionAction } from "../../../util/helper";
import MainPage from "../../../components/Loyout/MainPage";
import config from "../../../util/config";
import { UploadButton } from "../../../components/button/UploadButton";
import { FiEdit } from "react-icons/fi";
import { ImBin } from "react-icons/im";
import { SearchOutlined } from "@ant-design/icons";
import { LuTextSearch } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";

export const BrandPage = () => {
  const [state, setState] = useState({
    list: [],
    total: 0,
    loading: false,
    open: false,
  });

  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [validate, setValidate] = useState({});
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
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

    const res = await request("brands" + query_param, "get");

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
    setFileList([]);
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
    {
      key: "image",
      width: "100px",
      title: "Image",
      dataIndex: "image",
      align: "center",
      render: (image) => (
        <div
          style={{
            width: 90,
            height: 80,
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
    {
      key: "code",
      title: "Code",
      dataIndex: "code",
      align: "center",
    },
    { key: "name", title: "Name", dataIndex: "name", align: "center" },
    {
      key: "from_country",
      title: "From Country",
      dataIndex: "from_country",
      align: "center",
    },

    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (value) => (
        <Tag color={value === "active" ? "green" : "red"}>
          {value === "active" ? "Active" : "Inactive"}
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
      title:
        isPermissionAction("Brand.Update") || isPermissionAction("Brand.Remove")
          ? "Action"
          : "",
      dataIndex: "action",
      align: "center",
      render: (_, data) => (
        <Space>
          {isPermissionAction("Brand.Update") && (
            <FiEdit color="green" size={19} onClick={() => handleEdit(data)} />
          )}
          |
          {isPermissionAction("Brand.Remove") && (
            <ImBin color="red" size={19} onClick={() => handleDelete(data)} />
          )}
        </Space>
      ),
    },
  ];

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

  const handleDelete = async (data) => {
    Modal.confirm({
      title: "Delete",
      content: "Are you sure you want to delete this?",
      onOk: async () => {
        const res = await request("brands/" + data.id, "delete");
        if (res && !res.error) {
          message.success(res.message);
          getList();
        }
      },
    });
  };

  // Submit form
  const onFinish = async (item) => {
    setLoading(true);
    let formData = new FormData();
    formData.append("name", item.name);
    formData.append("code", item.code);
    formData.append("from_country", item.from_country);
    formData.append("status", item.status);
    if (item.image && item.image.file) {
      if (item.image.file.originFileObj) {
        formData.append("image", item.image.file.originFileObj);
      } else if (item.image.file?.status == "removed") {
        let image_remove = item.image.file?.name;
        formData.append("image_remove", image_remove);
      }
    }
    const id = editId;
    formData.append("_method", id ? "PUT" : "POST");
    let url = "brands";

    if (id) {
      url += "/" + id;
    }

    const res = await request(url, "post", formData);
    console.log("brands Page onFinish res: ", res);
    if (res && !res.errors) {
      message.success(res.message);
      getList();
      handleCloseModal();
    } else {
      console.log("Error obj:", res);
      setValidate(res.errors || {});
    }
    setLoading(false);
  };

  // Filtering
  const handleFilter = () => {
    getList();
  };

  return (
    <MainPage loading={state.loading}>
      <div className="role-page">
        <div
          className="main-page   bg-white"
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
                <div>Brand Filter:</div>
              </Col>

              <Col xs={24} sm={24} md={8} lg={8} style={{ flexShrink: 0 }}>
                <Input
                  prefix={<SearchOutlined style={{ color: "gray" }} />}
                  placeholder="Search brands"
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
                  style={{ width: "140px" }}
                  onChange={(value) =>
                    setFilter((pre) => ({
                      ...pre,
                      status_filter: value ?? "",
                    }))
                  }
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
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
          {isPermissionAction("Brand.Create") && (
            <Button type="primary" onClick={handleOpenModal}>
              <FaPlus /> Add Brand
            </Button>
          )}

          <Modal
            title={editId ? "Edit brands" : "Add New brands "}
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
                label="Code"
                name="code"
                {...validate.code}
                rules={[{ required: true, message: "Please input Code!" }]}
              >
                <Input placeholder="Enter Code" />
              </Form.Item>
              <Form.Item
                label="From Country"
                name="from_country"
                {...validate.from_country}
                rules={[
                  { required: true, message: "Please input From Country!" },
                ]}
              >
                <Input placeholder="Enter From Country" />
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
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                />
              </Form.Item>
              <Form.Item name={"image"} label="Image" {...validate.image}>
                <Upload
                  maxCount={1}
                  listType="picture-card"
                  customRequest={(e) => {
                    e.onSuccess();
                  }}
                  style={{ marginBottom: "10px" }}
                  fileList={fileList}
                  onChange={({ fileList }) => {
                    setFileList(fileList);
                  }}
                >
                  <UploadButton />
                </Upload>
              </Form.Item>

              <div style={{ textAlign: "right" }}>
                <Space>
                  <Button onClick={handleCloseModal}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {editId ? "Save Change" : "Save"}
                  </Button>
                </Space>
              </div>
            </Form>
          </Modal>
        </div>

        <Table
          size="small"
          dataSource={state.list}
          columns={columns}
          scroll={{ x: 1000 }}
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#F7B980",
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
