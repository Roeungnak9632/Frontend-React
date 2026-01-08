import { Row, Col, Image, Button, message, Spin } from "antd";
import { ProductStore } from "../../store/ProductStore";
import { useEffect, useState } from "react";
import { ProductCard } from "../../components/product/ProductCard";
import { request } from "../../util/request";
export const ProductCardPage = () => {
  const [state, setState] = useState({
    list: [],
    total: 0,
    loading: false,
    open: false,
  });

  const [loading, setLoading] = useState(false);

  const onAddCart = (item) => {
    console.log(item);
  };

  const getList = async () => {
    setState((pre) => ({ ...pre, loading: true }));
    setLoading(true);

    const res = await request("products", "get");

    if (res && !res.errors) {
      setState((pre) => ({
        ...pre,
        list: (res.list || []).sort((a, b) => b.id - a.id),
        total: (res.list || []).length,
        loading: false,
      }));
    } else {
      setState((pre) => ({ ...pre, loading: false }));
      if (res?.errors?.message) {
        message.error(res.errors.message);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <Spin
      spinning={state.loading}
      style={{
        width: "100%",
        marginTop: "200px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div>
        <Row gutter={16}>
          {state.list?.map((item, index) => (
            <Col xs={24} md={8} lg={6} key={index}>
              <ProductCard {...item} onAddToCart={() => onAddCart(item)} />
            </Col>
          ))}
        </Row>
      </div>
    </Spin>
  );
};
