import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/Home/HomePage";
import About from "./pages/Home/About";
import { Contant } from "./pages/Home/Contant";
import LoginPage from "./pages/Auth/LoginPage";
import { RegisterPage } from "./pages/Auth/RegisterPage";
import ManiLayout from "./components/Loyout/ManiLayout";
import MainLogin from "./components/Loyout/MainLogin";
import MainRegister from "./components/Loyout/MainRegister";
import { Product } from "./pages/Home/Product";
import UserPage from "./pages/Home/UserPage";
import Role from "./pages/Home/Role";
import { Category } from "./pages/Home/Category";
import { ProvincePage } from "./pages/Home/province/ProvincePage";
import { BrandPage } from "./pages/Home/brand/BrandPage";
import { ProductCardPage } from "./pages/Home/ProductCardPage";
import { EmployeePage } from "./pages/Home/employee/EmployeePage";
import { PayrollPage } from "./pages/Home/payroll/PayrollPage";
import { PayrollDetail } from "./pages/Home/payroll/PayrollDetail";
import { PosPage } from "./pages/Home/pos/PosPage";
import imageError from "./assets/empty/error.png";
import ReactPrinter from "./pages/Home/invoice/ReactPrinter";
import { ExpenseType } from "./pages/Home/expense/ExpenseType";
import { ExpensePage } from "./pages/Home/expense/ExpensePage";
import { CustomerType } from "./pages/Home/customer/CustomerType";
import { CustomerPage } from "./pages/Home/customer/CustomerPage";
import { OrderList } from "./pages/Home/order/OrderList";
import { SupplierPage } from "./pages/Home/supplier/SupplierPage";
import TopSelling from "./pages/Home/topselling/TopSelling";
import { ExpenseSummaryProvider } from "./pages/Context/ExpenseSummaryContext";
import { OrderSummaryProvider } from "./pages/Context/OrderSummaryContext";

export const App = () => {
  return (
    <ExpenseSummaryProvider>
      <OrderSummaryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/invoice" element={<ReactPrinter />} />
            <Route element={<ManiLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<About />} />
              <Route path="/role" element={<Role />} />
              <Route path="/brand" element={<BrandPage />} />
              <Route path="/category" element={<Category />} />
              <Route path="/order" element={<OrderList />} />
              <Route path="/employee" element={<EmployeePage />} />
              <Route path="/supplier" element={<SupplierPage />} />
              <Route path="/report/top-seller" element={<TopSelling />} />
              <Route
                path="/customer/customer-type"
                element={<CustomerType />}
              />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/province" element={<ProvincePage />} />
              <Route path="/expense" element={<ExpensePage />} />
              <Route path="/expense/expense-type" element={<ExpenseType />} />
              <Route path="/payroll" element={<PayrollPage />} />
              <Route path="/pos" element={<PosPage />} />
              <Route
                path="/payroll/payroll-detail/:id"
                element={<PayrollDetail />}
              />

              <Route path="/product" element={<Product />} />
              <Route path="/product-card" element={<ProductCardPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/user" element={<UserPage />} />
              <Route path="/contant" element={<Contant />} />

              <Route
                path="*"
                element={
                  <div>
                    <div className="flex flex-col justify-center items-center h-[60vh] ">
                      <img
                        style={{ width: 100, height: 100, color: "red" }}
                        src={imageError}
                        alt=""
                      />
                      <div className="text-sm  font-bold">
                        We are under develoment and repair
                      </div>
                    </div>
                  </div>
                }
              />
            </Route>

            {/* login route */}
            <Route element={<MainLogin />}>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="*"
                element={
                  <h1 style={{ color: "red", textAlign: "center" }}>
                    404 Page Not Found
                  </h1>
                }
              />
            </Route>
            {/* login route */}
            <Route element={<MainRegister />}>
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="*"
                element={
                  <h1 style={{ color: "red", textAlign: "center" }}>
                    404 Page Not Found
                  </h1>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </OrderSummaryProvider>
    </ExpenseSummaryProvider>
  );
};
