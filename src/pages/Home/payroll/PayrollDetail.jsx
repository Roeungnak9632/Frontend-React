import { FaArrowLeft, FaXmark } from "react-icons/fa6";
import { FaUserFriends, FaTruck } from "react-icons/fa";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { IoIosTime } from "react-icons/io";
import { MdFastfood } from "react-icons/md";
import { CheckCircleOutlined } from "@ant-design/icons";
import {
  Space,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Input,
  Col,
  message,
  Select,
  Spin,
} from "antd";
import { FiEdit } from "react-icons/fi";
import { ImBin } from "react-icons/im";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { request } from "../../../util/request";
import { dateClient } from "../../../util/helper";

export const PayrollDetail = () => {
  const { id } = useParams();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [form] = Form.useForm();

  const [payrollInfo, setPayrollInfo] = useState({});
  const [employees, setEmployees] = useState([]);
  const [state, setState] = useState({ list: [], loading: false });
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Animated counts
  const [animatedCounts, setAnimatedCounts] = useState({
    totalEmployee: 0,
    baseSalary: 0,
    totalOT: 0,
    totalTransport: 0,
    totalFood: 0,
  });

  // Fetch employees (for Select)
  const fetchEmployees = async () => {
    try {
      const res = await request("employee", "get");
      setEmployees(res.list);
    } catch (err) {
      message.error("Failed to load employees");
    }
  };

  // Fetch payroll info
  const fetchPayrollInfo = async () => {
    try {
      const res = await request(`payroll/${id}`, "get");
      if (res && !res.errors) setPayrollInfo(res.data);
    } catch (err) {
      message.error("Failed to load payroll info");
    }
  };

  // Fetch employee payrolls for this payroll only
  const fetchPayrolls = async () => {
    setState((pre) => ({
      ...pre,
      loading: true,
    }));
    try {
      const res = await request(`employee-payroll/payroll/${id}`, "get");
      if (res && !res.errors) setState({ list: res.list, loading: false });
    } catch (err) {
      message.error("Failed to load payroll employees");
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchPayrollInfo();
    fetchPayrolls();
  }, [id]);

  // Open modal for add
  const handleOpenModal = () => {
    setEditId(null);
    form.resetFields();
    setOpen(true);
  };

  // Edit employee payroll
  const handleEdit = (record) => {
    setEditId(record.id);
    form.setFieldsValue({
      employee_id: record.employee_id,
      base_salary: record.base_salary,
      ot: record.ot,
      transport: record.transport,
      food: record.food,
    });
    setOpen(true);
  };

  // Delete employee payroll
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete",
      content: "Are you sure you want to delete this?",
      onOk: async () => {
        try {
          await request(`employee-payroll/${record.id}`, "delete");
          message.success("Deleted successfully");
          fetchPayrolls();
        } catch (err) {
          message.error(err?.message || "Delete failed");
        }
      },
    });
  };

  // Submit add/edit employee payroll
  const handleSubmit = async (values) => {
    try {
      const payload = {
        payroll_id: id,
        employee_id: values.employee_id,
        base_salary: Number(values.base_salary),
        ot: Number(values.ot),
        transport: Number(values.transport),
        food: Number(values.food),
      };

      if (editId) {
        await request(`employee-payroll/${editId}`, "put", payload);
        message.success("Payroll updated successfully");
      } else {
        await request("employee-payroll", "post", payload);
        message.success("Payroll added successfully");
      }

      form.resetFields();
      setOpen(false);
      fetchPayrolls();
    } catch (err) {
      message.error(err?.message || "Something went wrong");
    }
  };

  // Calculate totals
  const totalBase = state.list.reduce(
    (sum, i) => sum + Number(i.base_salary),
    0
  );
  const totalOT = state.list.reduce((sum, i) => sum + Number(i.ot || 0), 0);
  const totalTransport = state.list.reduce(
    (sum, i) => sum + Number(i.transport || 0),
    0
  );
  const totalFood = state.list.reduce((sum, i) => sum + Number(i.food || 0), 0);
  const totalNet = state.list.reduce((sum, i) => sum + Number(i.net_salary), 0);

  // Animate summary counts
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const intervalTime = duration / steps;

    const animateCount = (target, key) => {
      let current = 0;
      const increment = Math.ceil(target / steps);
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setAnimatedCounts((prev) => ({ ...prev, [key]: current }));
      }, intervalTime);
    };

    animateCount(state.list.length, "totalEmployee");
    animateCount(totalBase, "baseSalary");
    animateCount(totalOT, "totalOT");
    animateCount(totalTransport, "totalTransport");
    animateCount(totalFood, "totalFood");
  }, [state.list, totalBase, totalOT, totalTransport, totalFood]);

  // Define cards using animated counts
  const cards = [
    {
      title: "Total Employee",
      count: animatedCounts.totalEmployee,
      icon: <FaUserFriends size={19} color="blue" />,
    },
    {
      title: "Base Salary",
      count: animatedCounts.baseSalary,
      icon: <RiMoneyDollarCircleFill size={19} color="green" />,
    },
    {
      title: "Over Time",
      count: animatedCounts.totalOT,
      icon: <IoIosTime size={19} color="orange" />,
    },
    {
      title: "Transport",
      count: animatedCounts.totalTransport,
      icon: <FaTruck size={19} color="purple" />,
    },
    {
      title: "Food Allowance",
      count: animatedCounts.totalFood,
      icon: <MdFastfood size={19} color="brown" />,
    },
  ];

  // Table columns
  const columns = [
    {
      title: "Employee",
      dataIndex: "employee_name",
      key: "employee_name",
      width: "370px",
    },
    {
      title: "Base Salary",
      dataIndex: "base_salary",
      key: "base_salary",
      width: "160px",
    },
    {
      title: "OT",
      dataIndex: "ot",
      key: "ot",
      width: "160px",
      render: (v) => <div className="text-green-500">+${v}</div>,
    },
    {
      title: "Transport",
      dataIndex: "transport",
      key: "transport",
      width: "160px",
    },
    { title: "Food", dataIndex: "food", key: "food", width: "150px" },
    { title: "Net Salary", dataIndex: "net_salary", key: "net_salary" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space style={{ cursor: "pointer" }}>
          <FiEdit color="green" size={18} onClick={() => handleEdit(record)} />
          <ImBin color="red" size={18} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  const mystyle = { padding: 25 };
  const fontStyle = { fontSize: 15 };

  return (
    <Spin spinning={state.loading}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between" style={{ marginBottom: 15 }}>
          <Link to="/payroll">
            <FaArrowLeft size={20} color="black" />
          </Link>
          <div>
            <strong>Status:</strong> {payrollInfo.status || " "} &nbsp; | &nbsp;
            <strong>Approved by:</strong> {payrollInfo.approved_by || " "}{" "}
            &nbsp; | &nbsp;
            <strong>Month:</strong>{" "}
            {payrollInfo.monthly
              ? dateClient(payrollInfo.monthly + "/01", "MMMM YYYY")
              : " "}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white w-full flex justify-between rounded-lg hover:bg-gray-50 transition-colors md:p-9"
              style={mystyle}
            >
              <div>
                <div className="text-gray-500 font-semibold" style={fontStyle}>
                  {card.title}
                </div>
                <div className="text-2xl font-bold mt-4 mb-4">{card.count}</div>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-200">
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Total Net Salary */}
        <div
          className="bg-white w-full mt-4 rounded-lg flex justify-between"
          style={{ padding: 10, marginTop: 15, marginBottom: 15 }}
        >
          <div>
            <div className="font-semibold">Total Net Salary</div>
            <div className="text-green-500 text-2xl font-bold">${totalNet}</div>
          </div>
          <RiMoneyDollarCircleFill size={30} color="green" />
        </div>

        {/* Employee Table Header */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-lg font-bold">Employee Breakdown</div>
          <Button type="primary" onClick={handleOpenModal}>
            Add New
          </Button>
        </div>

        {/* Employee Table */}
        <Table
          columns={columns}
          size="small"
          scroll={{ x: 1000 }}
          dataSource={state.list.map((item) => ({ key: item.id, ...item }))}
          style={{ marginTop: 15 }}
          footer={() => (
            <div className="grid grid-cols-8 text-center items-center p-3 font-bold">
              <div>Total Employee: ({state.list.length})</div>
              <div></div>
              <div>${totalBase}</div>
              <div className="text-green-500">+${totalOT}</div>
              <div>${totalTransport}</div>
              <div>${totalFood}</div>
              <div className="text-green-600 font-bold">${totalNet}</div>
              <div></div>
            </div>
          )}
        />

        {/* Add/Edit Modal */}
        <Modal
          open={open}
          title={editId ? "Edit Employee Payroll" : "Add Employee Payroll"}
          onCancel={() => setOpen(false)}
          footer={null}
          width={isMobile ? "90%" : 500}
          maskClosable={false}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="employee_id"
                  label="Employee Name"
                  rules={[
                    { required: true, message: "Please select employee!" },
                  ]}
                >
                  <Select placeholder="Select Employee">
                    {employees.map((emp) => (
                      <Select.Option key={emp.id} value={emp.id}>
                        {emp.firstname} {emp.lastname}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="base_salary"
                  label="Base Salary"
                  rules={[
                    { required: true, message: "Please Input Base Salary!" },
                  ]}
                >
                  <Input placeholder="Enter Base Salary" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="ot"
                  label="OT"
                  rules={[{ required: true, message: "Please Input OT!" }]}
                >
                  <Input placeholder="Enter OT" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="transport"
                  label="Transport"
                  rules={[
                    { required: true, message: "Please Input Transport!" },
                  ]}
                >
                  <Input placeholder="Enter Transport" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="food"
                  label="Food"
                  rules={[{ required: true, message: "Please Input Food!" }]}
                >
                  <Input placeholder="Enter Food" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Space style={{ float: "right" }}>
                <Button danger onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {editId ? "Edit" : "Save"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};
