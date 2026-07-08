import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export const DraggableCardContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className || ""}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            containerRef,
          });
        }
        return child;
      })}
    </div>
  );
};

export const DraggableCardBody = ({
  children,
  className,
  containerRef,
}: {
  children: React.ReactNode;
  className?: string;
  containerRef?: React.RefObject<HTMLDivElement>;
}) => {
  const [zIndex, setZIndex] = useState(1);

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragElastic={0.2}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      whileHover={{ cursor: "grab" }}
      onDragStart={() => {
        // Bring to front on drag
        setZIndex((prev) => prev + 10);
      }}
      className={`absolute touch-none select-none ${className || ""}`}
      style={{ zIndex }}
    >
      {children}
    </motion.div>
  );
};
