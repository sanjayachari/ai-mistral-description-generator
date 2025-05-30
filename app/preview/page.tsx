'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const PreviewPage = () => {
  const [descriptions, setDescriptions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Get the descriptions from localStorage
    const storedDescriptions = localStorage.getItem('generatedDescriptions');
    if (storedDescriptions) {
      setDescriptions(JSON.parse(storedDescriptions));
    } else {
      router.push('/'); // Redirect to home if no descriptions are found
    }
  }, [router]);

  return (
    <div className="preview-container">
      <h1 className="preview-title">Preview Tour Descriptions</h1>
      <div className="preview-list">
        {descriptions.map((item, index) => (
          <div key={index} className="preview-item">
            <div
              className="description-text"
              dangerouslySetInnerHTML={{ __html: item.description }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default PreviewPage;
