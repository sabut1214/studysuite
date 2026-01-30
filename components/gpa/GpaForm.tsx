"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const presetRanges = {
  Custom: [
    { label: "A", min: 90 },
    { label: "B", min: 80 },
    { label: "C", min: 70 },
    { label: "D", min: 60 },
    { label: "F", min: 0 },
  ],
  "University A": [
    { label: "A+", min: 90 },
    { label: "A", min: 85 },
    { label: "B+", min: 80 },
    { label: "B", min: 75 },
    { label: "C+", min: 70 },
    { label: "C", min: 65 },
    { label: "D", min: 60 },
    { label: "F", min: 0 },
  ],
  "School B": [
    { label: "Distinction", min: 80 },
    { label: "First", min: 70 },
    { label: "Second", min: 60 },
    { label: "Pass", min: 50 },
    { label: "Fail", min: 0 },
  ],
} as const;

type Range = { label: string; min: number };

type FormValues = {
  mode: "marks" | "gpa";
  obtained?: number;
  total?: number;
  gpa?: number;
  gpaScale?: number;
};

const rangeSchema = z.object({
  label: z.string().min(1, "Label is required."),
  min: z.coerce.number().min(0, "Min must be at least 0.").max(100, "Max is 100."),
});

const rangesSchema = z
  .array(rangeSchema)
  .min(1, "Add at least one grade range.")
  .refine(
    (ranges) => ranges.every((range) => range.min >= 0 && range.min <= 100),
    "Ranges must stay between 0 and 100."
  );

const formSchema = z
  .object({
    mode: z.enum(["marks", "gpa"]),
    obtained: z.coerce.number().optional(),
    total: z.coerce.number().optional(),
    gpa: z.coerce.number().optional(),
    gpaScale: z.coerce.number().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.mode === "marks") {
      if (values.obtained === undefined || values.total === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["obtained"],
          message: "Enter obtained and total marks.",
        });
      }
      if (values.total !== undefined && values.total <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["total"],
          message: "Total must be greater than 0.",
        });
      }
      if (
        values.obtained !== undefined &&
        values.total !== undefined &&
        values.obtained > values.total
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["obtained"],
          message: "Obtained marks cannot exceed total.",
        });
      }
    }

    if (values.mode === "gpa") {
      if (values.gpa === undefined || values.gpaScale === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gpa"],
          message: "Enter GPA and scale.",
        });
      }
      if (values.gpaScale !== undefined && values.gpaScale <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gpaScale"],
          message: "Scale must be greater than 0.",
        });
      }
    }
  });

export default function GpaForm() {
  const [preset, setPreset] = useState<keyof typeof presetRanges>("Custom");
  const [ranges, setRanges] = useState<Range[]>([...presetRanges.Custom]);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [result, setResult] = useState<{ percent: number; grade: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "marks",
      obtained: 0,
      total: 100,
      gpa: 3.5,
      gpaScale: 4,
    },
  });

  const mode = watch("mode");


  const handlePresetChange = (value: keyof typeof presetRanges) => {
    setPreset(value);
    setRanges([...presetRanges[value]]);
  };

  const updateRange = (index: number, field: "label" | "min", value: string) => {
    setRanges((prev) =>
      prev.map((range, idx) =>
        idx === index
          ? {
              ...range,
              [field]: field === "min" ? Number(value) : value,
            }
          : range
      )
    );
  };

  const addRange = () => {
    setRanges((prev) => [...prev, { label: "New", min: 0 }]);
  };

  const removeRange = (index: number) => {
    setRanges((prev) => prev.filter((_, idx) => idx !== index));
  };

  const onSubmit = (values: FormValues) => {
    const parsedRanges = rangesSchema.safeParse(ranges);
    if (!parsedRanges.success) {
      setRangeError(parsedRanges.error.issues[0]?.message ?? "Invalid ranges.");
      return;
    }
    setRangeError(null);

    const percent =
      values.mode === "marks"
        ? (Number(values.obtained) / Number(values.total)) * 100
        : (Number(values.gpa) / Number(values.gpaScale)) * 100;

    const sortedRanges = [...parsedRanges.data].sort((a, b) => b.min - a.min);
    const grade =
      sortedRanges.find((range) => percent >= range.min)?.label ??
      sortedRanges[sortedRanges.length - 1]?.label ??
      "N/A";

    setResult({ percent, grade });
  };

  return (
    <div className="grid gap-6">
      <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                value="marks"
                {...register("mode")}
                defaultChecked
              />
              Marks
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" value="gpa" {...register("mode")} />
              GPA
            </label>
          </div>

          {mode === "marks" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-700">
                Obtained
                <input
                  type="number"
                  step="0.01"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                  {...register("obtained", { valueAsNumber: true })}
                />
                {errors.obtained && (
                  <span className="text-xs text-rose-600">
                    {errors.obtained.message}
                  </span>
                )}
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Total
                <input
                  type="number"
                  step="0.01"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                  {...register("total", { valueAsNumber: true })}
                />
                {errors.total && (
                  <span className="text-xs text-rose-600">
                    {errors.total.message}
                  </span>
                )}
              </label>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-700">
                GPA
                <input
                  type="number"
                  step="0.01"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                  {...register("gpa", { valueAsNumber: true })}
                />
                {errors.gpa && (
                  <span className="text-xs text-rose-600">{errors.gpa.message}</span>
                )}
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                GPA Scale
                <input
                  type="number"
                  step="0.01"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                  {...register("gpaScale", { valueAsNumber: true })}
                />
                {errors.gpaScale && (
                  <span className="text-xs text-rose-600">
                    {errors.gpaScale.message}
                  </span>
                )}
              </label>
            </div>
          )}
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Grade Preset</h2>
              <p className="text-xs text-slate-500">
                Pick a preset, then edit ranges as needed.
              </p>
            </div>
            <select
              value={preset}
              onChange={(event) =>
                handlePresetChange(event.target.value as keyof typeof presetRanges)
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {Object.keys(presetRanges).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            {ranges.map((range, index) => (
              <div
                key={`${range.label}-${index}`}
                className="grid grid-cols-[1fr_120px_auto] items-center gap-2"
              >
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={range.label}
                  onChange={(event) =>
                    updateRange(index, "label", event.target.value)
                  }
                />
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  type="number"
                  step="0.1"
                  value={Number.isNaN(range.min) ? "" : range.min}
                  onChange={(event) =>
                    updateRange(index, "min", event.target.value)
                  }
                />
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  onClick={() => removeRange(index)}
                  disabled={ranges.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={addRange}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Add Range
            </button>
            {rangeError && <span className="text-xs text-rose-600">{rangeError}</span>}
          </div>
        </div>

        <button
          type="submit"
          className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-200/50"
        >
          Convert
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Percentage: <span className="font-semibold">{result.percent.toFixed(2)}%</span>
          <span className="ml-4">Grade: <span className="font-semibold">{result.grade}</span></span>
        </div>
      )}
    </div>
  );
}
