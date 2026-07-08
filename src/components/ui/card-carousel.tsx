"use client"

import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

interface CarouselProps {
  items: React.ReactNode[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
}

export const CardCarousel: React.FC<CarouselProps> = ({
  items,
  autoplayDelay = 2500,
  showPagination = true,
  showNavigation = false,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
    padding-top: 20px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 340px;
    /* height: 300px; */
    /* margin: 20px; */
  }
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background: none;
  }
  
  @media (min-width: 1024px) {
    .swiper-slide {
      width: 380px;
    }
  }
  `
  return (
    <div className="w-full relative">
      <style>{css}</style>
      <Swiper
        spaceBetween={50}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
        }}
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        slidesPerView={"auto"}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
        }}
        pagination={showPagination ? { clickable: true } : false}
        navigation={
          showNavigation
            ? {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              }
            : undefined
        }
        modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
      >
        {items.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="w-full h-full">
              {item}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
