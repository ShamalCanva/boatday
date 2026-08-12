"use client";

import { useState } from "react";
import Image from "next/image";
import { CarIcon, BusIcon, ParkingIcon } from "./icons";

const OPTIONS = [
  {
    id: "rideshare",
    label: "Uber",
    Icon: CarIcon,
    body: (
      <>
        <p>Set your drop-off to Peppercorn Reserve, Drummoyne.</p>
        <p className="mt-3">
          Walk through the reserve towards the water. At the far end, carefully take the
          stairs down to the Corleone Marina gate. I&rsquo;ll meet you through the gate.
        </p>
      </>
    ),
  },
  {
    id: "bus",
    label: "Bus",
    Icon: BusIcon,
    body: (
      <>
        <p>Catch a bus to Victoria Road before Day Street, Drummoyne.</p>
        <p className="mt-3">
          From the stop, walk down Day Street towards Peppercorn Reserve. Enter the
          reserve and walk through it towards the water. At the far end, carefully take
          the stairs down to the marina.
        </p>
        <p className="mt-3 text-white/75">
          The stairs are uneven and can be slippery, especially when wet.
        </p>
        <p className="mt-3">
          At the bottom, you&rsquo;ll see the gate marked Corleone Marina. Go through the
          gate and I&rsquo;ll meet you there.
        </p>
        <a
          href="https://transportnsw.info/trip"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-[14px] font-medium underline text-white"
        >
          Plan your trip with Transport for NSW
        </a>
      </>
    ),
  },
  {
    id: "driving",
    label: "Driving",
    Icon: ParkingIcon,
    body: (
      <>
        <p>
          Try for street parking first. Most nearby spaces are 2P, although there are a
          few all-day spots if you get lucky.
        </p>
        <p className="mt-3">
          The easy backup is Birkenhead Point Brand Outlet parking at 19 Roseby Street.
          It has more than 1,300 spaces and is roughly a five-minute walk to the marina
          entrance.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/15">
          <Image
            src="/maps/birkenhead-parking-route.jpg"
            alt="Illustrated walking route from Birkenhead Point parking to the Corleone Marina gate"
            width={928}
            height={1694}
            className="h-auto w-full"
          />
        </div>
        <dl className="mt-4 space-y-1.5 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-white/75">First 3 hours</dt>
            <dd className="font-semibold">Free</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/75">Up to 4 hours</dt>
            <dd className="font-semibold">~$10</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/75">Up to 5 hours</dt>
            <dd className="font-semibold">~$15</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/75">Longer stays</dt>
            <dd className="font-semibold">Allow up to $40</dd>
          </div>
        </dl>
        <p className="mt-3 text-white/75">
          Avoid relying on parking inside the marina — it can be awkward getting in and
          out.
        </p>
      </>
    ),
  },
];

export default function TransportTabs() {
  const [active, setActive] = useState(OPTIONS[0].id);
  const current = OPTIONS.find((o) => o.id === active)!;

  return (
    <div className="rounded-card border border-white/15 bg-white/12 backdrop-blur-2xl [box-shadow:inset_0_1px_0_rgba(255,255,255,0.15)]">
      <div className="flex gap-1 p-2">
        {OPTIONS.map((opt) => {
          const isActive = opt.id === active;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setActive(opt.id)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 text-[12px] font-medium transition-colors ${
                isActive ? "bg-white/20 text-white" : "text-white/70"
              }`}
            >
              <opt.Icon className="h-5 w-5" />
              {opt.label}
            </button>
          );
        })}
      </div>
      <div className="border-t border-white/10 p-5 text-[15px] leading-relaxed text-white/95">
        {current.body}
      </div>
    </div>
  );
}
