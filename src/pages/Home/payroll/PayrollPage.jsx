import React, { useEffect, useState } from "react";
import { FaRegClock, FaRegUser } from "react-icons/fa";
import { LuFilePen } from "react-icons/lu";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { PayrollRecent } from "./PayrollRecent";
import { request } from "../../../util/request";

export const PayrollPage = () => {
  const mystyle = { padding: 25 };
  const fontStyle = { fontSize: 15 };
  const [payrollData, setPayrollData] = useState([]);

  // Animated counts
  const [animatedCounts, setAnimatedCounts] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    draft: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await request("payroll", "get");
      if (res && !res.erorrs) {
        setPayrollData(res.list || []);
      }
    };
    fetchData();
  }, []);

  // Update animated counts whenever payrollData changes
  useEffect(() => {
    const total = payrollData.length;
    const approved = payrollData.filter((p) => p.status === "approved").length;
    const pending = payrollData.filter((p) => p.status === "pending").length;
    const draft = payrollData.filter((p) => p.status === "draft").length;

    const duration = 1000; // total animation duration in ms
    const steps = 30; // number of animation steps
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

    animateCount(total, "total");
    animateCount(approved, "approved");
    animateCount(pending, "pending");
    animateCount(draft, "draft");
  }, [payrollData]);

  const cards = [
    {
      title: "Total Payroll",
      count: animatedCounts.total,
      icon: <IoDocumentTextOutline size={19} color="blue" />,
    },
    {
      title: "Approved",
      count: animatedCounts.approved,
      icon: <MdOutlineVerifiedUser size={19} color="green" />,
    },
    {
      title: "Pending Review",
      count: animatedCounts.pending,
      icon: <FaRegClock size={19} color="orange" />,
    },
    {
      title: "Draft",
      count: animatedCounts.draft,
      icon: <LuFilePen size={19} color="gray" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white w-full flex justify-between rounded-lg hover:bg-gray-50 transition-colors md:p-9"
            style={mystyle}
          >
            <div>
              <div className="text-gray-500 font-semibold" style={fontStyle}>
                {card.title}
              </div>
              <div className="text-2xl font-bold mt-4 mb-4">{card.count}</div>
              {card.subtitle && (
                <div className="text-gray-500 font-semibold" style={fontStyle}>
                  {card.subtitle}
                </div>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-200">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Payroll */}
      <PayrollRecent payrollData={payrollData} />
    </div>
  );
};
