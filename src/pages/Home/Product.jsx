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
  Row,
  Image,
  Col,
} from "antd";
import { request } from "../../util/request";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { isPermissionAction } from "../../util/helper";
import MainPage from "../../components/Loyout/MainPage";
import config from "../../util/config";
import { UploadButton } from "../../components/button/UploadButton";
import { ImBin } from "react-icons/im";
import { FiEdit } from "react-icons/fi";
import { LuTextSearch } from "react-icons/lu";
import { IoMdRefresh } from "react-icons/io";
import { SearchOutlined } from "@ant-design/icons";

export const Product = () => {
  const [state, setState] = useState({
    list: [],
    category: [],
    brand: [],
    total: 0,
    loading: false,
    open: false,
  });

  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(10);
  const [editId, setEditId] = useState(null);
  const [validate, setValidate] = useState({});
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState({
    text_search: null,
    status_filter: null,
    category_id: null,
    brand_id: null,
  });

  const loadCategoriesAndBrands = async () => {
    try {
      const catRes = await request("categories", "get");
      const brandRes = await request("brands", "get");

      setState((prev) => ({
        ...prev,
        category: catRes?.list || catRes?.data || catRes || [],
        brand: brandRes?.list || brandRes?.data || brandRes || [],
      }));
    } catch (err) {
      console.log("Error loading categories/brands:", err);
      message.error("Cannot load categories and brands");
    }
  };

  const getList = async (param_filter = {}) => {
    const currentFilter = { ...filter, ...param_filter };
    setState((pre) => ({ ...pre, loading: true }));

    let query_param = "?page=1";

    if (currentFilter.text_search) {
      query_param +=
        "&text_search=" + encodeURIComponent(currentFilter.text_search);
    }
    if (currentFilter.status_filter) {
      query_param += "&status_filter=" + currentFilter.status_filter;
    }
    if (currentFilter.category_id) {
      query_param += "&category_id=" + currentFilter.category_id;
    }
    if (currentFilter.brand_id) {
      query_param += "&brand_id=" + currentFilter.brand_id;
    }

    const res = await request("products" + query_param, "get");

    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        list: (res.list || []).sort((a, b) => b.id - a.id),
        total: (res.list || []).length,
        loading: false,
      }));
    } else {
      setState((pre) => ({ ...pre, loading: false }));
      if (res?.errors?.message) {
        message.error(res.errors.message);
      }
    }
  };

  useEffect(() => {
    loadCategoriesAndBrands();
    getList();
  }, []);

  // Modal handlers
  const handleOpenModal = () => {
    setEditId(null);
    form.resetFields();
    setValidate({});
    setFileList([]);
    setState((pre) => ({ ...pre, open: true }));
  };

  const handleCloseModal = () => {
    form.resetFields();
    setValidate({});
    setFileList([]);
    setEditId(null);
    setState((pre) => ({ ...pre, open: false }));
  };

  // Table columns (unchanged)
  const columns = [
    {
      title: "NO",
      key: "index",
      align: "center",
      width: 100,
      render: (text, record, index) => index + 1,
    },
    {
      key: "image",
      title: "Image",
      dataIndex: "image",
      width: 120,
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
      key: "prd_name",
      title: "Name",
      dataIndex: "prd_name",
      align: "center",
      width: 160,
    },
    {
      key: "price",
      title: "Price",
      width: 100,
      dataIndex: "price",
      align: "center",
      render: (price) => <span>{price}$</span>,
    },
    {
      key: "quantity",
      width: 100,
      title: "Quantity",
      dataIndex: "quantity",
      align: "center",
      render: (qty) => <span>{qty} pcs</span>,
    },
    {
      key: "category",
      title: "Category",
      dataIndex: "category",
      width: 120,
      align: "center",
      render: (category) => <span>{category?.name || "-"}</span>,
    },
    {
      key: "brand",
      title: "Brand",
      width: 100,
      dataIndex: "brand",
      align: "center",
      render: (brand) => <span>{brand?.name || "-"}</span>,
    },
    {
      key: "description",

      title: <div style={{ textAlign: "left" }}>Description</div>,
      dataIndex: "description",
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      width: 100,
      align: "center",
      render: (value) => (
        <Tag color={value === 1 ? "green" : "red"}>
          {value === 1 ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      key: "action",
      width: 100,
      title:
        isPermissionAction("Product.Update") ||
        isPermissionAction("Product.Remove")
          ? "Action"
          : "",
      dataIndex: "action",
      align: "center",
      render: (_, data) => (
        <Space style={{ cursor: "pointer" }}>
          {isPermissionAction("Product.Update") && (
            <FiEdit color="green" size={19} onClick={() => handleEdit(data)} />
          )}
          |
          {isPermissionAction("Product.Remove") && (
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
    form.setFieldsValue({
      ...data,
      category_id: data.category?.id || data.category_id,
      brand_id: data.brand?.id || data.brand_id,
    });
    setState((pre) => ({ ...pre, open: true }));
  };

  const handleDelete = async (data) => {
    Modal.confirm({
      title: "Delete",
      content: "Are you sure you want to delete this?",
      onOk: async () => {
        const res = await request("products/" + data.id, "delete");
        if (res && !res.error) {
          message.success(res.message);
          getList();
        }
      },
    });
  };

  const onFinish = async (item) => {
    setLoading(true);

    let formData = new FormData();
    formData.append("prd_name", item.prd_name);
    formData.append("price", item.price);
    formData.append("quantity", item.quantity);
    formData.append("category_id", item.category_id);
    formData.append("brand_id", item.brand_id);
    formData.append("description", item.description || "");
    formData.append("status", item.status);

    if (fileList.length > 0) {
      const file = fileList[0]?.originFileObj;
      if (file) formData.append("image", file);
    }

    const id = editId;
    formData.append("_method", id ? "PUT" : "POST");
    let url = "products";
    if (id) url += "/" + id;

    const res = await request(url, "post", formData);
    if (res && !res.errors) {
      message.success(res.message);
      getList();
      handleCloseModal();
    } else {
      setValidate(res.errors || {});
    }
    setLoading(false);
  };

  const handleFilter = () => getList();
  const handleReset = () => {
    const data = {
      text_search: null,
      status_filter: null,
      category_id: null,
      brand_id: null,
    };
    setFilter(data);
    getList(data);
  };

  return (
    <MainPage loading={state.loading}>
      <div className="role-page">
        <div
          className="main-page  bg-white"
          style={{ padding: 15, marginBottom: 10, borderRadius: 5 }}
        >
          <Row gutter={[10, 10]} align="middle" wrap={true}>
            <Col flex="auto">
              <Space
                wrap
                size={[8, 8]}
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                }}
              >
                <div
                  style={{
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    marginRight: 8,
                  }}
                >
                  Product Filter :
                </div>

                <Input
                  placeholder="Search products"
                  prefix={<SearchOutlined style={{ color: "gray" }} />}
                  style={{
                    width: 190,
                    minWidth: 150,
                  }}
                  allowClear
                  value={filter?.text_search}
                  onChange={(e) =>
                    setFilter((pre) => ({
                      ...pre,
                      text_search: e.target.value || null,
                    }))
                  }
                  size="middle"
                />

                <Select
                  value={filter?.category_id}
                  allowClear
                  placeholder="Select By Category"
                  style={{
                    width: 170,
                    minWidth: 140,
                  }}
                  onChange={(value) =>
                    setFilter((pre) => ({ ...pre, category_id: value ?? null }))
                  }
                  options={state.category?.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  size="middle"
                />

                <Select
                  value={filter?.brand_id}
                  allowClear
                  placeholder="Select By Brand"
                  style={{
                    width: 150,
                    minWidth: 130,
                  }}
                  onChange={(value) =>
                    setFilter((pre) => ({ ...pre, brand_id: value ?? null }))
                  }
                  options={state.brand?.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  size="middle"
                />

                <Select
                  value={filter?.status_filter}
                  allowClear
                  placeholder="Select By Status "
                  style={{
                    width: 150,
                    minWidth: 130,
                  }}
                  onChange={(value) =>
                    setFilter((pre) => ({
                      ...pre,
                      status_filter: value ?? null,
                    }))
                  }
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                  size="middle"
                />

                <Button
                  type="primary"
                  danger
                  onClick={handleReset}
                  size="middle"
                  style={{
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <IoMdRefresh size={19} />
                  <span className="btn-text">Reset</span>
                </Button>

                <Button
                  type="primary"
                  onClick={handleFilter}
                  size="middle"
                  style={{
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <LuTextSearch size={19} />
                  <span className="btn-text">Search</span>
                </Button>
              </Space>
            </Col>

            <Col flex="none">
              {isPermissionAction("Product.Create") && (
                <Button
                  type="primary"
                  onClick={handleOpenModal}
                  size="middle"
                  style={{
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    width: "100%",
                    minWidth: 140,
                  }}
                >
                  <FaPlus />
                  <span className="btn-text">Add Product</span>
                </Button>
              )}
            </Col>
          </Row>

          <Modal
            title={editId ? "Edit Product" : "Add New Product"}
            open={state.open}
            onCancel={handleCloseModal}
            footer={null}
            width={700}
            maskClosable={false}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={16}>
                {editId && (
                  <Col span={24}>
                    <Form.Item label="ID" name="id">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                )}

                <Col span={12}>
                  <Form.Item
                    label="Name"
                    name="prd_name"
                    {...validate.prd_name}
                    rules={[{ required: true, message: "Please input Name!" }]}
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>

                  <Form.Item
                    label="Price"
                    name="price"
                    {...validate.price}
                    rules={[{ required: true, message: "Please input Price!" }]}
                  >
                    <Input placeholder="Enter Price" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Quantity"
                    name="quantity"
                    {...validate.quantity}
                    rules={[
                      { required: true, message: "Please input Quantity!" },
                    ]}
                  >
                    <Input placeholder="Enter Quantity" />
                  </Form.Item>

                  <Form.Item
                    label="Category"
                    name="category_id"
                    {...validate.category_id}
                    rules={[
                      { required: true, message: "Please select Category!" },
                    ]}
                  >
                    <Select
                      allowClear
                      placeholder="Select Category"
                      options={state.category?.map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Brand"
                    name="brand_id"
                    {...validate.brand_id}
                    rules={[
                      { required: true, message: "Please select Brand!" },
                    ]}
                  >
                    <Select
                      allowClear
                      placeholder="Select Brand"
                      options={state.brand?.map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                    />
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
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Status"
                    name="status"
                    {...validate.status}
                    rules={[
                      { required: true, message: "Please select Status!" },
                    ]}
                  >
                    <Select
                      placeholder="Select Status"
                      options={[
                        { label: "Active", value: 1 },
                        { label: "Inactive", value: 0 },
                      ]}
                    />
                  </Form.Item>

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

                <Col span={24} style={{ textAlign: "right" }}>
                  <Space>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      {editId ? "Save Change" : "Save"}
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Modal>
        </div>

        <Table
          size="small"
          dataSource={state.list}
          columns={columns}
          scroll={{ x: 1000 }}
          rowKey="id"
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#9CAB84",
                    color: "#fff",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                />
              ),
            },
          }}
          pagination={{
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onShowSizeChange: (current, size) => setPageSize(size),
          }}
        />
      </div>
    </MainPage>
  );
};
