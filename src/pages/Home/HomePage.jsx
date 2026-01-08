import expensesImage from "../../assets/icon/expenses.png";
import revenueImage from "../../assets/icon/revenue.png";
import profitImage from "../../assets/icon/profit.png";
import orderImage from "../../assets/icon/order.png";

import {
  message,
  Spin,
  Statistic,
  Card,
  Row,
  Col,
  Typography,
  Flex,
} from "antd";
import { FaUsersGear, FaChartLine } from "react-icons/fa6";
import { HiUserGroup } from "react-icons/hi2";
import { FaHome, FaUsers, FaUserFriends } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";
import { useEffect, useMemo, useState } from "react";
import CountUp from "react-countup";
import { request } from "../../util/request";
import TopSelling from "../../pages/Home/topselling/TopSelling";
import { useExpenseSummary } from "../Context/ExpenseSummaryContext";
import { useOrderSummary } from "../Context/OrderSummaryContext";

const { Title, Text } = Typography;

export const HomePage = () => {
  const [state, setState] = useState({
    loading: false,
    employee: [],
    customer: [],
    statistics: {
      profit: 0,
      averageOrderValue: 0,
      customerGrowth: 0,
    },
  });

  const {
    summary: expenseSummary,
    loading: expenseLoading,
    refresh: refreshExpense,
  } = useExpenseSummary();

  const {
    summary: orderSummary,
    loading: orderLoading,
    refresh: refreshOrders,
  } = useOrderSummary();

  const formatterMoney = (value) => (
    <CountUp
      end={Number(value) || 0}
      separator=","
      decimals={2}
      duration={0.8}
      prefix="$"
    />
  );

  const formatterInt = (value) => (
    <CountUp end={Number(value) || 0} separator="," duration={0.6} />
  );

  const formatterPercent = (value) => (
    <CountUp end={Number(value) || 0} decimals={1} duration={0.8} suffix="%" />
  );

  const getListEmployee = async () => {
    try {
      setState((pre) => ({ ...pre, loading: true }));
      const res = await request("employee", "get");
      if (res && !res.errors)
        setState((pre) => ({ ...pre, employee: res.list || [] }));
    } catch {
      message.error("Failed to fetch employees");
    } finally {
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  const getListCustomer = async () => {
    try {
      setState((pre) => ({ ...pre, loading: true }));
      const res = await request("customer", "get");
      if (res && !res.errors)
        setState((pre) => ({ ...pre, customer: res.list || [] }));
    } catch {
      message.error("Failed to fetch customers");
    } finally {
      setState((pre) => ({ ...pre, loading: false }));
    }
  };

  const getStatistics = async () => {
    try {
      const profit =
        (orderSummary?.totalRevenue || 0) - (expenseSummary?.total || 0);
      const avgOrderValue = orderSummary?.totalOrders
        ? orderSummary.totalRevenue / orderSummary.totalOrders
        : 0;

      setState((pre) => ({
        ...pre,
        statistics: {
          profit,
          averageOrderValue: avgOrderValue,
          customerGrowth: 5.2,
        },
      }));
    } catch (error) {
      console.error("Failed to load statistics", error);
    }
  };

  useEffect(() => {
    getListEmployee();
    getListCustomer();
    refreshExpense?.();
    refreshOrders?.();
  }, []);

  useEffect(() => {
    if (expenseSummary && orderSummary) {
      getStatistics();
    }
  }, [expenseSummary, orderSummary]);

  const customerMale = useMemo(
    () => state.customer?.filter((c) => c.gender === "Male").length ?? 0,
    [state.customer]
  );
  const customerFemale = useMemo(
    () => state.customer?.filter((c) => c.gender === "Female").length ?? 0,
    [state.customer]
  );

  const customerPercentage = useMemo(() => {
    const total = state.customer?.length || 1;
    return {
      male: Math.round((customerMale / total) * 100),
      female: Math.round((customerFemale / total) * 100),
    };
  }, [state.customer, customerMale, customerFemale]);

  const mainCards = useMemo(
    () => [
      {
        key: "sales",
        title: "Total Revenue",
        count: orderSummary?.totalRevenue ?? 0,
        change: "+12.5%",
        icon: <img src={revenueImage} size={24} />,
        color: "#10b981",
        formatter: formatterMoney,
        description: "Total sales revenue",
      },
      {
        key: "profit",
        title: "Net Profit",
        count: state.statistics.profit,
        change: state.statistics.profit > 0 ? "+8.3%" : "-",
        icon: <img src={profitImage} size={24} />,
        color: "#3b82f6",
        formatter: formatterMoney,
        description: "Revenue minus expenses",
      },
      {
        key: "expenses",
        title: "Total Expenses",
        count: expenseSummary?.total ?? 0,
        change: "-2.1%",
        icon: <img src={expensesImage} alt="expenses" size={24} />,
        color: "#ef4444",
        formatter: formatterMoney,
        description: `${expenseSummary?.count ?? 0} transactions`,
      },
      {
        key: "orders",
        title: "Total Orders",
        count: orderSummary?.totalOrders ?? 0,
        change: "+5.7%",
        icon: <img src={orderImage} alt="expenses" size={24} />,
        color: "#8b5cf6",
        formatter: formatterInt,
        description: "Completed orders",
      },
    ],
    [expenseSummary, orderSummary, state.statistics]
  );

  const secondaryCards = useMemo(
    () => [
      {
        key: "customers",
        title: "Customers",
        count: state.customer?.length ?? 0,
        icon: <FaUsers size={20} style={{ color: "#6366f1" }} />,
        color: "#6366f1",
        formatter: formatterInt,
        extra: (
          <div className="customer-breakdown">
            <div className="customer-segment">
              <FaUserFriends size={14} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Male:{" "}
                <strong style={{ color: "#3b82f6" }}>{customerMale}</strong> (
                {customerPercentage.male}%)
              </Text>
            </div>
            <div className="customer-segment">
              <FaUsers size={14} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Female:{" "}
                <strong style={{ color: "#ec4899" }}>{customerFemale}</strong> (
                {customerPercentage.female}%)
              </Text>
            </div>
          </div>
        ),
      },
      {
        key: "employees",
        title: "Employees",
        count: state.employee?.length ?? 0,
        icon: <HiUserGroup size={20} style={{ color: "#f59e0b" }} />,
        color: "#f59e0b",
        formatter: formatterInt,
        description: "Active staff",
      },
      {
        key: "avg-order",
        title: "Avg Order Value",
        count: state.statistics.averageOrderValue,
        icon: <FaChartLine size={20} style={{ color: "#10b981" }} />,
        color: "#10b981",
        formatter: formatterMoney,
        description: "Per transaction",
      },
    ],
    [
      state.customer,
      state.employee,
      state.statistics,
      customerMale,
      customerFemale,
      customerPercentage,
    ]
  );

  return (
    // <Spin spinning={state.loading || !!expenseLoading || !!orderLoading}>
    <div className="home-page-container">
      {/* Header */}
      <div
        className="bg-white font-bold dashboard-header"
        style={{
          marginBottom: 15,
          padding: 15,
          borderRadius: 5,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <Title level={5} className="dashboard-title">
              <FaHome className="header-icon" />
              Dashboard Overview
            </Title>
            <h6 style={{ fontSize: 10, marginLeft: 22 }}>
              Welcome to your business dashboard
            </h6>
          </div>
          <div className="last-updated">
            <Text type="secondary" style={{ fontSize: 12 }}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <Row gutter={[16, 16]} className="main-cards-row">
        {mainCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.key}>
            <Card className="stat-card" variant="borderless">
              <Flex justify="space-between">
                <div>
                  <Title level={4} className="stat-title">
                    {card.title}
                  </Title>
                  <div className="stat-value">
                    <Statistic
                      value={card.count}
                      formatter={card.formatter}
                      valueStyle={{
                        color: card.color,
                        fontWeight: 600,
                        fontSize: 28,
                      }}
                    />
                  </div>
                  <Text type="secondary" className="stat-description">
                    {card.description}
                  </Text>
                </div>
                <div>
                  <div className="stat-icon">{card.icon}</div>
                </div>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Secondary Stats and Top Selling */}
      <Row gutter={[16, 16]} className="secondary-row">
        {/* Secondary Cards */}
        <Col xs={24} lg={8}>
          <Card
            title="Business Metrics"
            className="metrics-card"
            variant="borderless"
          >
            <Row gutter={[16, 16]}>
              {secondaryCards.map((card) => (
                <Col xs={24} key={card.key}>
                  <Card
                    className="metric-item"
                    variant="borderless"
                    size="small"
                  >
                    <div className="metric-content">
                      <div
                        className="metric-icon"
                        style={{ color: card.color }}
                      >
                        {card.icon}
                      </div>
                      <div className="metric-info">
                        <Text type="secondary">{card.title}</Text>
                        <div className="metric-value">
                          <Statistic
                            value={card.count}
                            formatter={card.formatter}
                            valueStyle={{
                              fontSize: 20,
                              fontWeight: 600,
                            }}
                          />
                        </div>
                        {card.description && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {card.description}
                          </Text>
                        )}
                      </div>
                    </div>
                    {card.extra && (
                      <div className="metric-extra">{card.extra}</div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Top Selling Section */}
        <Col xs={24} lg={16}>
          <TopSelling />
        </Col>
      </Row>

      {/* Quick Stats Footer */}
      <Row gutter={[16, 16]} className="quick-stats-row">
        <Col xs={24} md={8}>
          <Card className="quick-stat" variant="borderless" size="small">
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Active Customers</Text>
                <Title level={4} style={{ margin: 0 }}>
                  {formatterInt(Math.round(state.customer?.length * 0.65))}
                </Title>
              </div>
              <FaUsersGear size={20} style={{ color: "#8b5cf6" }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="quick-stat" variant="borderless" size="small">
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Customer Growth</Text>
                <Title level={4} style={{ margin: 0 }}>
                  {formatterPercent(state.statistics.customerGrowth)}
                </Title>
              </div>
              <BsGraphUpArrow size={20} style={{ color: "#10b981" }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="quick-stat" variant="borderless" size="small">
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Transactions Today</Text>
                <Title level={4} style={{ margin: 0 }}>
                  {formatterInt(
                    Math.round((orderSummary?.totalOrders || 0) / 30)
                  )}
                </Title>
              </div>
              <FaChartLine size={20} style={{ color: "#3b82f6" }} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
    // </Spin>
  );
};
