const VISION_API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;

export const performOcr = async (base64Image) => {
  if (!VISION_API_KEY) {
    console.warn("Vision API Key is missing. Returning dummy data.");
    return { price: '298', capacity: '500' };
  }

  const url = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;
  const body = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: 'TEXT_DETECTION' }]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    const text = data.responses[0]?.fullTextAnnotation?.text || "";
    
    return extractNumbers(text);
  } catch (error) {
    console.error("OCR failed:", error);
    return { price: null, capacity: null };
  }
};

const extractNumbers = (text) => {
  console.log("Extracted text:", text);
  
  // 正規表現で「〇〇円」「〇〇g」「〇〇ml」などを探す
  // 値段の抽出（例：298円、￥298、298 (円)）
  const priceMatch = text.match(/(\d{1,6})\s*[円￥]|(?:￥|¥)\s*(\d{1,6})/);
  const price = priceMatch ? (priceMatch[1] || priceMatch[2]) : null;

  // 容量の抽出（例：500g、500ml、500 ml、500 グラム）
  const capacityMatch = text.match(/(\d{1,5})\s*(?:g|ml|グラム|ミリリットル|枚|個|本)/i);
  const capacity = capacityMatch ? capacityMatch[1] : null;

  return { price, capacity };
};
