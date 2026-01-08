import {
  Button,
  Input,
  Select,
  Space,
  Flex,
  Table,
  Modal,
  Form,
  message,
} from "antd";
import { request } from "../../../util/request";
import { useEffect, useState } from "react";
import { ImBin } from "react-icons/im";
import { FiEdit } from "react-icons/fi";
import { FaPlusCircle } from "react-icons/fa";
import { LuTextSearch } from "react-icons/lu";
import { SearchOutlined } from "@ant-design/icons";
import { FaPlus } from "react-icons/fa6";
export const ExpenseType = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [validate, setValidate] = useState({});
  const [state, setState] = useState({
    list: [],
    loadingTable: false,
    open: false,
  });
  const [filter, setFilter] = useState({
    text_search: "",
  });
  const handleCloseModal = () => {
    setState((pre) => ({
      ...pre,
      open: false,
    }));
    setEditId(null);
    form.resetFields();
    setValidate({});
  };
  const handleOpenModal = () => {
    setState((pre) => ({
      ...pre,
      open: true,
    }));
    setEditId(null);
    form.resetFields();
    setValidate({});
  };

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const getList = async () => {
    let query_param = "?page=1";
    if (filter.text_search !== "" && filter.text_search !== null) {
      query_param += "&text_search=" + filter.text_search;
    }
    setState((pre) => ({
      ...pre,
      loadingTable: true,
    }));
    const res = await request("expense-type" + query_param, "get");
    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        list: res.list.sort((a, b) => b - a) || [],
      }));
    }
    setState((pre) => ({
      ...pre,
      loadingTable: false,
    }));
  };
  useEffect(() => {
    getList();
  }, []);
  const columns = [
    {
      title: "NO.",
      dataIndex: "id",
      render: (text, record, index) => index + 1,
      width: 70,
    },
    { title: "Name", dataIndex: "name", width: 300 },
    {
      title: <div style={{ textAlign: "left" }}>Description</div>,
      dataIndex: "description",
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
    id: item.id,
    name: item.name,
    description: item.description,
  }));
  const onFinish = async (item) => {
    const id = editId;
    const method = id ? "put" : "post";
    let url = "expense-type";
    if (id) {
      url += "/" + id;
    }
    const res = await request(url, method, item);
    if (res && !res.errors) {
      message.success(res.message);
      getList();
      handleCloseModal();
    } else {
      console.log("error obj: ", res);
      setValidate(res.errors || {});
    }
  };
  const handleFilter = () => {
    getList();
  };
  const handleDelete = async (data) => {
    Modal.confirm({
      title: "Delete",
      content: "Are you sure you want to delete this?",
      onOk: async () => {
        const res = await request("expense-type/" + data.id, "delete");
        if (res && !res.error) {
          message.success(res.message);
          getList();
        }
      },
    });
  };
  const handleEdit = (data) => {
    setState((pre) => ({ ...pre, open: true }));
    setEditId(data.id);
    form.setFieldsValue({ ...data });
  };
  return (
    <div>
      <div className="role-page">
        <div
          className="main-page bg-white "
          style={{ padding: 15, marginBottom: 10, borderRadius: 5 }}
        >
          <Space>
            <div>ExpenseType Filter: </div>
            <Input
              placeholder="Search expense types"
              prefix={<SearchOutlined style={{ color: "gray" }} />}
              allowClear
              onChange={(e) =>
                setFilter((pre) => ({
                  ...pre,
                  text_search: e.target.value,
                }))
              }
            />

            <Button type="primary" onClick={handleFilter}>
              <LuTextSearch size={19} /> Search
            </Button>
          </Space>
          <Button type="primary" onClick={handleOpenModal}>
            <FaPlus /> Add ExpenseType
          </Button>
        </div>
        <Flex gap="middle" vertical>
          <Table
            loading={state.loadingTable}
            scroll={{ x: 1000 }}
            size="small"
            rowSelection={rowSelection}
            columns={columns}
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
            dataSource={dataSource}
          />
        </Flex>
      </div>
      <Modal
        title={editId ? "Edit ExpenseType" : "Add New ExpenseType "}
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
            rules={[{ required: true, message: "Please input Description!" }]}
          >
            <Input.TextArea placeholder="Description" rows={4} />
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
