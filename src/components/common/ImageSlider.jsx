// src/components/common/ImageSlider.jsx

import React, { useState, useEffect } from 'react';
// Animasyon kütüphanesi yoksa standart img kullanacağız (daha hafif ve garantili)

const ImageSlider = ({ images, interval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    // Yükseklik 'h-full' ve 'aspect-auto' ile esnek bırakıldı
    // Kenarlık (border) ve gölge (shadow) kapsayıcıda olduğu için burada temiz tutuldu
    <div className="w-full h-full relative overflow-hidden bg-white"> 
      
      {/* Resim */}
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        // ★ KRİTİK GÜNCELLEME:
        // p-0 (padding yok)
        // object-contain (resmin tamamını gösterir)
        // w-full h-full (kutuyu doldurur)
        className="w-full h-full object-contain transition-opacity duration-500"
      />

      {/* Alt Noktalar (Dots) */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-blue-600 w-4' : 'bg-gray-300 w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;