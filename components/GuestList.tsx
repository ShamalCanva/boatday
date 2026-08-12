import type { Guest } from "@/lib/types";
import { WheelIcon } from "./icons";

function dotClass(status: Guest["status"]) {
  if (status === "coming") return "bg-emerald-400 border-emerald-400";
  if (status === "not-coming") return "bg-red-400 border-red-400";
  return "border-white/50 bg-transparent"; // maybe / pending — hollow
}

export default function GuestList({ guests }: { guests: Guest[] }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-3">
        {guests.map((guest) => (
          <div key={guest.name} className="flex items-center gap-2">
            {guest.role ? (
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral"
                role="img"
                aria-label={guest.role}
                title={guest.role}
              >
                <WheelIcon className="h-3 w-3 text-white" />
              </span>
            ) : (
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full border ${dotClass(guest.status)}`} />
            )}
            <p className="truncate text-[14px] font-medium leading-tight">{guest.name}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-white/10 pt-3 text-[12px] text-white/60">
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" /> Coming
        <span className="mx-1.5 align-middle">·</span>
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full border border-white/50 align-middle" /> Maybe
        <span className="mx-1.5 align-middle">·</span>
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-400 align-middle" /> Can&rsquo;t make it
        <span className="mx-1.5 align-middle">·</span>
        <WheelIcon className="mr-1 inline-block h-3 w-3 align-middle text-coral" /> Captain
      </p>
    </div>
  );
}
