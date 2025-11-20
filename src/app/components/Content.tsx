"use client";

import Image from "next/image";

export default function Content() {

  return (
    <section className="w-full flex flex-col items-center justify-center px-4 md:px-16 lg:px-20 mt-12">
      {/* Hero */}
      <div
        id="home"
        className="max-w-7xl w-full flex flex-col items-start text-left"
      >
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          See Your Time, <br /> Feel The Change
        </h1>

        {/* HeroImg */}
        <div className="relative w-full mt-8 overflow-visible">
          <div className="rounded-xl overflow-hidden shadow-md">
            <Image
              src="/img/landing-page/hero.jpg"
              alt="Kinote Hero"
              width={1200}
              height={600}
              className="object-cover w-full h-[350px] md:h-[350px]"
              priority
            />

            {/* TextBtn */}
            <div className="absolute top-10 left-10 max-w-sm text-left pointer-events-auto">
              <p className="text-white text-sm md:text-base leading-relaxed mb-4">
                Kinote helps you organize tasks, track activities, and
                understand your progress all in one clear space.
              </p>
              <button className="border border-white text-white font-medium px-5 py-2.5 rounded-md hover:bg-white hover:text-gray-900 transition">
                See Features
              </button>
            </div>
          </div>

          {/* Strip */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 w-[85%] bg-white rounded-lg shadow-[0_4px_32px_rgba(0,0,0,0.12)] flex flex-col md:flex-row justify-between items-start md:items-center px-8 py-5 gap-6">
            {[
              {
                title: "Focus",
                desc: "Maintain concentration, without distractions.",
              },
              {
                title: "Productive",
                desc: "Accomplish more with ease.",
              },
              {
                title: "Reminders",
                desc: "Always remember important things on time.",
              },
            ].map((item) => (
              <div key={item.title} className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-32 md:h-40" />

      {/* Feature */}
      <div id="feature" className="max-w-7xl w-full text-center mt-24 mb-48">
        {/* Head */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Kinote Main Features
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto mb-12">
          Manage tasks, monitor activities, and boost your productivity with
          Kinote&apos;s best features.
        </p>

        {/* Cards - Mobile/Tablet: 1 col | Desktop: 3 col */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 place-items-center px-4 lg:px-0">
          {[
            {
              img: "/img/landing-page/feature_1.jpg",
              title: "To-Do List",
              desc: "Organize and manage every task with ease. Set priorities, add reminders, and reach your daily goals.",
            },
            {
              img: "/img/landing-page/feature_2.jpg",
              title: "AI",
              desc: "Discover your potential more deeply. Kinote AI helps you understand activity patterns and get improvement suggestions.",
            },
            {
              img: "/img/landing-page/feature_3.png",
              title: "Calendar",
              desc: "Manage and view your scheduled activities in a neat weekly calendar view.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="relative w-full lg:w-[380px] group"
            >
              {/* Img */}
              <div className="rounded-xl overflow-hidden shadow-md">
                <Image
                  src={item.img}
                  alt={item.title}
                  width={400}
                  height={250}
                  className="object-cover w-full h-56 transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Box - static on all views for hydration safety */}
              <div className="relative lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:z-10 bg-white rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.1)] w-full lg:w-[85%] px-6 py-4 lg:py-3 overflow-hidden flex flex-col items-start justify-start h-auto transition-all duration-500 ease-in-out" style={{ top: "unset" }}>
                <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm mt-2 mb-2 text-left transition-all duration-500 ease-in-out delay-100">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
