"use client"

import { AnimatePresence, motion, useAnimation } from "framer-motion"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react"
import { DollarSign } from "lucide-react"

import { cn } from "@/lib/utils"

type Product = {
  id: number
  name: string
  price: string
  score: number
  image: string
}

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Rayban Sunglasses",
    price: "$89.99",
    score: 91,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 2,
    name: "Airpods Pro",
    price: "$119.00",
    score: 89,
    image:
      "https://images.unsplash.com/photo-1656068566049-67e3c04fd4ce?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 3,
    name: "Acrylic Handmade Bracelet",
    price: "$74.99",
    score: 94,
    image:
      "https://images.unsplash.com/photo-1689397136362-dce64e557fcc?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 4,
    name: "JBL Bluetooth Speaker",
    price: "$49.50",
    score: 88,
    image:
      "https://images.unsplash.com/photo-1588131153911-a4ea5189fe19?q=80&w=1762&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 5,
    name: "Andoor Essential Backpack",
    price: "$129.90",
    score: 93,
    image:
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 6,
    name: "Automatic Soap Dispenser",
    price: "$2.80",
    score: 87,
    image:
      "https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 7,
    name: "Foot Massage Roller",
    price: "$1.25",
    score: 85,
    image:
      "https://images.unsplash.com/photo-1672330427989-7676be4a34bc?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 8,
    name: "Collapsible Water Bottle",
    price: "$1.60",
    score: 90,
    image:
      "https://images.unsplash.com/photo-1588959570984-9f1e0e9a91a6?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 9,
    name: "Multi-Angle Phone Stand",
    price: "$0.95",
    score: 83,
    image:
      "https://images.unsplash.com/photo-1738721796968-bc0c4a55960d?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 10,
    name: "Wireless Charging Pad",
    price: "$2.10",
    score: 86,
    image:
      "https://images.unsplash.com/photo-1562157705-52df57a5883b?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 11,
    name: "Kids LED Night Light",
    price: "$1.80",
    score: 82,
    image:
      "https://images.unsplash.com/photo-1598032895397-b9472444bf93?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 12,
    name: "Portable Blender Bottle",
    price: "$3.50",
    score: 92,
    image:
      "https://images.unsplash.com/photo-1691256676359-20e5c6d4bc92?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 13,
    name: "Car Scratch Remover Pen",
    price: "$0.70",
    score: 79,
    image:
      "https://images.unsplash.com/photo-1729146768776-8356708e907d?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 14,
    name: "Stretch Lid Set (6pcs)",
    price: "$1.20",
    score: 84,
    image:
      "https://images.unsplash.com/photo-1598443053960-0e8608b282fd?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 15,
    name: "Pet Water Dispenser",
    price: "$2.40",
    score: 88,
    image:
      "https://images.unsplash.com/photo-1570841398833-43e352b440ca?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 16,
    name: "Magnetic Lashes Kit",
    price: "$1.90",
    score: 77,
    image:
      "https://images.unsplash.com/photo-1664216294573-b28282de564b?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 17,
    name: "Silicone Sink Organizer",
    price: "$1.10",
    score: 81,
    image:
      "https://images.unsplash.com/photo-1489423561257-34e31d8836b2?q=80&w=1801&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 18,
    name: "Electric Lint Remover",
    price: "$2.30",
    score: 80,
    image:
      "https://images.unsplash.com/photo-1561808843-7adeb9606939?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 19,
    name: "Foldable Laptop Stand",
    price: "$2.80",
    score: 89,
    image:
      "https://images.unsplash.com/photo-1622818425825-1dcdb3a39c30?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: 20,
    name: "Reusable Food Storage Bags",
    price: "$0.85",
    score: 84,
    image:
      "https://images.unsplash.com/photo-1580130281320-0ef0754f2bf7?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
]

const keyProducts = sampleProducts.slice(0, 5)
const backgroundProducts = sampleProducts.slice(5)

type ContainerSize = { width: number; height: number }
type ProductMetadata = Pick<Product, "name" | "price" | "score">
type Edge = "top" | "bottom" | "left" | "right"

const edges: Edge[] = ["top", "bottom", "left", "right"]

function getRandomEdgePoint(size: ContainerSize, edge: Edge) {
  const margin = 100
  switch (edge) {
    case "top":
      return { x: Math.random() * size.width, y: -margin }
    case "bottom":
      return { x: Math.random() * size.width, y: size.height + margin }
    case "left":
      return { x: -margin, y: Math.random() * size.height }
    case "right":
      return { x: size.width + margin, y: Math.random() * size.height }
  }
}

function createCurvedPath(start: { x: number; y: number }, end: { x: number; y: number }) {
  const curveVariation = 30 + Math.random() * 60
  const midX = (start.x + end.x) / 2 + (Math.random() - 0.5) * curveVariation
  const midY = (start.y + end.y) / 2 + (Math.random() - 0.5) * curveVariation

  return [
    start,
    { x: midX, y: midY },
    end,
  ]
}

type AnimatedProductProps = {
  product: Product
  containerSize: ContainerSize
  isKeyProduct?: boolean
  onReachCenter?: (metadata: ProductMetadata) => void
  onComplete?: () => void
}

// Deterministic random function based on seed - rounded to 6 decimal places for consistency
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  const value = x - Math.floor(x)
  // Round to 6 decimal places to ensure server/client consistency
  return Math.round(value * 1000000) / 1000000
}

function AnimatedProduct({
  product,
  containerSize,
  isKeyProduct = false,
  onReachCenter,
  onComplete,
}: AnimatedProductProps) {
  const controls = useAnimation()
  
  // Use deterministic values based on product ID for SSR hydration
  // Round to 6 decimal places to ensure exact server/client match
  // Use useMemo to ensure values are computed once and consistently
  const initialValues = useMemo(() => {
    const seed = product.id
    const scale = Math.round((0.5 + seededRandom(seed) * 0.4) * 1000000) / 1000000
    const opacity = Math.round((0.6 + seededRandom(seed + 1000) * 0.4) * 1000000) / 1000000
    return { scale, opacity }
  }, [product.id])

  useEffect(() => {
    let isCancelled = false

    const animateProduct = async () => {
      if (isCancelled) return

      if (isKeyProduct) {
        const entryEdge = edges[Math.floor(Math.random() * edges.length)]
        const startPoint = getRandomEdgePoint(containerSize, entryEdge)
        const centerPoint = { x: containerSize.width / 2 - 40, y: containerSize.height / 2 - 40 }

        await controls.set({
          x: startPoint.x,
          y: startPoint.y,
          scale: 0.7,
          filter: "blur(4px)",
          opacity: 0.8,
        })

        await controls.start({
          x: centerPoint.x,
          y: centerPoint.y,
          scale: 1.8,
          filter: "blur(0px)",
          opacity: 1,
          transition: {
            duration: 3 + Math.random() * 2,
            ease: "easeInOut",
            type: "tween",
          },
        })

        if (isCancelled) return
        onReachCenter?.({
          name: product.name,
          price: product.price,
          score: product.score,
        })

        await new Promise((resolve) => setTimeout(resolve, 3000))
        if (isCancelled) return

        const exitEdge = edges[Math.floor(Math.random() * edges.length)]
        const exitPoint = getRandomEdgePoint(containerSize, exitEdge)

        await controls.start({
          x: exitPoint.x,
          y: exitPoint.y,
          scale: 0.7,
          filter: "blur(4px)",
          opacity: 0.5,
          transition: {
            duration: 2.5 + Math.random(),
            ease: "easeInOut",
            type: "tween",
          },
        })
      } else {
        const animateLoop = async () => {
          while (!isCancelled) {
            const entryEdge = edges[Math.floor(Math.random() * edges.length)]
            const exitEdge = edges[Math.floor(Math.random() * edges.length)]
            const startPoint = getRandomEdgePoint(containerSize, entryEdge)
            const endPoint = getRandomEdgePoint(containerSize, exitEdge)
            const path = createCurvedPath(startPoint, endPoint)

            await controls.set({
              x: startPoint.x,
              y: startPoint.y,
              scale: 0.5 + Math.random() * 0.4,
              filter: "blur(2px)",
              opacity: 0.6 + Math.random() * 0.4,
            })

            for (let i = 1; i < path.length; i += 1) {
              await controls.start({
                x: path[i].x,
                y: path[i].y,
                transition: {
                  duration: 2 + Math.random() * 2,
                  ease: "linear",
                  type: "tween",
                },
              })
            }

            await new Promise((resolve) => setTimeout(resolve, 120))
          }
        }

        await animateLoop()
      }

      if (!isCancelled && isKeyProduct) {
        onComplete?.()
      }
    }

    animateProduct()

    return () => {
      isCancelled = true
    }
  }, [containerSize, controls, isKeyProduct, onComplete, onReachCenter, product])

  return (
    <motion.div
      className="absolute h-16 w-16 md:h-20 md:w-20"
      animate={controls}
      initial={{
        scale: initialValues.scale,
        filter: "blur(2px)",
        opacity: initialValues.opacity,
      }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-lg border border-border/30 shadow-lg">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 64px, 80px"
          priority={isKeyProduct}
          quality={isKeyProduct ? 90 : 75}
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </motion.div>
  )
}

type CircularProgressProps = {
  value: number
  size?: number
  className?: string
}

function CircularProgress({ value, size = 32, className }: CircularProgressProps) {
  const percentage = Math.min(Math.max(value, 0), 100)

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full border-[2.5px]" style={{ borderColor: "hsl(var(--muted))" }} />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, hsl(142 76% 36%) 0deg ${percentage * 3.6}deg, transparent ${
            percentage * 3.6
          }deg 360deg)`,
          mask: `radial-gradient(circle at center, transparent ${size / 2 - 3}px, black ${size / 2 - 2}px)`,
          WebkitMask: `radial-gradient(circle at center, transparent ${size / 2 - 3}px, black ${size / 2 - 2}px)`,
        }}
      />
      <span className="relative z-10 text-xs font-bold text-green-600">{value}</span>
    </div>
  )
}

type MetadataDisplayProps = {
  metadata: ProductMetadata
}

const MetadataDisplay = memo(function MetadataDisplay({ metadata }: MetadataDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      style={{ willChange: "transform, opacity" }}
    >
      <div className="relative h-20 w-20 md:h-24 md:w-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: 18 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 rounded-lg border border-gray-200/40 bg-white/95 p-2.5 shadow-lg backdrop-blur"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: "#0A4DFF" }}>
              <DollarSign className="h-3 w-3 text-white" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500">Price</div>
              <div className="text-sm font-bold text-gray-900">{metadata.price}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: -18 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 rounded-lg border border-indigo-200/40 bg-gradient-to-br from-indigo-50 to-blue-50 p-3 shadow-lg backdrop-blur"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "#0A4DFF" }}>
              <span className="text-xs font-bold text-white">$</span>
            </div>
            <div>
              <div className="text-xs font-medium" style={{ color: "#0A4DFF" }}>Pay with</div>
              <div className="text-sm font-bold" style={{ color: "#0A4DFF" }}>Celo/USDC</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full rounded-lg border border-gray-200/40 bg-white/95 p-3 text-center shadow-lg backdrop-blur"
        >
          <span className="text-sm font-semibold text-gray-900">{metadata.name}</span>
        </motion.div>
      </div>
    </motion.div>
  )
})

export function ProductSpotlight() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState<ContainerSize>({ width: 800, height: 600 })
  const [currentMetadata, setCurrentMetadata] = useState<ProductMetadata | null>(null)
  const [keyProductIndex, setKeyProductIndex] = useState(0)
  const [isKeyProductAnimating, setIsKeyProductAnimating] = useState(true)

  const backgroundInstances = useMemo(
    () =>
      Array.from({ length: 15 }, (_, idx) => ({
        id: `bg-${idx}`,
        product: backgroundProducts[idx % backgroundProducts.length],
      })),
    [],
  )

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null

    const updateSize = () => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          setContainerSize({ width: rect.width, height: rect.height })
        }
      }, 120)
    }

    updateSize()
    window.addEventListener("resize", updateSize)

    return () => {
      window.removeEventListener("resize", updateSize)
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  const handleKeyProductComplete = useCallback(() => {
    setIsKeyProductAnimating(false)
    setTimeout(() => {
      setKeyProductIndex((prev) => (prev + 1) % keyProducts.length)
      setIsKeyProductAnimating(true)
    }, 100)
  }, [])

  const handleProductReachCenter = useCallback((metadata: ProductMetadata) => {
    setCurrentMetadata(metadata)
    setTimeout(() => setCurrentMetadata(null), 3000)
  }, [])

  return (
    <section className="relative min-h-[70vh] overflow-hidden py-16">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col-reverse items-center gap-12 px-6 lg:flex-row lg:items-center lg:gap-16">
        <motion.div
          className="w-full max-w-xl space-y-6 text-center lg:text-left"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Buy Anything, Pay in Crypto
            </h2>
            <p className="text-base text-slate-600 md:text-lg">
            From fashion to gadgets — shop your favorites instantly with CELO or USDC, powered by Mizu Pay.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="relative w-full lg:w-1/2"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <div
            ref={containerRef}
            className="relative h-[420px] overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-lg md:h-[520px] lg:h-[560px]"
          >
            {backgroundInstances.map((item) => (
              <AnimatedProduct key={item.id} product={item.product} containerSize={containerSize} />
            ))}

            {isKeyProductAnimating && (
              <AnimatedProduct
                key={`key-${keyProducts[keyProductIndex].id}-${keyProductIndex}`}
                product={keyProducts[keyProductIndex]}
                containerSize={containerSize}
                isKeyProduct
                onReachCenter={handleProductReachCenter}
                onComplete={handleKeyProductComplete}
              />
            )}

            <AnimatePresence mode="wait">{currentMetadata && <MetadataDisplay metadata={currentMetadata} />}</AnimatePresence>

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/20" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

