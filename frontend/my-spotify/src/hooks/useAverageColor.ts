"use client";

import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

export function useAverageColor(imageUrl?: string) {
  const [color, setColor] = useState("#303030");

  useEffect(() => {
    if (!imageUrl) return;

    const fac = new FastAverageColor();

    fac
      .getColorAsync(imageUrl)
      .then((result) => {
        setColor(result.hex);
      })
      .catch(() => {
        setColor("#303030");
      });

    return () => fac.destroy();
  }, [imageUrl]);

  return color;
}