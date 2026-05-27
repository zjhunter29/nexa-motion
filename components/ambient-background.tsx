"use client";

import { motion } from "framer-motion";

export function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* Deep base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(168,85,247,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_100%,rgba(59,130,246,0.12),transparent_60%)]" />

      {/* Floating aurora blobs */}
      <motion.div
        className="aurora-blob bg-accent-purple/30"
        style={{ width: 520, height: 520, top: -120, left: -120 }}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, 40, -30, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="aurora-blob bg-accent-blue/25"
        style={{ width: 460, height: 460, bottom: -160, right: -100 }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="aurora-blob bg-accent-cyan/15"
        style={{ width: 320, height: 320, top: "40%", left: "30%" }}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Noise + vignette */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%22120%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%222%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_50%,transparent_40%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}
