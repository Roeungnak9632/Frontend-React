import React from "react";
import { Row, Col } from "antd";
import { ProductStore } from "../../store/ProductStore";
import { ProductCard } from "../../components/product/ProductCard";

const About = () => {
  const { list } = ProductStore();
  const newList = [list[0], list[1], list[2]];
  return (
    <div>
      <Row gutter={16}>
        {newList?.map((item, index) => (
          <Col xs={24} md={8} lg={6} key={index}>
            <ProductCard {...item} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default About;
