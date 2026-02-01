"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Head of Science Department",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    content:
      "TelsEvents has revolutionized how we organize and participate in academic conferences. The platform is intuitive, and the QR code system makes check-ins seamless.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "High School Student",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    content:
      "Participating in the Science Fair through this platform was amazing! The registration process was smooth, and I loved how I could track everything in real-time.",
  },
  {
    id: 3,
    name: "Prof. Emily Rodriguez",
    role: "Computer Science, Stanford",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    content:
      "As an event organizer, I appreciate the comprehensive dashboard and analytics. Managing participants and generating reports has never been easier.",
  },
  {
    id: 4,
    name: "Alex Thompson",
    role: "Parent & Event Attendee",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    content:
      "The mobile-first design made it so easy to register my daughter for multiple events. The countdown timers and notifications kept us well-informed.",
  },
  {
    id: 5,
    name: "Dr. James Wilson",
    role: "Research Director, NASA",
    avatar: "/placeholder.svg?height=60&width=60",
    rating: 5,
    content:
      "The quality of events and the caliber of participants on this platform is exceptional. It's become our go-to for educational conferences.",
  },
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-3xl mx-auto">
                <CardContent className="p-8 text-center">
                  <Quote className="h-12 w-12 text-orange-400 mx-auto mb-6 opacity-50" />

                  <p className="text-lg text-gray-300 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>

                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-orange-400">
                      <AvatarImage
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-orange-500 text-white font-bold">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-semibold text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-orange-400 scale-125"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevTestimonial}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
      >
        ←
      </button>
      <button
        onClick={nextTestimonial}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
      >
        →
      </button>
    </div>
  );
}
