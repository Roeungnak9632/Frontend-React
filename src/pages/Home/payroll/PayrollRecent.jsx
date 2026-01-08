import { LuFilePen } from "react-icons/lu";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { CiCalendarDate } from "react-icons/ci";
import { FaPlusCircle, FaRegUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { request } from "../../../util/request";
import { dateClient } from "../../../util/helper";

const STATUS_CONFIG = {
  pending: {
    color: "#faad14",
    icon: <ClockCircleOutlined />,
    text: "Pending",
  },
  approved: {
    color: "#52c41a",
    icon: <CheckCircleOutlined />,
    text: "Approved",
  },
  draft: {
    color: "#8c8c8c",
    icon: <CloseCircleOutlined />,
    text: "Draft",
  },
};

export const PayrollRecent = () => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [state, setState] = useState({
    list: [],
    loading: false,
  });

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleCloseModal = () => {
    setOpen(false);
    setEditId(null);
    form.resetFields();
  };

  const handleOpenModal = () => {
    setOpen(true);
  };

  const fetchRecentPayroll = async () => {
    setState((pre) => ({ ...pre, loading: true }));

    try {
      const res = await request("payroll", "get");

      if (res && !res.errors) {
        setState((pre) => ({
          ...pre,
          list: res.list || [],
          loading: false,
        }));
      } else {
        message.error(res?.errors?.message || "Something went wrong");
        setState((pre) => ({ ...pre, loading: false }));
      }
    } catch (error) {
      message.error("Failed to load payroll data");
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  useEffect(() => {
    fetchRecentPayroll();
  }, []);

  const onFinish = async (values) => {
    const payload = {
      approved_by: values.approved_by,
      monthly: values.date_month.format("YYYY/MM"),
      date_month: values.date.format("YYYY-MM-DD"),
      status: values.status,
    };

    try {
      const res = await request("payroll", "post", payload);

      if (res && !res.errors) {
        message.success("Payroll saved successfully");
        handleCloseModal();
        fetchRecentPayroll();
      } else {
        message.error(res?.errors?.message || "Save failed");
      }
    } catch (error) {
      message.error("Server error");
    }
  };

  return (
    <>
      <Spin spinning={state.loading}>
        <div style={{ marginTop: 15 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-gray-500 font-bold">Recent Payroll</h2>
            <Button type="primary" onClick={handleOpenModal}>
              <FaPlusCircle /> Add Month
            </Button>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            style={{ marginTop: 15 }}
          >
            {state.list.map((payroll) => {
              const statusConfig =
                STATUS_CONFIG[payroll.status] || STATUS_CONFIG.draft;

              return (
                <Link
                  to={`/payroll/payroll-detail/${payroll.id}`}
                  key={payroll.id}
                >
                  <div
                    className="bg-white w-full flex justify-between rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                    style={{ padding: 25 }}
                  >
                    {/* LEFT */}
                    <div>
                      <div
                        className="font-bold text-black"
                        style={{ fontSize: 18 }}
                      >
                        {dateClient(payroll.monthly + "/01", "MMMM YYYY")}
                      </div>

                      <div className="font-semibold mt-4 mb-4 text-gray-800 text-sm">
                        Monthly Payroll for{" "}
                        {dateClient(payroll.date_month, "DD MMMM YYYY")}
                      </div>

                      <div className="flex items-center gap-3 text-gray-500 text-sm">
                        <CiCalendarDate size={18} />
                        <span>
                          {dateClient(payroll.date_month, "DD-MMM-YYYY")}
                        </span>
                        <FaRegUser />
                        <span>{payroll.approved_by}</span>
                      </div>
                    </div>

                    {/* RIGHT - STATUS */}
                    <div>
                      <div
                        className="flex items-center gap-1 rounded-full bg-gray-100"
                        style={{
                          padding: "4px 10px",
                          color: statusConfig.color,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {statusConfig.icon}
                        <span>{statusConfig.text}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <Modal
            open={open}
            title={editId ? "Edit Payroll" : "Add Payroll"}
            onCancel={handleCloseModal}
            footer={null}
            width={isMobile ? "90%" : 500}
            maskClosable={false}
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Approved by"
                name="approved_by"
                rules={[{ required: true, message: "Please select Approver!" }]}
              >
                <Select
                  placeholder="Approve Name"
                  options={[
                    { label: "Admin", value: "admin" },
                    { label: "Cashier", value: "cashier" },
                    { label: "HR", value: "HR" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="date_month"
                label="Month"
                rules={[{ required: true, message: "Please select Month!" }]}
              >
                <DatePicker picker="month" style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: "Please select Date!" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select Status!" }]}
              >
                <Select
                  placeholder="Select Status"
                  options={[
                    { label: "Pending", value: "pending" },
                    { label: "Approved", value: "approved" },
                    { label: "Draft", value: "draft" },
                  ]}
                />
              </Form.Item>

              <Form.Item>
                <Space style={{ float: "right" }}>
                  <Button danger onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editId ? "Update" : "Save"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Spin>
    </>
  );
};
