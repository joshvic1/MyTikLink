"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Success() {
  const [link, setLink] = useState("");

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("reference");

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/course/verify?reference=${ref}`)
      .then((res) => {
        setLink(res.data.link);
        if (window.ttq) {
          window.ttq.track("Purchase");
        }
      });
  }, []);

  return (
    <div>
      <h1>Payment Successful 🎉</h1>
      <p>Access your course:</p>
      <a href={link}>{link}</a>
    </div>
  );
}
