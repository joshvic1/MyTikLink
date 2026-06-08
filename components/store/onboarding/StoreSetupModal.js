"use client";

import { useState } from "react";

import styles from "../styles/storeSetupModal.module.css";

import StoreWelcome from "./StoreWelcome";

import StoreStepIndicator from "./StoreStepIndicator";

import BusinessStep from "./steps/BusinessStep";
import PaymentStep from "./steps/PaymentStep";
import DesignStep from "./steps/DesignStep";

import { createStore, updateStore } from "@/services/storeService";

export default function StoreSetupModal({ token, onComplete }) {
  const [started, setStarted] = useState(false);

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",

    businessType: "physical",

    category: "",

    paymentMethod: "bank",

    bankName: "",
    phone: "",
    accountNumber: "",

    accountName: "",
    templateId: "",
    theme: "default",
  });

  const update = (data) => {
    setForm((prev) => ({
      ...prev,
      ...data,
    }));

    setErrors((prev) => {
      const updated = { ...prev };

      Object.keys(data).forEach((key) => {
        if (String(data[key]).trim()) {
          delete updated[key];
        }
      });

      return updated;
    });
  };

  const next = () => {
    // STEP 1
    if (step === 1) {
      const valid = validateStepOne();

      if (!valid) return;
    }

    // STEP 2
    if (step === 2) {
      const valid = validateStepTwo();

      if (!valid) return;
    }

    setStep((p) => p + 1);
  };

  const back = () => setStep((p) => p - 1);
  const validateStepOne = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Store name is required";
    }

    if (!form.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!form.category?.trim()) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateStepTwo = () => {
    const newErrors = {};

    // BANK NAME
    if (!form.bankName?.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    // ACCOUNT NUMBER
    if (!form.accountNumber?.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d+$/.test(form.accountNumber)) {
      newErrors.accountNumber = "Account number must contain only numbers";
    } else if (form.accountNumber.length < 10) {
      newErrors.accountNumber = "Account number must be at least 10 digits";
    }

    // ACCOUNT NAME
    if (!form.accountName?.trim()) {
      newErrors.accountName = "Account name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleFinish = async () => {
    try {
      setLoading(true);

      const store = await createStore(
        {
          name: form.name,

          businessType: form.businessType,

          category: form.category,
          phone: form.phone,
          templateId: form.templateId,
        },
        token,
      );

      await updateStore(
        store._id,
        {
          paymentMethod: form.paymentMethod,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountName: form.accountName,
          theme: form.theme,
          templateId: form.templateId,
          onboardingCompleted: true,
        },
        token,
      );

      onComplete(store);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      {!started ? (
        <StoreWelcome onStart={() => setStarted(true)} />
      ) : (
        <div className={styles.modal}>
          {/* FIXED HEADER */}
          <div className={styles.top}>
            <StoreStepIndicator step={step} />
          </div>

          {/* SCROLLABLE BODY */}
          <div className={styles.body}>
            {step === 1 && (
              <BusinessStep
                form={form}
                update={update}
                next={next}
                errors={errors}
              />
            )}

            {step === 2 && (
              <PaymentStep
                form={form}
                update={update}
                next={next}
                back={back}
                errors={errors}
              />
            )}

            {step === 3 && (
              <DesignStep
                form={form}
                update={update}
                back={back}
                finish={handleFinish}
                loading={loading}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
