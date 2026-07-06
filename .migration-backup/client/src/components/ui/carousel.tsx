"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CarouselProps = React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
}

type CarouselContextProps = {
  canScrollNext: boolean
  canScrollPrev: boolean
  orientation: "horizontal" | "vertical"
  scrollNext: () => void
  scrollPrev: () => void
  viewportRef: React.RefObject<HTMLDivElement | null>
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  className,
  children,
  ...props
}: CarouselProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const updateScrollState = React.useCallback(() => {
    const viewport = viewportRef.current

    if (!viewport) {
      setCanScrollPrev(false)
      setCanScrollNext(false)
      return
    }

    const scrollPosition =
      orientation === "horizontal" ? viewport.scrollLeft : viewport.scrollTop
    const scrollSize =
      orientation === "horizontal" ? viewport.scrollWidth : viewport.scrollHeight
    const clientSize =
      orientation === "horizontal" ? viewport.clientWidth : viewport.clientHeight
    const maxScroll = scrollSize - clientSize

    setCanScrollPrev(scrollPosition > 1)
    setCanScrollNext(scrollPosition < maxScroll - 1)
  }, [orientation])

  const scrollByItem = React.useCallback(
    (direction: "previous" | "next") => {
      const viewport = viewportRef.current

      if (!viewport) {
        return
      }

      const item = viewport.querySelector<HTMLElement>(
        "[data-slot='carousel-item']"
      )
      const itemSize =
        orientation === "horizontal"
          ? item?.getBoundingClientRect().width
          : item?.getBoundingClientRect().height
      const fallbackSize =
        orientation === "horizontal" ? viewport.clientWidth : viewport.clientHeight
      const distance = itemSize || fallbackSize
      const amount = direction === "next" ? distance : -distance

      viewport.scrollBy({
        behavior: "smooth",
        left: orientation === "horizontal" ? amount : 0,
        top: orientation === "vertical" ? amount : 0,
      })
    },
    [orientation]
  )

  const scrollPrev = React.useCallback(() => {
    scrollByItem("previous")
  }, [scrollByItem])

  const scrollNext = React.useCallback(() => {
    scrollByItem("next")
  }, [scrollByItem])

  React.useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) {
      return
    }

    updateScrollState()

    const handleUpdate = () => updateScrollState()
    viewport.addEventListener("scroll", handleUpdate, { passive: true })
    window.addEventListener("resize", handleUpdate)

    let observer: ResizeObserver | undefined

    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(handleUpdate)
      observer.observe(viewport)

      if (viewport.firstElementChild) {
        observer.observe(viewport.firstElementChild)
      }
    }

    return () => {
      viewport.removeEventListener("scroll", handleUpdate)
      window.removeEventListener("resize", handleUpdate)
      observer?.disconnect()
    }
  }, [updateScrollState])

  const contextValue = React.useMemo<CarouselContextProps>(
    () => ({
      canScrollNext,
      canScrollPrev,
      orientation,
      scrollNext,
      scrollPrev,
      viewportRef,
    }),
    [canScrollNext, canScrollPrev, orientation, scrollNext, scrollPrev]
  )

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        data-slot="carousel"
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation, viewportRef } = useCarousel()

  return (
    <div
      data-slot="carousel-viewport"
      ref={viewportRef}
      tabIndex={0}
      className={cn(
        "overflow-auto scroll-smooth focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        orientation === "horizontal"
          ? "snap-x snap-mandatory overflow-y-hidden"
          : "snap-y snap-mandatory overflow-x-hidden"
      )}
    >
      <div
        data-slot="carousel-content"
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  onClick,
  disabled,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { canScrollPrev, orientation, scrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={disabled || !canScrollPrev}
      onClick={(event) => {
        onClick?.(event)

        if (!event.defaultPrevented) {
          scrollPrev()
        }
      }}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  onClick,
  disabled,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { canScrollNext, orientation, scrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={disabled || !canScrollNext}
      onClick={(event) => {
        onClick?.(event)

        if (!event.defaultPrevented) {
          scrollNext()
        }
      }}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
}
