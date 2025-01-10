"use client";

import { useEffect, useState } from "react";
import axios from "axios";

let currency = "USD";

export default function Projection() {
  const data = {
    Metric: ["Revenue", "Profit", "Expenses"],
    2024: [100000, 20000, 80000],
    2023: [95000, 18000, 77000],
    2022: [90000, 17000, 73000],
  };

  return (
    <>
      <div className="projection-wrapper">
        <div className="financial-table-title">
          {" "}
          <p className="financial-table-title"> Year On Year </p>
          <hr className="divider"></hr>{" "}
        </div>
        <table className="financial-table">
          <tr>
            <th>Year</th>
            <td>2025</td>
            <td>2026</td>
            <td>2027</td>
            <td>2028</td>
            <td>2029</td>
            <td>2030</td>
            <td>2031</td>
            <td>2032</td>
            <td>2033</td>
            <td>2034</td>
            <td>2035</td>
          </tr>
          <tr>
            <th>Free Cash Flow (Projected)</th>
            <td>Alice</td>
            <td>25</td>
          </tr>
          <tr>
            <th>Discount Factor</th>
            <td>Bob</td>
            <td>30</td>
          </tr>
          <tr>
            <th>Discount Value</th>
            <td>Bob</td>
            <td>30</td>
          </tr>
        </table>
      </div>
    </>
  );
}
