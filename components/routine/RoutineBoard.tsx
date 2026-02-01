"use client";

import { useMemo, useState } from "react";
import { useLocalStorage } from "@/components/storage/useLocalStorage";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const slots = [
  "06:00",
  "07:30",
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00",
];

type RoutineBlock = {
  id: string;
  day: string;
  time: string;
  subject: string;
  room: string;
  teacher: string;
};

const emptyForm = {
  day: days[0],
  time: slots[0],
  subject: "",
  room: "",
  teacher: "",
};

export default function RoutineBoard() {
  const [blocks, setBlocks, ready] = useLocalStorage<RoutineBlock[]>(
    "nst-routine",
    []
  );
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const gridMap = useMemo(() => {
    const map = new Map<string, RoutineBlock[]>();
    blocks.forEach((block) => {
      const key = `${block.day}-${block.time}`;
      const bucket = map.get(key) ?? [];
      bucket.push(block);
      map.set(key, bucket);
    });
    return map;
  }, [blocks]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (block: RoutineBlock) => {
    setEditingId(block.id);
    setForm({
      day: block.day,
      time: block.time,
      subject: block.subject,
      room: block.room,
      teacher: block.teacher,
    });
  };

  const saveBlock = () => {
    if (!form.subject.trim()) return;

    if (editingId) {
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === editingId ? { ...block, ...form } : block
        )
      );
    } else {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now());
      setBlocks((prev) => [...prev, { id, ...form }]);
    }

    resetForm();
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    if (editingId === id) resetForm();
  };

  if (!ready) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-amber-100/30">
        Loading routine...
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-amber-100/30">
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId ? "Edit block" : "Add a block"}
        </h2>
        <div className="grid gap-4 md:grid-cols-5">
          <label className="grid gap-2 text-sm text-slate-700">
            Day
            <select
              value={form.day}
              onChange={(event) => setForm({ ...form, day: event.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            Time
            <select
              value={form.time}
              onChange={(event) => setForm({ ...form, time: event.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2"
            >
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            Subject
            <input
              value={form.subject}
              onChange={(event) =>
                setForm({ ...form, subject: event.target.value })
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Math"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            Room
            <input
              value={form.room}
              onChange={(event) => setForm({ ...form, room: event.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="B-201"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-700">
            Teacher
            <input
              value={form.teacher}
              onChange={(event) =>
                setForm({ ...form, teacher: event.target.value })
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Mrs. Rai"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveBlock}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            {editingId ? "Update" : "Add"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl shadow-amber-100/30">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[120px_repeat(7,1fr)] gap-2 text-xs font-semibold text-slate-500">
            <div className="px-3 py-2">Time</div>
            {days.map((day) => (
              <div key={day} className="px-3 py-2 text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid gap-2">
            {slots.map((slot) => (
              <div
                key={slot}
                className="grid grid-cols-[120px_repeat(7,1fr)] gap-2"
              >
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                  {slot}
                </div>
                {days.map((day) => {
                  const key = `${day}-${slot}`;
                  const items = gridMap.get(key) ?? [];
                  return (
                    <div
                      key={key}
                      className="min-h-[72px] rounded-xl border border-dashed border-slate-200 bg-white p-2"
                    >
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="mb-2 rounded-lg border border-amber-100 bg-amber-50 p-2 text-xs text-amber-900"
                        >
                          <div className="font-semibold">{item.subject}</div>
                          <div className="text-[10px]">
                            {item.room || "Room -"} | {item.teacher || "Teacher -"}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="rounded-full border border-amber-200 px-2 py-0.5 text-[10px]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBlock(item.id)}
                              className="rounded-full border border-amber-200 px-2 py-0.5 text-[10px]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
