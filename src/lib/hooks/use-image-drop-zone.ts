"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

export function firstImageFileFromDataTransfer(dt: DataTransfer): File | null {
  if (dt.items?.length) {
    for (let i = 0; i < dt.items.length; i++) {
      const item = dt.items[i];
      if (item.kind === "file") {
        const f = item.getAsFile();
        if (f?.type.startsWith("image/")) return f;
      }
    }
  }
  for (let i = 0; i < dt.files.length; i++) {
    const f = dt.files[i];
    if (f?.type.startsWith("image/")) return f;
  }
  return null;
}

export function useImageDropZone(onImageFile: (file: File) => void) {
  const depth = useRef(0);
  const [active, setActive] = useState(false);

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    depth.current += 1;
    setActive(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setActive(false);
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      depth.current = 0;
      setActive(false);
      const f = firstImageFileFromDataTransfer(e.dataTransfer);
      if (f) onImageFile(f);
    },
    [onImageFile]
  );

  return {
    active,
    handlers: { onDragEnter, onDragLeave, onDragOver, onDrop },
  };
}
