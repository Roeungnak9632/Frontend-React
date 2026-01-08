import {
  Table,
  Card,
  Tag,
  message,
  Flex,
  Statistic,
  Typography,
  Select,
} from "antd";
import { useEffect, useState, useCallback } from "react";
import { request } from "../../../util/request";
import {
  TrophyOutlined,
  FireOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

const TopSelling = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUnits: 0,
    topProduct: null,
  });

  useEffect(() => {
    fetchTopSelling();
  }, [timeRange]);

  const fetchTopSelling = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request(`top-selling?period=${timeRange}`, "get");
      if (res && res.status) {
        setData(res.data || []);
        calculateStats(res.data || []);
      } else {
        message.error(res.message || "Failed to fetch top-selling products");
      }
    } catch (error) {
      message.error("Failed to fetch top-selling products");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const calculateStats = (data) => {
    if (!data?.length) {
      setStats({ totalRevenue: 0, totalUnits: 0, topProduct: null });
      return;
    }

    const totalRevenue = data.reduce(
      (sum, item) => sum + Number(item.total_amount || 0),
      0
    );

    const totalUnits = data.reduce(
      (sum, item) => sum + Number(item.total_qty || 0),
      0
    );

    const topProduct = data[0];

    setStats({ totalRevenue, totalUnits, topProduct });
  };

  // Table columns
  const columns = [
    {
      title: "NO",
      render: (_, __, index) => {
        const colors = ["#ff4d4f", "#faad14", "#1890ff"];
        const icon = index < 3 ? <TrophyOutlined /> : null;
        return (
          <Tag
            color={index < 3 ? colors[index] : "default"}
            icon={icon}
            style={{ fontWeight: "bold", minWidth: 32, textAlign: "center" }}
          >
            {index + 1}
          </Tag>
        );
      },
      width: 70,
      align: "center",
    },
    {
      title: "Product",
      dataIndex: "prd_name",
      render: (text, record) => (
        <Flex direction="vertical" size={2}>
          <Text strong>{text || "-"}</Text>
          {record.sku && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              SKU: {record.sku}
            </Text>
          )}
        </Flex>
      ),
      ellipsis: true,
    },
    {
      title: "Category",
      dataIndex: "category_name",
      render: (text) => (
        <Tag color="blue" style={{ margin: 0 }}>
          {text || "-"}
        </Tag>
      ),
    },
    {
      title: "Sold Qty",
      dataIndex: "total_qty",
      sorter: (a, b) => a.total_qty - b.total_qty,
      render: (value) => (
        <Flex>
          <ShoppingOutlined style={{ color: "#52c41a" }} />
          <Text strong>{value?.toLocaleString() || 0}</Text>
        </Flex>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "total_amount",
      sorter: (a, b) => a.total_amount - b.total_amount,
      render: (value) => (
        <Flex>
          <DollarOutlined style={{ color: "#1890ff" }} />
          <Text strong type="primary">
            {value
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value)
              : "$0"}
          </Text>
        </Flex>
      ),
    },
    {
      title: "Avg. Price",
      render: (_, record) => {
        const avgPrice =
          record.total_amount && record.total_qty
            ? record.total_amount / record.total_qty
            : 0;
        return avgPrice > 0 ? `$${avgPrice.toFixed(2)}` : "-";
      },
    },
  ];

  const timeRangeOptions = [
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  return (
    <>
      <div
        className="bg-white font-bold"
        style={{
          padding: 15,
          marginBottom: 10,
          borderRadius: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left side: Icon + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FireOutlined className="opacity-80" style={{ fontSize: 16 }} />
          <h2 className="opacity-80" style={{ margin: 0, fontSize: 16 }}>
            Top Selling Products
          </h2>
        </div>

        {/* Right side: Time Range Select */}
        <Select
          value={timeRange}
          onChange={setTimeRange}
          style={{ width: 140 }}
          size="middle"
        >
          {timeRangeOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* Stats Summary */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          background: "#fafafa",
          borderRadius: 8,
        }}
      >
        <Flex size="large" wrap gap={40}>
          <Statistic
            title="Total Revenue"
            value={stats.totalRevenue}
            prefix={<DollarOutlined />}
            valueStyle={{ color: "#1890ff" }}
            formatter={(value) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(value)
            }
          />
          <Statistic
            title="Total Units Sold"
            value={stats.totalUnits}
            prefix={<ShoppingOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
          {stats.topProduct && (
            <Statistic
              title="Top Product"
              value={stats.topProduct.prd_name}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#faad14", fontSize: 14 }}
            />
          )}
        </Flex>
      </div>

      {/* Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} products`,
        }}
        scroll={{ x: 800 }}
        size="middle"
        locale={{ emptyText: "No sales data available" }}
        onRow={(record, index) => ({
          style: { background: index < 3 ? "#fffbf0" : "inherit" },
        })}
      />
    </>
  );
};

export default TopSelling;
