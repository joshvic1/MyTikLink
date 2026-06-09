"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import StoreSetupModal from "./onboarding/StoreSetupModal";
import StoreDashboard from "./dashboard/StoreDashboard";

import { getMyStore } from "../../services/storeService";

import styles from "./styles/storefront.module.css";

import AddProductButton from "./dashboard/AddProductButton";

import AddProductModal from "./products/AddProductModal";
export default function Storefront() {
  const [loading, setLoading] = useState(true);

  const [store, setStore] = useState(null);

  const [showSetup, setShowSetup] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [token, setToken] = useState(null);
  const [openProduct, setOpenProduct] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    // NO TOKEN
    if (!savedToken) {
      window.location.href = "/?auth=login";

      return;
    }

    setToken(savedToken);

    loadStore(savedToken);
    loadUser(savedToken);
  }, []);

  const loadStore = async (token) => {
    try {
      const data = await getMyStore(token);

      if (data) {
        setStore(data);

        setShowSetup(false);
      } else {
        setShowSetup(true);
      }
    } catch (err) {
      console.log(err);

      // NO INTERNET / NETWORK FAILURE
      if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        alert("No internet connection. Please check your network.");

        return;
      }

      // TOKEN INVALID
      if (err.response?.status === 401) {
        localStorage.removeItem("token");

        window.location.href = "/?auth=login";

        return;
      }

      // STORE DOES NOT EXIST
      if (err.response?.status === 404) {
        setShowSetup(true);

        return;
      }

      // OTHER SERVER ERRORS
      alert("Failed to load store");
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async (token) => {
    try {
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

  const handleCompleteSetup = (store) => {
    setStore(store);

    setShowSetup(false);
  };
  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.dotLoader}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSetup && (
        <StoreSetupModal
          token={token}
          user={user}
          onComplete={handleCompleteSetup}
        />
      )}

      {store && <StoreDashboard store={store} />}

      <AddProductModal
        open={openProduct}
        onClose={() => setOpenProduct(false)}
      />
    </>
  );
}
