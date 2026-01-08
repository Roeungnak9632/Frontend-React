import React, { useState } from "react";
import { LiaBoxesSolid } from "react-icons/lia";
import { Button, Image, Row, Tooltip } from "antd";
import { IoCartOutline } from "react-icons/io5";
import { ProductStore } from "../../store/ProductStore";
import config from "../../util/config";

export const ProductCard = ({
  prd_name,
  price,
  description,
  quantity,
  image,
  onAddToCart,
  wislist,
  id,
}) => {
  const { handlWislist } = ProductStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const onWishlist = () => {
    handlWislist({ id, wislist });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const maxLength = 100;
  const displayText = isExpanded
    ? description
    : description.length > maxLength
    ? description.substring(0, maxLength) + ""
    : description;

  const formattedPrice = parseFloat(price || 0).toFixed(2);

  return (
    <div
      style={{
        width: "100%",
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 6,
        marginBottom: 12,
        boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
        height: 435,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 230,
          backgroundColor: "white",
          borderRadius: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 12,
          overflow: "hidden",
        }}
      >
        <Image
          src={
            image
              ? config.image_path + image
              : "https://via.placeholder.com/200?text=No+Image"
          }
          alt={prd_name}
          preview={true}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <div
        style={{
          marginTop: 20,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Row
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1, paddingRight: 8 }}>
            <h3
              style={{
                fontWeight: 600,
                marginBottom: 6,
                fontSize: "1rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {prd_name}
            </h3>
          </div>
          <Tooltip title={`Stock: ${quantity}`}>
            <div
              className="flex items-center"
              style={{
                whiteSpace: "nowrap",
                color: quantity > 0 ? "#52c41a" : "#ff4d4f",
              }}
            >
              <LiaBoxesSolid size={16} style={{ marginRight: 4 }} />
              {quantity}
            </div>
          </Tooltip>
        </Row>

        <div style={{ marginTop: 8, flex: 1 }}>
          <p
            style={{
              fontSize: "0.84rem",
              color: "#666",
              lineHeight: 1.5,

              cursor: description.length > maxLength ? "pointer" : "default",
            }}
            onClick={description.length > maxLength ? toggleExpand : undefined}
          >
            {displayText}
            {description.length > maxLength && (
              <span
                style={{
                  marginLeft: 4,
                }}
              >
                {isExpanded ? " Read Less" : " Read More"}
              </span>
            )}
          </p>
        </div>

        <p
          style={{
            marginTop: 12,
            fontWeight: 600,
            color: "green",
            fontSize: "1rem",
          }}
        >
          ${formattedPrice}
        </p>

        <div style={{ textAlign: "center", marginTop: "auto" }}>
          <Button
            type="primary"
            onClick={onAddToCart}
            className="w-full"
            style={{
              marginTop: 10,
              fontWeight: 500,
            }}
            icon={<IoCartOutline size={18} style={{ marginRight: 2 }} />}
            disabled={quantity <= 0}
          >
            {quantity > 0 ? "Add to cart" : "Out of stock"}
          </Button>
        </div>
      </div>
    </div>
  );
};
