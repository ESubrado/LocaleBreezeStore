"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type MotionRevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  margin?: string;
};

export default function MotionReveal({
  children,
  delay = 0,
  margin = "-80px",
  ...props
}: MotionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration: 0.7, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
