import { List } from "antd";
import { create } from "zustand";
import Image_product from "../assets/img/laptop_asus1.png";
import Imag1 from "../assets/img/1-img.jpg";
import Imag2 from "../assets/img/2-img.jpg";
import Imag3 from "../assets/img/3-img.jpg";
import Imag4 from "../assets/img/4-img.jpg";
import Imag5 from "../assets/img/5-img.jpg";
import Imag6 from "../assets/img/6-img.jpg";
import Imag7 from "../assets/img/7-img.jpg";
import Imag8 from "../assets/img/8-img.jpg";

export const ProductStore = create((set) => ({
  list: [
    {
      id: 1,
      name: "Macbook2021",
      des: "8G 1256SSD",
      price: 1900,
      image: Image_product,
      wislist: 0,
    },
    {
      id: 2,
      name: "Macbook 2022",
      des: "8G 1256SSD",
      price: 1200,
      image: Imag1,
      wislist: 1,
    },
    {
      id: 3,
      name: "Macbook 2023",
      des: "8G 1256SSD",
      price: 1400,
      image: Imag2,
      wislist: 0,
    },
    {
      id: 4,
      name: "Macbook 2024",
      des: "8G 1256SSD",
      price: 1500,
      image: Imag3,
      wislist: 0,
    },
    {
      id: 5,
      name: "Macbook 2020",
      des: "8G 1256SSD",
      price: 1600,
      image: Imag4,
      wislist: 0,
    },
    {
      id: 6,
      name: "Macbook 2019",
      des: "8G 1256SSD",
      price: 1000,
      image: Imag5,
      wislist: 0,
    },
    {
      id: 7,
      name: "Macbook 2018",
      des: "8G 1256SSD",
      price: 1100,
      image: Imag6,
      wislist: 1,
    },
    {
      id: 8,
      name: "Macbook 2018",
      des: "8G 1256SSD",
      price: 1100,
      image: Imag7,
      wislist: 0,
    },
  ],
  handlWislist: (param) => {
    set((pre) => {
      const IndexProduct = pre.list?.findIndex((item) => item.id === param.id);
      pre.list[IndexProduct].wislist = !param.wislist;
      return {
        list: pre.list,
      };
    });
  },
}));
