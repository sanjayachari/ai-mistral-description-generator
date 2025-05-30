"use client";

import { useEffect, useState } from "react";

export default function TourDescription() {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDescription = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/mistral");
        const data = await res.json();
        console.log('data',data)
        if (res.ok && data?.fullDescription) {
          const DOMPurify = (await import("dompurify")).default;
          const sanitized = DOMPurify.sanitize(data.fullDescription);
          setHtmlContent(sanitized);
        } else {
          throw new Error(data?.error || "Failed to fetch description");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDescription();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div
      className="prose max-w-4xl mx-auto p-4"
      dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
    />
  );
}
