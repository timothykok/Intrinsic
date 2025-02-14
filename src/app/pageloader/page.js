'use client'

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export default function Preloader({ onComplete }) {
  const preloaderRef = useRef(null);
  const characterRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Simulate asset loading
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 3000); // Replace with your actual loading logic
    return () => clearTimeout(timer);
  }, []);

  // Make character follow the cursor smoothly
  useEffect(() => {
    const xTo = gsap.quickTo(characterRef.current, "x", { duration: 0.3, ease: "power2.out" });
    const yTo = gsap.quickTo(characterRef.current, "y", { duration: 0.3, ease: "power2.out" });

    const handleMouseMove = (e) => {
      const rect = characterRef.current.getBoundingClientRect();

      // Calculate the center of the character
      const characterCenterX = rect.left + rect.width / 2;
      const characterCenterY = rect.top + rect.height / 2;

      // Calculate the distance between the cursor and the character's center
      const distanceX = e.clientX - characterCenterX;
      const distanceY = e.clientY - characterCenterY;

      // Adjust the character's position based on the distance
      // Use a scaling factor to control how close the character gets to the cursor
      const scalingFactor = 0.5; // Adjust this value (0 = no movement, 1 = directly on cursor)
      const offsetX = e.clientX - rect.width / 2 - distanceX * (1 - scalingFactor);
      const offsetY = e.clientY - rect.height / 2 - distanceY * (1 - scalingFactor);

      xTo(offsetX);
      yTo(offsetY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleClick = () => {
    // Only allow clicking if loading is complete
    if (!loaded) return;

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
    tl.to(characterRef.current, { scale: 5, duration: 1, ease: "power2.inOut" })
      .to(preloaderRef.current, { opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.5");
  };

  return (
    <div
      ref={preloaderRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#fff",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        ref={characterRef}
        src="/path-to-your-cartoon.png"  // Replace with your character asset
        alt="Animated Character"
        style={{
          width: 100,
          height: "auto",
          cursor: loaded ? "pointer" : "default",
          position: "absolute", // Ensure the character can move freely
        }}
        onClick={loaded ? handleClick : undefined}
      />
    </div>
  );
}