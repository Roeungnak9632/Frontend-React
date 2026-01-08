import {
  Button,
  Input,
  Space,
  Table,
  Modal,
  Form,
  message,
  Tag,
  DatePicker,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
  Statistic,
} from "antd";
import { useEffect, useState } from "react";
import { request } from "../../../util/request";
import { FiEdit } from "react-icons/fi";
import { ImBin } from "react-icons/im";
import { FaPlus } from "react-icons/fa6";
import { SearchOutlined } from "@ant-design/icons";
import { IoMdRefresh } from "react-icons/io";
import { LuTextSearch } from "react-icons/lu";
import { BsCurrencyDollar } from "react-icons/bs";
import dayjs from "dayjs";
import { dateClient } from "../../../util/helper";
import CountUp from "react-countup";
import { utils, writeFileXLSX } from "xlsx";
import { AiOutlinePrinter } from "react-icons/ai";
export const ExpensePage = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);

  const [state, setState] = useState({
    list: [],
    expense_type: [],
    loadingTable: false,
    open: false,
  });

  const [filter, setFilter] = useState({
    text_search: null,
    status_filter: null,
    start_date: null,
    end_date: null,
    date_range: null,
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };
  const handleExportExcel = () => {
    const rows =
      selectedRowKeys.length > 0
        ? state.list.filter((r) => selectedRowKeys.includes(r.id))
        : state.list;

    const exportData = rows.map((r, index) => {
      const type = state.expense_type.find((t) => t.id === r.expense_type_id);

      return {
        No: index + 1,
        Name: r.name ?? "",
        "Expense Type": type?.name || r.expense_type?.name || "",
        Description: r.descrition ?? "",
        Amount: Number(String(r.amount ?? 0).replace(/,/g, "")) || 0,
        Status: r.expense_status ?? "",
        "Expense Date": r.expense_date
          ? dateClient(r.expense_date, "YYYY-MM-DD")
          : "",
        "Create By": r.create_by ?? "",
        "Created At": r.created_at
          ? dateClient(r.created_at, "YYYY-MM-DD HH:mm")
          : "",
      };
    });

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Expenses");
    writeFileXLSX(wb, `expenses-${dayjs().format("YYYYMMDD-HHmm")}.xlsx`);
  };

  // count up amount
  const toNum = (x) => {
    const n = parseFloat(String(x ?? 0).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const moneyFormatter = (value) => (
    <CountUp end={toNum(value)} decimals={2} separator="," duration={0.8} />
  );

  const getList = async (param_filter = {}) => {
    param_filter = { ...filter, ...param_filter };
    let query = "?page=1";

    if (param_filter.text_search)
      query += "&text_search=" + param_filter.text_search;
    if (param_filter.status_filter)
      query += "&status_filter=" + param_filter.status_filter;

    if (param_filter.start_date && param_filter.end_date) {
      query +=
        "&start_date=" +
        param_filter.start_date +
        "&end_date=" +
        param_filter.end_date;
    }

    setState((pre) => ({ ...pre, loadingTable: true }));

    const res = await request("expense" + query, "get");

    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        list: res.list.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        ),
        expense_type: res.expense_type || [],
      }));
    }

    setState((pre) => ({ ...pre, loadingTable: false }));
  };

  const getExpenseType = async () => {
    const res = await request("expense-type", "get");
    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        expense_type: res.list || res.data || res.expense_type || [],
      }));
    }
  };

  useEffect(() => {
    getList();
    getExpenseType();
  }, []);

  const columns = [
    { title: "NO.", render: (_, __, index) => index + 1, width: 70 },
    { title: "Name", dataIndex: "name" },
    {
      title: "Expense Type",
      dataIndex: "expense_type_id",
      render: (id, record) => {
        const type = state.expense_type.find((t) => t.id === id);
        return <span>{type?.name || record.expense_type?.name || "N/A"}</span>;
      },
    },
    { title: "Description", dataIndex: "descrition", render: (t) => t || "-" },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (a) => <span className="text-red-400">${a || 0}</span>,
    },
    {
      title: "Status",
      dataIndex: "expense_status",
      render: (status) => {
        if (!status) return "-";
        let color =
          status === "pending" ? "orange" : status === "paid" ? "green" : "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Expense Date",
      dataIndex: "expense_date",
      render: (d) => (d ? dateClient(d, "DD MMM YYYY") : "-"),
    },
    {
      title: "Create By",
      dataIndex: "create_by",
      render: (c) => {
        if (!c) return "-";
        let color = c === "Admin" ? "green" : c === "HR" ? "blue" : "default";
        return <Tag color={color}>{c}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      render: (d) => (d ? dateClient(d, "DD MMM YYYY H:MMa") : "-"),
    },
    {
      title: "Action",
      align: "center",
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

  const dataSource = state.list.map((item) => ({ key: item.id, ...item }));

  const onFinish = async (values) => {
    const formatted = {
      ...values,
      expense_date: values.expense_date
        ? values.expense_date.format("YYYY-MM-DD")
        : null,
    };

    const method = editId ? "put" : "post";
    const url = editId ? `expense/${editId}` : "expense";

    const res = await request(url, method, formatted);
    if (res && !res.errors) {
      message.success(res.message);
      getList();
      handleCloseModal();
    } else message.error(res?.message || "Failed to save expense");
  };

  const handleOpenModal = () => {
    setState((pre) => ({ ...pre, open: true }));
    setEditId(null);
    form.resetFields();
  };
  const totalAmount = state.list.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );
  const handleCloseModal = () => {
    setState((pre) => ({ ...pre, open: false }));
    setEditId(null);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditId(record.id);
    setState((pre) => ({ ...pre, open: true }));
    form.setFieldsValue({
      ...record,
      expense_date: record.expense_date ? dayjs(record.expense_date) : null,
      expense_type_id: record.expense_type_id || record.expense_type?.id,
      descrition: record.descrition || "",
      expense_status: record.expense_status || "pending",
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Expense",
      content: "Are you sure you want to delete this expense?",
      onOk: async () => {
        const res = await request(`expense/${record.id}`, "delete");
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
      start_date: null,
      end_date: null,
    };
    setFilter(data);
    getList(data);
  };
  const paidAmount = state.list
    .filter((item) => item.expense_status === "paid")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const pendingAmount = state.list
    .filter((item) => item.expense_status === "pending")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const cancelledAmount = state.list
    .filter((item) => item.expense_status === "cancel")
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div>
      <Row gutter={[6, 6]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Expenses"
              value={totalAmount}
              prefix="$"
              formatter={(v) => (
                <CountUp
                  key={String(v)}
                  end={toNum(v)}
                  decimals={2}
                  separator=","
                  duration={0.8}
                />
              )}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Paid"
              value={paidAmount}
              prefix="$"
              formatter={moneyFormatter}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending"
              value={pendingAmount}
              prefix="$"
              formatter={moneyFormatter}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cancelled"
              value={cancelledAmount}
              prefix="$"
              formatter={moneyFormatter}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      {/* FILTER */}
      <div
        className="bg-white"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 15,
          padding: 15,
          borderRadius: 5,
        }}
      >
        <Space>
          <div>Expense Filter:</div>

          <Input
            placeholder="Search expense"
            prefix={<SearchOutlined style={{ color: "gray" }} />}
            allowClear
            value={filter.text_search}
            onChange={(e) =>
              setFilter((pre) => ({ ...pre, text_search: e.target.value }))
            }
            onPressEnter={handleSearch}
          />

          <Select
            allowClear
            placeholder="Select Status"
            style={{ width: 150 }}
            value={filter.status_filter}
            onChange={(value) =>
              setFilter((pre) => ({ ...pre, status_filter: value ?? null }))
            }
            options={[
              { label: "Pending", value: "pending" },
              { label: "Paid", value: "paid" },
              { label: "Cancelled", value: "cancel" },
            ]}
          />

          <DatePicker.RangePicker
            value={filter.date_range}
            onChange={(values) => {
              if (values) {
                setFilter((p) => ({
                  ...p,
                  date_range: values,
                  start_date: values[0].format("YYYY-MM-DD"),
                  end_date: values[1].format("YYYY-MM-DD"),
                }));
              } else {
                setFilter((p) => ({
                  ...p,
                  date_range: null,
                  start_date: null,
                  end_date: null,
                }));
              }
            }}
          />

          <Button type="primary" danger onClick={resetFilter}>
            <IoMdRefresh /> Reset
          </Button>

          <Button type="primary" onClick={handleSearch}>
            <LuTextSearch /> Search
          </Button>
        </Space>

        <Space>
          <Button onClick={handleExportExcel} type="default">
            <AiOutlinePrinter size={18} />
            Export
          </Button>
          <Button type="primary" onClick={handleOpenModal}>
            <FaPlus /> Add Expense
          </Button>
        </Space>
      </div>

      {/* TABLE */}
      <Table
        rowSelection={rowSelection}
        loading={state.loadingTable}
        size="small"
        scroll={{ x: 1000 }}
        columns={columns}
        dataSource={dataSource}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: state.list.length,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          },
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} expenses`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        scroll={{ x: 1200 }}
        summary={(pageData) => {
          const pageTotal = pageData.reduce(
            (sum, item) => sum + (Number(item.amount) || 0),
            0
          );
          return (
            <Table.Summary fixed>
              <Table.Summary.Row
                style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}
              >
                <Table.Summary.Cell index={0} colSpan={5} align="right">
                  Page Total:
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <span style={{ color: "#f5222d", fontSize: 16 }}>
                    $
                    {pageTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={8} align="right">
                  <span>
                    <strong>Grand Total: </strong>
                    <span style={{ color: "#1890ff", fontSize: 16 }}>
                      $
                      {totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                style={{
                  backgroundColor: "#3F7D58",
                  color: "#fff",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              />
            ),
          },
        }}
      />

      {/* MODAL */}
      <Modal
        title={editId ? "Edit Expense" : "Add Expense"}
        open={state.open}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ expense_status: "pending" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please input name" }]}
              >
                <Input placeholder="Enter expense name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Expense Type"
                name="expenseType_id"
                rules={[
                  { required: true, message: "Please select expense type" },
                ]}
              >
                <Select
                  placeholder="Select Expense Type"
                  options={state.expense_type?.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  loading={state.expense_type?.length === 0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Create By"
                name="create_by"
                rules={[{ required: true, message: "Please input Create By" }]}
              >
                <Select
                  placeholder="Select Created By"
                  options={[
                    { label: "Admin", value: "Admin" },
                    { label: "HR", value: "HR" },
                    { label: "Manager", value: "Manager" },
                    { label: "Other", value: "Other" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[{ required: true, message: "Please input amount" }]}
              >
                <InputNumber
                  addonBefore={<BsCurrencyDollar />}
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  placeholder="Enter amount"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Expense Date"
                name="expense_date"
                rules={[
                  { required: true, message: "Please Input Expense Date!" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  placeholder="Select date"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="expense_status"
                rules={[{ required: true, message: "Please select Status!" }]}
              >
                <Select
                  placeholder="Select Status"
                  options={[
                    { label: "Pending", value: "pending" },
                    { label: "Paid", value: "paid" },
                    { label: "Cancelled", value: "cancel" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Description" name="descrition">
                <Input.TextArea
                  rows={3}
                  placeholder="Enter description (optional)"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={handleCloseModal}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editId ? "Update Expense" : "Create Expense"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
