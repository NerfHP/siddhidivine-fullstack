import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Button from "./shared/Button"; // Using your existing Button component

// TypeScript interfaces for our data
interface SquareData {
  id: number;
  src: string;
}

// Helper function to shuffle the array
const shuffle = (array: SquareData[]): SquareData[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// Placeholder image data - replace with your own images
const squareData: SquareData[] = [
  { id: 1, src: "/images/hero-grid/1.png" }, { id: 2, src: "/images/hero-grid/2.png" },
  { id: 3, src: "/images/hero-grid/3.png" }, { id: 4, src: "/images/hero-grid/4.png" },
  { id: 5, src: "/images/hero-grid/5.png" }, { id: 6, src: "/images/hero-grid/6.png" },
  { id: 7, src: "/images/hero-grid/7.png" }, { id: 8, src: "/images/hero-grid/8.png" },
  { id: 9, src: "/images/hero-grid/9.png" }, { id: 10, src: "/images/hero-grid/10.png" },
  { id: 11, src: "/images/hero-grid/11.png" }, { id: 12, src: "/images/hero-grid/12.png" },
  { id: 13, src: "/images/hero-grid/13.png" }, { id: 14, src: "/images/hero-grid/14.png" },
  { id: 15, src: "/images/hero-grid/15.png" }, { id: 16, src: "/images/hero-grid/16.png" },
];

const generateSquares = () => {
  return shuffle(squareData).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
      }}
    ></motion.div>
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef<number | null>(null);
  const [squares, setSquares] = useState(generateSquares());

  useEffect(() => {
    const shuffleSquares = () => {
      setSquares(generateSquares());
      timeoutRef.current = setTimeout(shuffleSquares, 3000);
    };
    shuffleSquares();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-[450px] gap-1">
      {squares.map((sq) => sq)}
    </div>
  );
};

export default function ShuffleHero() {
  return (
    <section className="w-full px-8 py-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8 max-w-7xl mx-auto">
      <div>
        <span className="block mb-4 text-xs md:text-sm text-primary font-medium">
          Embrace Your Spiritual Path
        </span>
        <h3 className="text-4xl md:text-6xl font-sans font-semibold text-text-main">
          Authentic Spiritual Treasures
        </h3>
        <p className="text-base md:text-lg text-gray-600 my-4 md:my-6">
          Discover certified Rudraksha, Healing gemstones, and sacred items to enrich your spiritual life and find inner peace.
        </p>
        <Button to="/products" size="lg">Explore Products</Button>
      </div>
      <ShuffleGrid />
    </section>
  );
};