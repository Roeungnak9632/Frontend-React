import {
  Row,
  Col,
  Image,
  Button,
  message,
  Spin,
  Card,
  Divider,
  Select,
  Input,
  Modal,
  QRCode,
  Flex,
  Space,
  InputNumber,
  Tag,
  Descriptions,
} from "antd";
import { IoPrintOutline } from "react-icons/io5";
import { useEffect, useState, useCallback } from "react";
import { ProductCard } from "../../../components/product/ProductCard";
import { request } from "../../../util/request";
import { RiDeleteBin6Line } from "react-icons/ri";
import emptyCart from "../../../assets/empty/empty-cart.png";
import config from "../../../util/config";
import { IoCardOutline } from "react-icons/io5";
import { LuTextSearch } from "react-icons/lu";
import { IoMdRefresh } from "react-icons/io";
import { MdOutlinePayments, MdOutlineReceiptLong } from "react-icons/md";
import { BsCurrencyDollar } from "react-icons/bs";
import { AiOutlinePercentage } from "react-icons/ai";
import NotFoundProduct from "../../../assets/empty/empty-cart.png";

export const PosPage = () => {
  const [state, setState] = useState({
    list: [],
    total: 0,
    loading: false,
    category: [],
    brand: [],
  });
  const [cart, setCart] = useState([]);
  const [payment, setPayment] = useState(null);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showKHQR, setShowKHQR] = useState(false);
  const [khqrData, setKhqrData] = useState(null);

  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState("percentage");
  const [amountPaid, setAmountPaid] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [transactionNote, setTransactionNote] = useState("");
  const [cashierName, setCashierName] = useState("admin");
  const [customer, setCustomer] = useState(null);

  const [filter, setFilter] = useState({
    text_search: null,
    status_filter: null,
    category_id: null,
    brand_id: null,
    in_stock_only: null,
  });

  // Calculate values
  const subTotal = cart.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );
  const taxRate = 0.12;
  const tax = subTotal * taxRate;

  const calculateDiscount = useCallback(() => {
    if (discountType === "percentage") {
      return subTotal * (discountValue / 100);
    }
    return Math.min(discountValue, subTotal);
  }, [discountType, discountValue, subTotal]);

  const discount = calculateDiscount();
  const totalPayment = subTotal + tax - discount;
  const changeDue = amountPaid - totalPayment;

  const generateInvoiceNumber = useCallback(() => {
    const now = new Date();
    return `INV-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now
      .getDate()
      .toString()
      .padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await request("customer", "get");
      if (res && !res.errors) {
        setCustomers(res.list || []);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  }, []);

  const getList = useCallback(async (param_filter = {}) => {
    param_filter = { ...filter, ...param_filter };
    setState((pre) => ({ ...pre, loading: true }));

    let query_param = "?page=1";
    query_param += "&in_stock=1";

    if (param_filter.text_search) {
      query_param += "&text_search=" + param_filter.text_search;
    }
    if (param_filter.status_filter) {
      query_param += "&status_filter=" + param_filter.status_filter;
    }
    if (param_filter.category_id) {
      query_param += "&category_id=" + param_filter.category_id;
    }
    if (param_filter.brand_id) {
      query_param += "&brand_id=" + param_filter.brand_id;
    }

    const res = await request("products" + query_param, "get");

    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        list: (res.list || []).sort((a, b) => b.id - a.id),
        total: (res.list || []).length,
        category: (res.category || []).sort((a, b) => b.id - a.id),
        brand: (res.brand || []).sort((a, b) => b.id - a.id),
        loading: false,
      }));
    } else {
      setState((pre) => ({ ...pre, loading: false }));
      if (res?.errors?.message) message.error(res.errors.message);
    }
  }, []);

  const handleFilter = () => {
    getList(filter);
  };
  const handleReset = () => {
    const data = {
      text_search: null,
      status_filter: null,
      category_id: null,
      brand_id: null,
      in_stock_only: null,
    };
    setFilter(data);
    getList(data);
  };

  useEffect(() => {
    getList();
    loadCustomers();
    setInvoiceNo(generateInvoiceNumber());
  }, [getList, loadCustomers, generateInvoiceNumber]);

  const onAddCart = useCallback(
    (item) => {
      setCart((prev) => {
        const exist = prev.find((i) => i.id === item.id);

        const product = state.list.find((p) => p.id === item.id);
        const availableStock = product?.quantity || 0;

        const currentQty = exist ? exist.quantity : 0;

        if (currentQty >= availableStock) {
          message.warning("Product out of stock");
          return prev;
        }

        if (exist) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }

        return [...prev, { ...item, quantity: 1 }];
      });
    },
    [state.list]
  );

  const onRemoveQuantity = useCallback((item) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const onRemoveItem = useCallback((item) => {
    setCart((prev) => prev.filter((i) => i.id !== item.id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscountValue(0);
    setAmountPaid(0);
    setPayment(null);
    setCustomer(null);
    setTransactionNote("");
  }, []);
  const payment_method = [
    { label: "Cash", value: "cash", icon: <BsCurrencyDollar /> },
    { label: "ABA", value: "ABA" },
    { label: "ACLEDA", value: "ACLEDA" },
    { label: "WING", value: "WING" },
    { label: "Bank Transfer", value: "bank_transfer" },
  ];

  const generateKHQR = useCallback(() => {
    return {
      amount: totalPayment.toFixed(2),
      merchant: "VERHOP COMPUTER",
      qrText: `KHQR|AMT:${totalPayment.toFixed(
        2
      )}|INV:${invoiceNo}|MERCHANT:VERHOP`,
    };
  }, [totalPayment, invoiceNo]);

  const finalizeCheckout = useCallback(async () => {
    if (cart.length === 0) {
      message.warning("Cart is empty");
      return;
    }

    try {
      const payload = {
        invoice_no: invoiceNo,
        customer_id: customer || null,
        sub_total: subTotal.toFixed(2),
        tax: tax.toFixed(2),
        discount: discount.toFixed(2),
        total_amount: totalPayment.toFixed(2),
        paid_amount:
          amountPaid > 0 ? amountPaid.toFixed(2) : totalPayment.toFixed(2),
        change_due:
          payment === "cash" && changeDue > 0 ? changeDue.toFixed(2) : "0.00",
        payment_method: payment,
        note: transactionNote || "",
        items: cart.map((item) => ({
          id: item.id,
          price: parseFloat(item.price) || 0,
          qty: parseInt(item.quantity) || 1,
          name: item.prd_name || item.name || "",
        })),
      };

      console.log("Checkout payload:", payload);

      const res = await request("orders/checkout", "post", payload);

      if (res && res.status === true) {
        const invoiceDataObj = {
          invoiceNumber: res.order?.invoice_no || invoiceNo,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          customer: customers.find((c) => c.id === customer) || null,
          cashier: cashierName,
          items: cart,
          subtotal: subTotal,
          tax: tax,
          discount: discount,
          total: totalPayment,
          paymentMethod: payment,
          amountPaid: amountPaid > 0 ? amountPaid : totalPayment,
          changeDue: changeDue > 0 ? changeDue : 0,
          status: "COMPLETED",
        };

        setInvoiceData(invoiceDataObj);
        setShowInvoice(true);

        setCart([]);
        setDiscountValue(0);
        setAmountPaid(0);
        setPayment(null);
        setCustomer(null);
        setTransactionNote("");

        getList();

        // Generate new invoice number for next transaction
        setInvoiceNo(generateInvoiceNumber());

        message.success(res.message || "Checkout successful!");

        console.log("Checkout successful:", res.order);
      } else {
        const errorMsg = res?.message || "Checkout failed";
        message.error(errorMsg);

        console.error("Checkout API error:", res);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      message.error(err.message || "An error occurred during checkout");
    }
  }, [
    cart,
    payment,
    amountPaid,
    discountType,
    discountValue,
    customer,
    invoiceNo,
    transactionNote,
    cashierName,
    getList,
    generateInvoiceNumber,
    customers,
    calculateDiscount,
    subTotal,
    tax,
    discount,
    totalPayment,
    changeDue,
  ]);

  const validateCheckout = useCallback(() => {
    if (cart.length === 0) return "Cart is empty";
    if (!payment) return "Please select payment method";

    // Validate stock availability
    const outOfStockItems = cart.filter((item) => {
      const product = state.list.find((p) => p.id === item.id);
      return product && product.quantity < item.quantity;
    });

    if (outOfStockItems.length > 0) {
      return `Some items exceed available stock: ${outOfStockItems
        .map((item) => item.prd_name)
        .join(", ")}`;
    }

    if (payment === "cash" && amountPaid < totalPayment) {
      return `Insufficient payment. Need $${(totalPayment - amountPaid).toFixed(
        2
      )} more`;
    }

    return null;
  }, [cart, payment, amountPaid, totalPayment, state.list]);

  const handleCheckout = useCallback(() => {
    const validationError = validateCheckout();
    if (validationError) {
      message.error(validationError);
      return;
    }

    if (["ABA", "ACLEDA", "WING"].includes(payment)) {
      const qr = generateKHQR();
      setKhqrData(qr);
      setShowKHQR(true);
      return;
    }

    // Show loading state
    setState((prev) => ({ ...prev, loading: true }));

    finalizeCheckout().finally(() => {
      setState((prev) => ({ ...prev, loading: false }));
    });
  }, [validateCheckout, payment, generateKHQR, finalizeCheckout]);

  // SIMULATE KHQR PAYMENT
  useEffect(() => {
    if (!showKHQR) return;

    const timer = setTimeout(() => {
      setShowKHQR(false);
      setState((prev) => ({ ...prev, loading: true }));
      finalizeCheckout().finally(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [showKHQR, finalizeCheckout]);

  // Handle print invoice
  const handlePrintInvoice = useCallback(() => {
    if (cart.length === 0) {
      message.warning("Cart is empty");
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === customer);
    const invoiceDataObj = {
      invoiceNumber: invoiceNo,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      customer: selectedCustomer || null,
      cashier: cashierName,
      items: cart,
      subtotal: subTotal,
      tax: tax,
      discount: discount,
      total: totalPayment,
      paymentMethod: payment,
      amountPaid: amountPaid > 0 ? amountPaid : totalPayment,
      changeDue: changeDue > 0 ? changeDue : 0,
      status: "DRAFT",
    };

    setInvoiceData(invoiceDataObj);
    setShowInvoice(true);
    message.info(
      "Invoice preview ready. Connect to printer for actual printing."
    );
  }, [
    cart,
    customers,
    customer,
    cashierName,
    invoiceNo,
    subTotal,
    tax,
    discount,
    totalPayment,
    payment,
    amountPaid,
    changeDue,
  ]);

  const applyDiscount = useCallback((type, value) => {
    setDiscountType(type);
    setDiscountValue(value);
  }, []);

  return (
    <Spin spinning={state.loading}>
      <div
        className="bg-white "
        style={{
          padding: "15px",
          marginBottom: "10px",
          borderRadius: "5px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Row gutter={[12, 12]} align="middle" wrap>
          <Col>
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>Filter:</div>
          </Col>

          <Col xs={24} sm={24} md={8} lg={6}>
            <Input
              placeholder="Search products"
              allowClear
              size="middle"
              onChange={(e) =>
                setFilter((pre) => ({
                  ...pre,
                  text_search: e.target.value,
                }))
              }
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={12} sm={12} md={5} lg={4}>
            <Select
              placeholder="Stock"
              allowClear
              style={{ width: "100%" }}
              value={filter.in_stock_only === true ? "in_stock" : "all"}
              onChange={(value) =>
                setFilter((pre) => ({
                  ...pre,
                  in_stock_only: value === "in_stock",
                }))
              }
              options={[
                { label: "All", value: "all" },
                { label: "In Stock Only", value: "in_stock" },
              ]}
            />
          </Col>

          <Col xs={12} sm={12} md={5} lg={4}>
            <Select
              allowClear
              placeholder="Select By Category"
              style={{ width: "100%" }}
              value={filter.category_id}
              onChange={(value) =>
                setFilter((pre) => ({
                  ...pre,
                  category_id: value,
                }))
              }
              options={state.category.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
            />
          </Col>

          <Col xs={12} sm={12} md={5} lg={4}>
            <Select
              allowClear
              placeholder="Select By Brand"
              style={{ width: "100%" }}
              value={filter.brand_id}
              onChange={(value) =>
                setFilter((pre) => ({
                  ...pre,
                  brand_id: value,
                }))
              }
              options={state.brand.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
            />
          </Col>

          <Col xs={12} sm={12} md={4} lg={2}>
            <Button
              type="primary"
              danger
              onClick={handleReset}
              style={{ width: "100%" }}
              icon={<IoMdRefresh size={16} />}
            >
              <span className="hidden xs:inline">Reset</span>
              <span className="inline xs:hidden">Reset</span>
            </Button>
          </Col>

          <Col xs={12} sm={12} md={4} lg={2}>
            <Button
              type="primary"
              onClick={handleFilter}
              style={{ width: "100%" }}
              icon={<LuTextSearch size={16} />}
            >
              <span className="hidden xs:inline">Search</span>
              <span className="inline xs:hidden">Search</span>
            </Button>
          </Col>
        </Row>
      </div>

      <div style={{ width: "100%" }}>
        <Row gutter={16}>
          {/* PRODUCTS */}
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              {state.list
                .filter((item) => {
                  if (filter.in_stock_only) {
                    return item.quantity > 0;
                  }
                  return true;
                })
                .map((item) => (
                  <Col xs={24} md={8} lg={6} key={item.id}>
                    <ProductCard
                      {...item}
                      onAddToCart={() => onAddCart(item)}
                    />
                  </Col>
                ))}

              {!state.loading && state.list.length === 0 && (
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 100,
                  }}
                >
                  <div>
                    <div>
                      <img
                        src={NotFoundProduct}
                        alt=""
                        color="gray"
                        style={{ width: 80, marginLeft: 20 }}
                      />
                    </div>
                    <h1
                      style={{
                        margin: "5px",
                        fontSize: 15,
                        fontWeight: "bold",
                      }}
                    >
                      No Items Found!!
                    </h1>
                    <h4 style={{ marginLeft: -45 }}>
                      Please refresh the page and try again
                    </h4>
                  </div>
                </Col>
              )}
            </Row>
          </Col>

          {/* TRANSACTION CARD - ENHANCED */}
          <Col xs={24} md={8}>
            <Card
              title={
                <div className="flex justify-between items-center">
                  <span>Transaction Details</span>
                  <Tag color="blue" style={{ margin: 3 }}>
                    Items: {cart.length}
                  </Tag>
                </div>
              }
              extra={
                <Button
                  danger
                  size="small"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  <RiDeleteBin6Line />
                  Clear All
                </Button>
              }
            >
              {/* Cart Items */}
              {cart.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-8">
                  <img src={emptyCart} width={65} alt="Empty cart" />
                  <p className="text-gray-500 " style={{ marginBottom: 5 }}>
                    Cart is empty
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: "160px",
                    overflowY: "auto",
                    paddingRight: 8,
                    marginBottom: 16,
                  }}
                >
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        marginBottom: 10,
                        alignItems: "center",
                      }}
                    >
                      <Image
                        width={60}
                        src={
                          item.image
                            ? config.image_path + item.image
                            : "https://via.placeholder.com/200"
                        }
                      />
                      <div style={{ marginLeft: 10, flex: 1 }}>
                        <p>{item.prd_name}</p>
                        <p>${item.price}</p>
                        <Button
                          size="small"
                          onClick={() => onRemoveQuantity(item)}
                        >
                          -
                        </Button>
                        <span style={{ margin: "0 8px" }}>{item.quantity}</span>
                        <Button size="small" onClick={() => onAddCart(item)}>
                          +
                        </Button>
                      </div>
                      <Button danger onClick={() => onRemoveItem(item)}>
                        <RiDeleteBin6Line />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Divider />
              {/* Quick Discount Buttons */}
              {cart.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-medium">Quick Discount</label>
                    <Select
                      size="small"
                      value={discountType}
                      onChange={setDiscountType}
                      style={{ width: 100 }}
                      options={[
                        { label: "%", value: "percentage" },
                        { label: "$", value: "amount" },
                      ]}
                    />
                  </div>
                  <Flex gap={8} wrap="wrap">
                    {discountType === "percentage" ? (
                      <>
                        <Button
                          size="small"
                          onClick={() => applyDiscount("percentage", 5)}
                        >
                          5%
                        </Button>
                        <Button
                          size="small"
                          onClick={() => applyDiscount("percentage", 10)}
                        >
                          10%
                        </Button>
                        <Button
                          size="small"
                          onClick={() => applyDiscount("percentage", 15)}
                        >
                          15%
                        </Button>
                        <Button
                          size="small"
                          onClick={() => applyDiscount("percentage", 20)}
                        >
                          20%
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="small"
                          onClick={() => applyDiscount("amount", 5)}
                        >
                          $5
                        </Button>
                        <Button
                          size="small"
                          onClick={() => applyDiscount("amount", 10)}
                        >
                          $10
                        </Button>
                        <Button
                          size="small"
                          onClick={() => applyDiscount("amount", 20)}
                        >
                          $20
                        </Button>
                        <Button
                          size="small"
                          onClick={() => applyDiscount("amount", 50)}
                        >
                          $50
                        </Button>
                      </>
                    )}
                    <Button
                      size="small"
                      danger
                      onClick={() => setDiscountValue(0)}
                    >
                      Clear
                    </Button>
                  </Flex>
                  <InputNumber
                    addonBefore={
                      discountType === "percentage" ? (
                        <AiOutlinePercentage />
                      ) : (
                        <BsCurrencyDollar />
                      )
                    }
                    placeholder="Custom discount"
                    style={{ width: "100%", marginTop: 8 }}
                    value={discountValue}
                    onChange={(value) => setDiscountValue(value || 0)}
                    min={0}
                    max={discountType === "percentage" ? 100 : subTotal}
                  />
                </div>
              )}
              <div style={{ marginBottom: 10 }}>
                <label className="font-medium">Invoice No</label>
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={invoiceNo}
                    disabled
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              {/* Transaction Details */}
              <Row gutter={8}>
                <Col span={12}>
                  <div style={{ marginBottom: 10 }}>
                    <label className="font-medium">Payment Method</label>
                    <Select
                      allowClear
                      placeholder="Select Payment Method"
                      style={{ width: "100%" }}
                      value={payment}
                      onChange={setPayment}
                      options={payment_method.map((method) => ({
                        ...method,
                        label: (
                          <div className="flex items-center">
                            {method.icon && (
                              <span style={{ marginRight: 8 }}>
                                {method.icon}
                              </span>
                            )}
                            {method.label}
                          </div>
                        ),
                      }))}
                    />
                  </div>
                </Col>
                <Col span={12}>
                  {/* Customer Selection */}
                  <div style={{ marginBottom: 16 }}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">Customer</label>
                    </div>
                    <Select
                      style={{ width: "100%" }}
                      value={customer}
                      onChange={setCustomer}
                      placeholder="Select Customer"
                      options={[
                        ...customers.map((cust) => ({
                          label: `${cust.name} (${cust.phone || "No phone"})`,
                          value: cust.id,
                        })),
                      ]}
                    />
                  </div>
                </Col>
              </Row>

              {/* Amount Paid for Cash */}
              {payment === "cash" && cart.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <label className="font-medium">Amount Paid</label>
                  <InputNumber
                    addonBefore={<BsCurrencyDollar />}
                    style={{ width: "100%" }}
                    value={amountPaid}
                    onChange={setAmountPaid}
                    min={0}
                    placeholder="Enter amount received"
                  />
                </div>
              )}

              {/* Transaction Note */}
              <div style={{ marginBottom: 16 }}>
                <label className="font-medium">Note (Optional)</label>
                <Input.TextArea
                  rows={2}
                  placeholder="Add transaction note..."
                  value={transactionNote}
                  onChange={(e) => setTransactionNote(e.target.value)}
                />
              </div>
              <Divider />
              {/* Price Summary */}
              <div className="flex justify-between mb-2">
                <span>Sub Total</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax (12%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-red-500">Discount</span>
                  <span className="text-red-500">-${discount.toFixed(2)}</span>
                </div>
              )}
              <Divider style={{ margin: "12px 0" }} />
              <div className="flex justify-between font-bold text-lg">
                <span style={{ fontSize: 13 }}>Total Price</span>
                <span className="text-green-600" style={{ fontSize: 13 }}>
                  ${totalPayment.toFixed(2)}
                </span>
              </div>

              {/* Change Due */}
              {payment === "cash" && amountPaid > 0 && changeDue > 0 && (
                <div className="flex justify-between mt-3 pt-3 border-t">
                  <span>Change Due</span>
                  <span className="text-blue-600 font-bold">
                    ${changeDue.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <Flex gap={8} vertical>
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || !payment}
                  icon={<IoCardOutline />}
                >
                  <span style={{ fontSize: 14 }}>
                    {" "}
                    Checkout ${totalPayment.toFixed(2)}
                  </span>
                </Button>

                <Flex gap={8}>
                  <Button
                    block
                    onClick={handlePrintInvoice}
                    disabled={cart.length === 0}
                    icon={<MdOutlineReceiptLong />}
                  >
                    Print Preview
                  </Button>
                  <Button
                    block
                    type="default"
                    onClick={() => message.info("Transaction held")}
                    disabled={cart.length === 0}
                  >
                    Hold
                  </Button>
                </Flex>
              </Flex>

              {/* Cashier Info */}
              <Divider style={{ margin: "16px 0 8px 0" }} />
              <div className="flex justify-between text-gray-500 text-sm">
                <span>Cashier: {cashierName}</span>
                <span>Items: {cart.length}</span>
              </div>
            </Card>
          </Col>
        </Row>

        {/* KHQR MODAL */}
        <Modal
          open={showKHQR}
          title={
            <div className="flex items-center">
              <MdOutlinePayments style={{ marginRight: 8 }} />
              Scan KHQR to Pay
            </div>
          }
          footer={null}
          centered
          onCancel={() => setShowKHQR(false)}
        >
          {khqrData && (
            <div style={{ textAlign: "center" }}>
              <div className="flex justify-center items-center p-4">
                <QRCode
                  value={khqrData.qrText}
                  size={240}
                  icon={config.logo_path || undefined}
                />
              </div>

              <Descriptions
                column={1}
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Descriptions.Item label="Amount">
                  <span className="font-bold text-lg">${khqrData.amount}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Invoice">
                  <Tag color="blue">{invoiceNo}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Merchant">
                  {khqrData.merchant}
                </Descriptions.Item>
              </Descriptions>

              <Divider />
              <div style={{ padding: "12px 0" }}>
                <div className="animate-pulse">
                  <p style={{ color: "#52c41a", fontWeight: "bold" }}>
                    Waiting for payment confirmation...
                  </p>
                </div>
              </div>

              <Button
                block
                type="dashed"
                onClick={() => setShowKHQR(false)}
                style={{ marginTop: 16 }}
              >
                Cancel Payment
              </Button>
            </div>
          )}
        </Modal>

        {/* INVOICE PREVIEW MODAL */}
        <Modal
          open={showInvoice}
          title="Invoice Preview"
          width={800}
          footer={[
            <Button key="close" onClick={() => setShowInvoice(false)}>
              Close
            </Button>,
            <Button key="print" type="primary" icon={<IoPrintOutline />}>
              Print
            </Button>,
          ]}
          onCancel={() => setShowInvoice(false)}
        >
          {invoiceData && invoiceData.items && (
            <div style={{ padding: 20 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h2>VERHOP COMPUTER</h2>
                <p>Company Store Provide Software and Hardware</p>
                <h3>INVOICE</h3>
              </div>

              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Invoice No">
                  {invoiceData.invoiceNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  {invoiceData.date}
                </Descriptions.Item>
                <Descriptions.Item label="Customer">
                  {invoiceData.customer?.name || "Walk-in Customer"}
                </Descriptions.Item>
                <Descriptions.Item label="Cashier">
                  {invoiceData.cashier}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <table style={{ width: "100%", marginBottom: 24 }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: 8,
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Item
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: 8,
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: 8,
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Price
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: 8,
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: 8 }}>{item.prd_name}</td>
                      <td style={{ textAlign: "right", padding: 8 }}>
                        {item.quantity}
                      </td>
                      <td style={{ textAlign: "right", padding: 8 }}>
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "right", padding: 8 }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Divider />

              <div style={{ textAlign: "right" }}>
                <div style={{ marginBottom: 8 }}>
                  Subtotal: ${invoiceData.subtotal?.toFixed(2) || "0.00"}
                </div>
                <div style={{ marginBottom: 8 }}>
                  Tax (12%): ${invoiceData.tax?.toFixed(2) || "0.00"}
                </div>
                {invoiceData.discount > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    Discount: -${invoiceData.discount?.toFixed(2) || "0.00"}
                  </div>
                )}
                <div
                  style={{ fontSize: 18, fontWeight: "bold", marginTop: 16 }}
                >
                  TOTAL: ${invoiceData.total?.toFixed(2) || "0.00"}
                </div>
                {invoiceData.paymentMethod && (
                  <div style={{ marginTop: 16 }}>
                    <p>Payment Method: {invoiceData.paymentMethod}</p>
                    <p>
                      Amount Paid: $
                      {invoiceData.amountPaid?.toFixed(2) || "0.00"}
                    </p>
                    {invoiceData.changeDue > 0 && (
                      <p>
                        Change: ${invoiceData.changeDue?.toFixed(2) || "0.00"}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Divider />

              <div
                style={{ textAlign: "center", marginTop: 32, color: "#666" }}
              >
                <p>Thank you for your business!</p>
                <p>Contact: admin@verhop.com | Phone: (123) 456-7890</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Spin>
  );
};
