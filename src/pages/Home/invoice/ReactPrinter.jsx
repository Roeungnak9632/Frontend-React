import React from "react";
import styled from "styled-components";

function ReactPrinter({ invoiceNumber, date, dueDate, items }) {
  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0
  );

  return (
    <Container>
      <Receipt>
        <h3 style={{ textAlign: "center" }}>INVOICE</h3>

        <Row>
          <span>Invoice:</span>
          <span>{invoiceNumber}</span>
        </Row>
        <Row>
          <span>Date:</span>
          <span>{date}</span>
        </Row>
        <Row>
          <span>Due:</span>
          <span>{dueDate}</span>
        </Row>

        <hr />

        {items.map((item, i) => (
          <Row key={i}>
            <span>
              {item.prd_name} x {item.quantity}
            </span>
            <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
          </Row>
        ))}

        <hr />

        <Row>
          <strong>Total</strong>
          <strong>${subtotal.toFixed(2)}</strong>
        </Row>
      </Receipt>
    </Container>
  );
}

export default ReactPrinter;

/* ===== STYLE ===== */
const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px;
`;

const Receipt = styled.div`
  width: 320px;
  font-family: monospace;
  border: 1px dashed #000;
  padding: 15px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
`;
