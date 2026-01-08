import {
  Button,
  Input,
  Space,
  Table,
  Modal,
  Select,
  Row,
  Col,
  Card,
  Statistic,
  Tag,
  Flex,
} from "antd";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import {
  SearchOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { IoMdRefresh, IoIosPrint } from "react-icons/io";
import { LuTextSearch } from "react-icons/lu";
import { dateClient } from "../../../util/helper";
import { useNavigate } from "react-router-dom";
import { useOrderSummary } from "../../Context/OrderSummaryContext";

export const OrderList = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const navigate = useNavigate();

  const { orders, summary, loading, refresh } = useOrderSummary();

  const [filter, setFilter] = useState({
    text_search: null,
    status_filter: null,
    date_from: null,
    date_to: null,
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  useEffect(() => {
    refresh();
  }, []);

  const getStatusColor = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "paid":
      case "completed":
        return "success";
      case "pending":
        return "processing";
      case "cancelled":
        return "error";
      case "refunded":
        return "warning";
      default:
        return "default";
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (String(method || "").toLowerCase()) {
      case "aba":
        return "blue";
      case "cash":
        return "green";
      case "card":
        return "purple";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Invoice No.",
      dataIndex: "invoice_no",

      width: 150,
    },
    {
      title: "Customer",
      dataIndex: "customer_id",
      render: (id) => `CUS-${id}`,
    },
    {
      title: "Sub Total",
      dataIndex: "sub_total",
      render: (v) => `$${Number(v || 0).toFixed(2)}`,
      align: "right",
    },
    {
      title: "Tax",
      dataIndex: "tax",
      render: (v) => `$${Number(v || 0).toFixed(2)}`,
      align: "right",
    },
    {
      title: "Paid Amount",
      dataIndex: "paid_amount",
      render: (v) => `$${Number(v || 0).toFixed(2)}`,
      align: "right",
    },
    {
      title: "Change Amount",
      dataIndex: "change_amount",
      render: (v) => `$${Number(v || 0).toFixed(2)}`,
      align: "right",
    },
    {
      title: "Discount",
      dataIndex: "discount",
      render: (v) => `$${Number(v || 0).toFixed(2)}`,
      align: "right",
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      render: (v) => `$${Number(v || 0).toFixed(2)}`,
      align: "right",
      sorter: (a, b) =>
        Number(a.total_amount || 0) - Number(b.total_amount || 0),
    },
    {
      title: "Payment",
      dataIndex: "payment_method",
      render: (m) => <Tag color={getPaymentMethodColor(m)}>{m}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => (
        <Tag color={getStatusColor(s)}>{String(s || "").toUpperCase()}</Tag>
      ),
      filters: [
        { text: "Paid", value: "paid" },
        { text: "Pending", value: "pending" },
        { text: "Cancelled", value: "cancelled" },
      ],

      onFilter: (value, record) =>
        String(record.status || "").toLowerCase() === value,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      render: (d) => (d ? dateClient(d, "DD MMM YYYY h:mma") : "-"),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items, record) => (
        <div>
          {items?.map((item, index) => (
            <div key={index} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>
                {item.product?.prd_name}
              </div>
              <div style={{ fontSize: 11, color: "#666" }}>
                {item.qty} × ${item.price} = $
                {(item.qty * item.price).toFixed(2)}
              </div>
            </div>
          ))}
          {record.note && (
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
              Note: {record.note}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Actions",

      width: 100,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleViewOrder(record)}>
            View
          </Button>
        </Space>
      ),
    },
  ];

  const dataSource = orders.map((item) => ({ key: item.id, ...item }));

  const printOrder = (record) => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Order - ${record.invoice_no}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background: #f0f0f0; }
          </style>
        </head>
        <body>
          <h2>Order Invoice</h2>
          <p><strong>Invoice No:</strong> ${record.invoice_no}</p>
          <p><strong>Customer:</strong> CUS-${record.customer_id}</p>
          <p><strong>Status:</strong> ${record.status}</p>
          <p><strong>Payment:</strong> ${record.payment_method}</p>

          <table>
            <thead>
              <tr>
                <th>Product</th><th>Price</th><th>Qty</th><th>Sub Total</th>
              </tr>
            </thead>
            <tbody>
              ${record.items
                ?.map(
                  (item) => `
                    <tr>
                      <td>${item.product?.prd_name}</td>
                      <td>$${Number(item.price).toFixed(2)}</td>
                      <td>${item.qty}</td>
                      <td>$${(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>

          <h3 style="text-align:right;margin-top:16px">
            Total: $${Number(record.total_amount).toFixed(2)}
          </h3>

          <script>
            window.onload = function () { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleViewOrder = (record) => {
    Modal.info({
      title: `Order Details - ${record.invoice_no}`,
      width: 700,
      okText: "Close",
      footer: [
        <Flex justify="flex-end" key="footer-flex">
          <Space>
            <Button
              key="print"
              type="primary"
              onClick={() => printOrder(record)}
            >
              <IoIosPrint /> Print
            </Button>
            <Button key="close" onClick={() => Modal.destroyAll()}>
              Close
            </Button>
          </Space>
        </Flex>,
      ],
      content: (
        <div>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <strong>Invoice No:</strong>
              <div>{record.invoice_no}</div>
            </Col>
            <Col span={8}>
              <strong>Customer ID:</strong>
              <div>CUS-{record.customer_id}</div>
            </Col>
            <Col span={8}>
              <strong>Status:</strong>
              <div>
                <Tag color={getStatusColor(record.status)}>
                  {String(record.status || "").toUpperCase()}
                </Tag>
              </div>
            </Col>
          </Row>

          <div style={{ marginBottom: 16 }}>
            <strong>Payment Details:</strong>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={6}>
                Sub Total: ${Number(record.sub_total).toFixed(2)}
              </Col>
              <Col span={6}>Tax: ${Number(record.tax).toFixed(2)}</Col>
              <Col span={6}>
                Discount: ${Number(record.discount || 0).toFixed(2)}
              </Col>
              <Col span={6}>
                <strong>
                  Total: ${Number(record.total_amount).toFixed(2)}
                </strong>
              </Col>
            </Row>

            <div style={{ marginTop: 8 }}>
              Payment Method:{" "}
              <Tag color={getPaymentMethodColor(record.payment_method)}>
                {record.payment_method}
              </Tag>
            </div>

            {record.note && (
              <div style={{ marginTop: 8 }}>
                <strong>Note:</strong> {record.note}
              </div>
            )}
          </div>
        </div>
      ),
    });
  };

  const handleSearch = () => refresh(filter);

  const resetFilter = () => {
    const data = {
      text_search: null,
      status_filter: null,
      date_from: null,
      date_to: null,
    };
    setFilter(data);
    refresh({});
  };

  return (
    <div>
      {/* STATISTICS */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Orders"
              value={summary.totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={summary.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#1890ff" }}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Today's Orders"
              value={summary.todayOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* FILTER */}
      <Card title="Order Filter" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={8} lg={6} style={{ flexShrink: 0 }}>
            <Input
              placeholder="Search invoice or customer"
              prefix={<SearchOutlined />}
              allowClear
              value={filter.text_search || ""}
              onChange={(e) =>
                setFilter((p) => ({
                  ...p,
                  text_search: e.target.value || null,
                }))
              }
              onPressEnter={handleSearch}
            />
          </Col>

          <Col xs={24} sm={24} md={8} lg={6} style={{ flexShrink: 0 }}>
            <Select
              allowClear
              placeholder="Order Status"
              style={{ width: "100%" }}
              value={filter.status_filter}
              onChange={(v) =>
                setFilter((p) => ({ ...p, status_filter: v || null }))
              }
              options={[
                { label: "Paid", value: "paid" },
                { label: "Pending", value: "pending" },
                { label: "Cancelled", value: "cancelled" },
                { label: "Refunded", value: "refunded" },
              ]}
            />
          </Col>

          <Col xs={24} sm={24} md={8} lg={6} style={{ flexShrink: 0 }}>
            <Input
              type="date"
              value={filter.date_from || ""}
              onChange={(e) =>
                setFilter((p) => ({ ...p, date_from: e.target.value || null }))
              }
            />
          </Col>

          <Col xs={24} sm={24} md={8} lg={6} style={{ flexShrink: 0 }}>
            <Space>
              <Button onClick={handleSearch} type="primary">
                <LuTextSearch /> Search
              </Button>
              <Button onClick={resetFilter}>
                <IoMdRefresh /> Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Space>
          <Button
            type="primary"
            icon={<FaPlus />}
            onClick={() => navigate("/pos")}
          >
            Create Order
          </Button>
        </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 1000 }}
        // ADD THIS SUMMARY PROP
        summary={(pageData) => {
          let totalSubTotal = 0;
          let totalTax = 0;
          let totalPaid = 0;
          let totalFinal = 0;

          pageData.forEach(({ sub_total, tax, paid_amount, total_amount }) => {
            totalSubTotal += Number(sub_total || 0);
            totalTax += Number(tax || 0);
            totalPaid += Number(paid_amount || 0);
            totalFinal += Number(total_amount || 0);
          });

          return (
            <Table.Summary fixed="bottom">
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} />
                <Table.Summary.Cell index={1}>
                  <strong>Total Page</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
                <Table.Summary.Cell index={3} align="right">
                  <strong>${totalSubTotal.toFixed(2)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <strong>${totalTax.toFixed(2)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <strong>${totalPaid.toFixed(2)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} />
                <Table.Summary.Cell index={7} />
                <Table.Summary.Cell index={8} align="right">
                  <Tag color="volcano">
                    <strong>${totalFinal.toFixed(2)}</strong>
                  </Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={9} colSpan={4} />
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} orders`,
        }}
      />
    </div>
  );
};
