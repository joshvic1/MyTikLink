"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import styles from "../styles/dashboard.module.css";
import AddProductModal from "../products/AddProductModal";
import DashboardHeader from "./DashboardHeader";
import StoreStats from "../dashboard/StoreStats";
import DashboardQuickActions from "./DashboardQuickActions";
import DashboardHero from "./DashboardHero";
import RecentProducts from "./RecentProducts";
import StoreMenu from "./StoreMenu";
import BottomNav from "./BottomNav";
import FirstProductPrompt from "./FirstProductPrompt";
import StoreLinkPrompt from "./StoreLinkPrompt";

export default function StoreDashboard({ store }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [range, setRange] = useState("7d");
  const [openProduct, setOpenProduct] = useState(false);
  const [user, setUser] = useState(null);
  const [productCount, setProductCount] = useState(0);
  if (!store) return null;
  useEffect(() => {
    fetchUser();
    fetchProductCount();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/plan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchProductCount = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/products/me?page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProductCount(res.data.total || res.data.products?.length || 0);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <StoreMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        store={store}
      />

      <div className={styles.wrapper}>
        <DashboardHeader
          store={store}
          user={user}
          onMenu={() => setMenuOpen(true)}
        />
        <DashboardHero
          store={store}
          user={user}
          range={range}
          setRange={setRange}
        />
        <FirstProductPrompt
          productCount={productCount}
          onCreate={() => setOpenProduct(true)}
        />
        <StoreLinkPrompt slug={store?.slug} />
        <StoreStats range={range} />
        <RecentProducts />
        <DashboardQuickActions onAddProduct={() => setOpenProduct(true)} />{" "}
      </div>
      <AddProductModal
        open={openProduct}
        onClose={() => setOpenProduct(false)}
      />
      <BottomNav onAddProduct={() => setOpenProduct(true)} />
    </>
  );
}
