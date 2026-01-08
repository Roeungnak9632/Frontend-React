import React, { useEffect, useState } from "react";
import { data, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  DollarOutlined,
  SettingOutlined,
  ShopOutlined,
  IdcardOutlined,
  SolutionOutlined,
  AuditOutlined,
  PayCircleOutlined,
  ScheduleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { IoMdNotificationsOutline } from "react-icons/io";

import { FaUserPlus } from "react-icons/fa6";
import { MdOutlineInventory2 } from "react-icons/md";
import { AiOutlineShoppingCart, AiOutlineAppstore } from "react-icons/ai";
import { TbCategory } from "react-icons/tb";
import { ImProfile } from "react-icons/im";
import { IoIosLogOut } from "react-icons/io";
import { RiLockPasswordLine } from "react-icons/ri";
import logo from "../../assets/img/logo_brand.png";
import { Dropdown, Drawer, Button } from "antd";
import { IoMailUnreadOutline } from "react-icons/io5";
import { Breadcrumb, Layout, Menu, Space, theme, Input } from "antd";
import { FaUsersGear, FaReceipt } from "react-icons/fa6";
import { RiShoppingBag4Line } from "react-icons/ri";
import {
  BsPcDisplayHorizontal,
  BsGraphUp,
  BsCurrencyDollar,
} from "react-icons/bs";
import {
  MdAdminPanelSettings,
  MdOutlineAdminPanelSettings,
  MdOutlinePointOfSale,
  MdTransferWithinAStation,
} from "react-icons/md";
import {
  IoSettingsSharp,
  IoPeopleOutline,
  IoDocumentText,
  IoCash,
} from "react-icons/io5";
import {
  AiOutlineProduct,
  AiOutlineShopping,
  AiOutlineUser,
} from "react-icons/ai";
import { RiUserSettingsLine, RiShieldUserLine } from "react-icons/ri";
import { TbReport } from "react-icons/tb";

import { profileStore } from "../../store/ProfileStore";
import config from "../../util/config";

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items_Menu_Left_Tmp = [
  getItem("Dashboard", "/", <PieChartOutlined />),
  getItem("POS", "/pos", <MdOutlinePointOfSale />),
  // getItem("Order", "/order", <ShoppingCartOutlined />),

  getItem("Inventory", "/inventory", <MdOutlineInventory2 />, [
    getItem("Product", "/product", <AiOutlineAppstore />),
    getItem("Product Card", "/product-card", <AiOutlineShoppingCart />),
    getItem("Brand", "/brand", <RiShoppingBag4Line />),
    getItem("Category", "/category", <TbCategory />),
  ]),
  getItem("Expense", "expense", <IoCash />, [
    getItem("Expense", "/expense", <DollarOutlined />),
    getItem("Expense Type", "/expense/expense-type", <FileOutlined />),
  ]),
  getItem("Customer", "customer", <FaUsersGear />, [
    getItem("Customer", "/customer", <UserOutlined />),
    getItem("Customer Type", "/customer/customer-type", <IdcardOutlined />),
  ]),
  getItem("Employee", "employee", <FaUsersGear />, [
    getItem("Employee", "/employee", <UserOutlined />),
    getItem("Payroll", "/payroll", <PayCircleOutlined />),
  ]),
  getItem("Report", "report", <TbReport />, [
    getItem("TopSeller", "/report/top-seller", <BsGraphUp />),
    getItem("Order", "/order", <ShoppingCartOutlined />),
    // getItem("Purchase", "/report/purchase", <AiOutlineShopping />),
    // getItem("Expense", "/report/expense", <IoCash />),
  ]),
  getItem("Purchase", "purchase", <AiOutlineShopping />, [
    getItem("Purchase Item List", "/purchase", <ShoppingCartOutlined />),
    getItem("Supplier", "/supplier", <IoPeopleOutline />),
    // getItem("Payment", "/purchase/payment", <DollarOutlined />),
    // getItem("Receipt", "/purchase/receipt", <FaReceipt />),
  ]),

  getItem("User", "user", <RiUserSettingsLine />, [
    getItem("User", "/user", <AiOutlineUser />),
    getItem("Profile", "/profile", <IdcardOutlined />),
    getItem("Role", "/role", <RiShieldUserLine />),
    getItem("Permission", "/permission", <MdAdminPanelSettings />),
  ]),

  getItem("Setting", "/setting", <IoSettingsSharp />, [
    getItem("Language", "/language", <AuditOutlined />),
    getItem("Currency", "/currency", <BsCurrencyDollar />),
    // getItem("Province", "/province", <BarChartOutlined />),
    getItem("Payment Method", "/payment-method", <SolutionOutlined />),
  ]),
];

const ManiLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [items, setItems] = useState([]);
  const { Profile, permission } = profileStore();

  const items_dropdown = [
    {
      label: (
        <div className="font-medium">
          <div style={{ fontSize: 14 }}>{Profile?.name}</div>
          <div style={{ fontSize: 11 }}>{Profile?.email}</div>
        </div>
      ),
      key: "Profile",
    },
    {
      type: "divider",
    },
    {
      icon: <ImProfile size={18} color="gray" />,
      label: "Change Profile",
      key: "0",
    },
    {
      icon: <RiLockPasswordLine size={18} color="gray" />,
      label: "Change Password",
      key: "1",
    },

    {
      type: "divider",
    },
    {
      icon: <FaUserPlus size={18} color="gray" />,
      label: (
        <Link to="/register">
          <p color="black">Register</p>
        </Link>
      ),
      key: "2",
    },
    {
      icon: <IoIosLogOut size={18} color="red" />,
      label: "Logout",
      key: "logout",
    },
  ];
  const location = useLocation();
  const protectRoute = () => {
    let findIndex = permission?.findIndex(
      (item) => "/" + item.web_route_key == location.pathname
    );
    if (findIndex == -1) {
      for (let i = 0; i < permission.length; i++) {
        if (permission[i].web_route_key != null) {
          navigate(permission[i].web_route_key);
          break;
        }
      }
    }
  };

  const renderMenuLeft = () => {
    let menu_left = [];

    items_Menu_Left_Tmp?.map((item) => {
      // Level 1
      let findLavelIndex = permission?.findIndex(
        (item1) => item.key == "/" + item1.web_route_key
      );
      if (findLavelIndex != -1) {
        menu_left.push(item);
      }
      // end Level 1

      // Level 2
      if (item?.children && item?.children.length > 0) {
        let childTmp = [];

        // filter children based on permission
        item.children.forEach((child) => {
          permission?.forEach((perm) => {
            if (
              `/${perm.web_route_key}` ===
              (child.key.startsWith("/") ? child.key : `/${child.key}`)
            ) {
              childTmp.push(child);
            }
          });
        });
        // push parent with filtered children only if there are valid children
        if (childTmp.length > 0) {
          const newItem = { ...item, children: childTmp };

          // avoid duplicates if parent already pushed in Level 1
          if (!menu_left.some((m) => m.key === newItem.key)) {
            menu_left.push(newItem);
          }
        }
      }
      // end Level 2
    });

    setItems(menu_left);
  };

  useEffect(() => {
    protectRoute();
    renderMenuLeft();
    if (!Profile) {
      navigate("/login");
    }

    // Check screen size on mount and resize
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const toggleMobileDrawer = () => {
    setMobileDrawerVisible(!mobileDrawerVisible);
  };

  const handleMenuClick = (key) => {
    navigate(key);
    if (isMobile) {
      setMobileDrawerVisible(false);
    }
  };

  if (!Profile) {
    return null;
  }

  const renderDesktopSider = () => (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={{ position: "sticky", top: 0, left: 0, height: "100vh" }}
      breakpoint="lg"
      collapsedWidth={isMobile ? 0 : 80}
      trigger={null}
      className="hidden md:block"
    >
      <div className="demo-logo-vertical" />
      <Menu
        theme="dark"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={items}
        onClick={(item) => handleMenuClick(item.key)}
      />
    </Sider>
  );

  const renderMobileDrawer = () => (
    <Drawer
      title={
        <div className="flex items-center space-x-3 text-white">
          <img
            src={logo}
            alt="Logo"
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border object-contain"
          />

          <div className="leading-tight">
            <div className="text-sm sm:text-base font-bold">
              KSPHOP COMPUTER NK
            </div>
            <div className="text-[10px] sm:text-xs text-gray-200">
              Provide Software and Hardware
            </div>
          </div>
        </div>
      }
      placement="left"
      onClose={() => setMobileDrawerVisible(false)}
      open={mobileDrawerVisible}
      styles={{
        header: { background: "#0E2148", padding: 12 },
        body: { padding: 0 },
      }}
      width={250}
    >
      <Menu
        theme="dark"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={items}
        onClick={(item) => handleMenuClick(item.key)}
        style={{ height: "100%", borderRight: 0 }}
      />
    </Drawer>
  );

  const renderMobileHeader = () => (
    <div
      className="flex items-center justify-between md:hidden p-4 bg-gray-800 text-white "
      style={{ padding: 7, marginBottom: 15 }}
    >
      <Button
        type="text"
        icon={
          mobileDrawerVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />
        }
        onClick={toggleMobileDrawer}
        style={{ color: "white", fontSize: "20px" }}
      />
      <div className="flex items-center p-3">
        <img
          src={logo}
          alt="Logo"
          className="h-12 w-12 object-contain rounded-full border"
        />
        <span className="font-bold text-2x-l ">KSPHOP COMPUTER NK</span>
      </div>
      <Dropdown
        menu={{
          items: items_dropdown,
          onClick: (item) => {
            if (item.key === "logout") {
              profileStore.getState().logout();
              navigate("login");
            }
          },
        }}
      >
        <Space>
          <img
            src={config.image_path + Profile?.image}
            alt="Profile"
            className="h-11 w-11 rounded-full object-cover cursor-pointer"
          />
        </Space>
      </Dropdown>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {renderDesktopSider()}
      {renderMobileDrawer()}

      <Layout>
        {renderMobileHeader()}

        <header
          className="sticky top-0 z-50 bg-white shadow-sm hidden md:block"
          style={{ marginBottom: 15 }}
        >
          <div
            className="flex flex-col md:flex-row items-center justify-between px-4 py-2 md:px-6 md:py-3 mb-4 md:mb-0"
            style={{ margin: "5px 15px" }}
          >
            {/* Left Section */}
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-full border"
              />

              <div style={{ marginLeft: 5 }}>
                <div className="font-bold text-2x-l">KSPHOP COMPUTER NK</div>
                <div className=" text-gray-500" style={{ fontSize: 11 }}>
                  Provide Software and Hardware
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3  mt-2 md:mt-0">
              <div className="flex gap-2" style={{ marginRight: 10 }}>
                <Input prefix={<SearchOutlined />} placeholder="Search" />
                <div
                  style={{
                    padding: 2,
                    border: "1px solid gray",
                    borderRadius: borderRadiusLG,
                  }}
                >
                  <IoMdNotificationsOutline
                    size={24}
                    color="gray"
                    className="cursor-pointer"
                  />
                </div>
                <div
                  style={{
                    padding: 2,
                    border: "1px solid gray",
                    borderRadius: borderRadiusLG,
                  }}
                >
                  <IoMailUnreadOutline
                    color="gray"
                    size={24}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <Dropdown
                menu={{
                  items: items_dropdown,
                  onClick: (item) => {
                    if (item.key === "logout") {
                      profileStore.getState().logout();
                      navigate("login");
                    }
                  },
                }}
              >
                <Space>
                  <img
                    src={config.image_path + Profile?.image}
                    alt="Profile"
                    className="h-10 w-10 md:h-13 md:w-13 rounded-full object-cover cursor-pointer"
                  />
                </Space>
              </Dropdown>
            </div>
          </div>
        </header>

        <Content style={{ margin: isMobile ? "0 8px" : "0 16px" }}>
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </Content>

        <Footer style={{ textAlign: "center", padding: "16px 8px" }}>
          <div className="text-sm md:text-base">
            ©{new Date().getFullYear()} Created by Roeung Nak
          </div>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ManiLayout;
