import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import {
  Space,
  Button,
  DatePicker,
  Modal,
  Form,
  Input,
  Table,
  Image,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";
import { FaEdit, FaPlusCircle } from "react-icons/fa";
import { request } from "../../../util/request";
import config from "../../../util/config";
import { UploadButton } from "../../../components/button/UploadButton";
import { dateClient } from "../../../util/helper";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { ImBin } from "react-icons/im";
import { IoMdRefresh } from "react-icons/io";
import { LuTextSearch } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";

const useStyles = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table-body {
        scrollbar-width: thin;
      }
    `,
    filterSection: css`
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    `,
  };
});

export const EmployeePage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { styles } = useStyles();
  const { RangePicker } = DatePicker;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [open, setOpen] = useState(false);
  const [validate, setValidate] = useState({});

  const [state, setState] = useState({
    list: [],
    loading: false,
  });
  const [filter, setFilter] = useState({
    text_search: null,
    start_date: null,
    end_date: null,
    date_range: null,
  });

  // Fetch employee list
  const getList = async (customFilter = filter) => {
    setState((prev) => ({ ...prev, loading: true }));
    let query_param = "?page=1";
    if (customFilter.text_search) {
      query_param += "&text_search=" + customFilter.text_search;
    }
    if (customFilter.start_date && customFilter.end_date) {
      query_param +=
        "&start_date=" +
        customFilter.start_date +
        "&end_date=" +
        customFilter.end_date;
    }
    try {
      const res = await request("employee" + query_param, "get");
      if (res && !res.errors) {
        setState({
          list: res?.list || [],
          loading: false,
        });
      } else {
        setState((pre) => ({ ...pre, loading: false }));
        if (res.errors?.message) {
          message.error(res.errors?.message);
        }
      }
    } catch (err) {
      console.error(err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    getList();
  }, []);

  // Submit add/edit employee
  const handleSubmit = async (item) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("card_id", item.card_id);
    formData.append("firstname", item.firstname);
    formData.append("lastname", item.lastname);
    formData.append("dob", item.dob ? item.dob.format("YYYY-MM-DD") : "");
    formData.append("email", item.email);
    formData.append("telephone", item.telephone);
    formData.append("position", item.position);
    formData.append("salary", item.salary);
    formData.append("address", item.address);

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }

    const id = editId;
    formData.append("_method", id ? "PUT" : "POST");
    let url = "employee";
    if (id) url += "/" + id;

    try {
      const res = await request(url, "post", formData);
      const msg = res?.message || res?.data?.message || "Success";
      if (res && !res.errors) {
        message.success(msg);
        getList();
        handleCloseModal();
      } else {
        setValidate(res.errors || {});
      }
    } catch (err) {
      console.error(err);
      message.error("Submit failed");
    }

    setLoading(false);
  };

  // Edit employee
  const handleEdit = (employee) => {
    setEditId(employee.id);
    form.setFieldsValue({
      ...employee,
      dob: employee.dob ? dayjs(employee.dob) : null,
    });
    if (employee.image) {
      setFileList([
        {
          uid: "-1",
          name: employee.image,
          status: "done",
          url: config.image_path + employee.image,
        },
      ]);
    } else {
      setFileList([]);
    }
    setOpen(true); // open modal
  };

  // Delete employee
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this employee?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const res = await request(`employee/${id}`, "delete");
          message.success(res.message || "Deleted successfully");
          getList();
        } catch (err) {
          console.error(err);
          message.error("Delete failed");
        }
      },
    });
  };

  const handleFilter = () => {
    getList();
  };

  const handleOpenModal = () => {
    setFileList([]);
    setValidate({});
    setEditId(null);
    form.resetFields();
    setOpen(true);
  };

  const handleCloseModal = () => {
    setFileList([]);
    setValidate({});
    setEditId(null);
    form.resetFields();
    setOpen(false);
  };
  const resetText = () => {
    const resetFilter = {
      text_search: null,
      start_date: null,
      end_date: null,
    };
    setFilter(resetFilter);
    getList(resetFilter);
  };

  const columns = [
    { title: "CardID", dataIndex: "card_id", width: 100 },
    {
      title: "Image",
      dataIndex: "image",
      width: 110,
      align: "center",
      render: (image) =>
        image ? (
          <Image
            src={config.image_path + image}
            width={70}
            height={50}
            style={{ objectFit: "contain" }}
          />
        ) : (
          "-"
        ),
    },
    { title: "First Name", dataIndex: "firstname", width: 130 },
    { title: "Last Name", dataIndex: "lastname", width: 130 },
    {
      title: "DOB",
      dataIndex: "dob",
      width: 150,
      render: (value) => (value ? dayjs(value).format("DD MMM YYYY") : "-"),
    },
    { title: "Email", dataIndex: "email", width: 190 },
    { title: "Telephone", dataIndex: "telephone", width: 140 },
    { title: "Position", dataIndex: "position", width: 190 },
    {
      title: "Salary",
      dataIndex: "salary",
      width: 120,
      render: (value) => {
        return <div>${value}</div>;
      },
    },
    { title: "Address", dataIndex: "address", width: 130 },
    {
      title: "Create At",
      dataIndex: "created_at",
      width: 120,
      render: (value) => dateClient(value, "DD MMM YYYY"),
    },
    {
      title: "Action",
      // fixed: "right",
      width: 180,
      render: (item) => (
        <Space style={{ cursor: "pointer" }}>
          <FiEdit color="green" size={20} onClick={() => handleEdit(item)} />
          |
          <ImBin color="red" size={20} onClick={() => handleDelete(item.id)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* FILTER SECTION */}
      <div
        className="bg-white font-bold"
        style={{ padding: 15, marginBottom: 10, borderRadius: 5 }}
      >
        <div
          className={styles.filterSection}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Space wrap>
            <div>Employees Filter: </div>
            <Input
              placeholder="Search"
              allowClear
              prefix={<SearchOutlined />}
              value={filter.text_search}
              style={{ width: 220 }}
              onChange={(e) =>
                setFilter((pre) => ({ ...pre, text_search: e.target.value }))
              }
            />

            <Button type="primary" danger onClick={resetText}>
              <IoMdRefresh size={19} /> Reset
            </Button>
            <Button type="primary" onClick={handleFilter}>
              <LuTextSearch size={19} />
              Search
            </Button>
          </Space>

          <Button type="primary" onClick={handleOpenModal}>
            <FaPlus /> Add Employees
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <Table
        className={styles.customTable}
        columns={columns}
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                style={{
                  backgroundColor: "#8D8DAA",
                  color: "#fff",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              />
            ),
          },
        }}
        dataSource={state.list}
        rowKey="id"
        loading={state.loading}
        size="small"
        pagination={{ pageSize: 10 }}
        // tableLayout="fixed"
        scroll={{ x: 1000 }}
      />

      {/* MODAL */}
      <Modal
        open={open}
        title={editId ? "Edit Employee" : "Add Employee"}
        onCancel={handleCloseModal}
        footer={null}
        width={isMobile ? "90%" : 500}
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="card_id"
                label="Card ID"
                rules={[{ required: true, message: "Please Input Card ID!" }]}
              >
                <Input placeholder="Enter Card ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="firstname"
                label="First Name"
                rules={[
                  { required: true, message: "Please Input First Name!" },
                ]}
              >
                <Input placeholder="Enter First Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastname"
                label="Last Name"
                rules={[{ required: true, message: "Please Input Last Name!" }]}
              >
                <Input placeholder="Enter Last Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dob"
                label="DOB"
                rules={[{ required: true, message: "Please Input DOB!" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: "Please Input Email!" }]}
              >
                <Input placeholder="Enter Email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="telephone"
                label="Telephone"
                rules={[{ required: true, message: "Please Input Telephone!" }]}
              >
                <Input placeholder="Enter Telephone" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[{ required: true, message: "Please Input Position!" }]}
              >
                <Input placeholder="Enter Position" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="salary"
                label="Salary"
                rules={[{ required: true, message: "Please Input Salary!" }]}
              >
                <Input placeholder="Enter Salary" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="address"
                label="Address"
                rules={[{ required: true, message: "Please Input Address!" }]}
              >
                <Input.TextArea rows={4} placeholder="Address" />
              </Form.Item>
            </Col>
            <Form.Item label="Image">
              <Upload
                listType="picture-card"
                maxCount={1}
                customRequest={(e) => e.onSuccess()}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
              >
                <UploadButton />
              </Upload>
            </Form.Item>
          </Row>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button danger onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editId ? "Edit" : "Save"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
