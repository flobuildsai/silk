import type { Metadata } from "next";
import { MotionShowcase } from "./showcase";

export const metadata: Metadata = {
  title: "Silk — motion primitives",
  description:
    "Reference for the motion layer the generator composes from. Editorial defaults, reduced-motion safe.",
};

export default function MotionPage() {
  return <MotionShowcase />;
}
