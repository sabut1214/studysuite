"use client";

import { useMemo, useState } from "react";

type Expense = {
  id: string;
  title: string;
  payer: string;
  amount: number;
  participants: string[];
};

type Settlement = {
  from: string;
  to: string;
  amount: number;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now());

export default function SplitForm() {
  const [people, setPeople] = useState<string[]>(["Asha", "Ravi", "Nima"]);
  const [nameInput, setNameInput] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    payer: "Asha",
    amount: "",
    participants: ["Asha", "Ravi", "Nima"],
  });
  const [copied, setCopied] = useState(false);

  const balances = useMemo(() => {
    const balanceMap: Record<string, number> = {};
    people.forEach((person) => {
      balanceMap[person] = 0;
    });

    expenses.forEach((expense) => {
      if (expense.participants.length === 0) return;
      const share = expense.amount / expense.participants.length;
      expense.participants.forEach((person) => {
        balanceMap[person] -= share;
      });
      balanceMap[expense.payer] += expense.amount;
    });

    return balanceMap;
  }, [expenses, people]);

  const settlements = useMemo<Settlement[]>(() => {
    const creditors = Object.entries(balances)
      .filter(([, value]) => value > 0.005)
      .map(([name, value]) => ({ name, value }));
    const debtors = Object.entries(balances)
      .filter(([, value]) => value < -0.005)
      .map(([name, value]) => ({ name, value: Math.abs(value) }));

    const results: Settlement[] = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.value, creditor.value);
      results.push({ from: debtor.name, to: creditor.name, amount });
      debtor.value -= amount;
      creditor.value -= amount;
      if (debtor.value <= 0.005) i += 1;
      if (creditor.value <= 0.005) j += 1;
    }
    return results;
  }, [balances]);

  const addPerson = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || people.includes(trimmed)) return;
    const updated = [...people, trimmed];
    setPeople(updated);
    setExpenseForm((prev) => ({
      ...prev,
      payer: prev.payer || trimmed,
      participants: [...prev.participants, trimmed],
    }));
    setNameInput("");
  };

  const removePerson = (name: string) => {
    const updated = people.filter((person) => person !== name);
    setPeople(updated);
    setExpenseForm((prev) => ({
      ...prev,
      participants: prev.participants.filter((person) => person !== name),
      payer: prev.payer === name ? updated[0] ?? "" : prev.payer,
    }));
    setExpenses((prev) =>
      prev
        .filter((expense) => expense.payer !== name)
        .map((expense) => ({
          ...expense,
          participants: expense.participants.filter((person) => person !== name),
        }))
        .filter((expense) => expense.participants.length > 0)
    );
  };

  const toggleParticipant = (name: string) => {
    setExpenseForm((prev) => {
      const exists = prev.participants.includes(name);
      const participants = exists
        ? prev.participants.filter((person) => person !== name)
        : [...prev.participants, name];
      return { ...prev, participants };
    });
  };

  const addExpense = () => {
    const amount = Number(expenseForm.amount);
    if (!expenseForm.title.trim() || !expenseForm.payer || amount <= 0) return;
    if (expenseForm.participants.length === 0) return;
    setExpenses((prev) => [
      ...prev,
      {
        id: createId(),
        title: expenseForm.title,
        payer: expenseForm.payer,
        amount,
        participants: expenseForm.participants,
      },
    ]);
    setExpenseForm((prev) => ({
      ...prev,
      title: "",
      amount: "",
    }));
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const exportText = () => {
    const lines = ["Expense summary", "", "Balances:"];
    people.forEach((person) => {
      const value = balances[person] ?? 0;
      const direction = value >= 0 ? "receives" : "owes";
      lines.push(`${person}: ${direction} NPR ${Math.abs(value).toFixed(2)}`);
    });
    lines.push("", "Settlements:");
    if (settlements.length === 0) {
      lines.push("All settled.");
    } else {
      settlements.forEach((settlement) => {
        lines.push(
          `${settlement.from} pays ${settlement.to} NPR ${settlement.amount.toFixed(2)}`
        );
      });
    }
    return lines.join("\n");
  };

  const copySummary = async () => {
    const text = exportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-amber-100/30">
          <h2 className="text-lg font-semibold text-slate-900">People</h2>
          <div className="flex flex-wrap gap-2">
            {people.map((person) => (
              <span
                key={person}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm"
              >
                {person}
                <button
                  type="button"
                  onClick={() => removePerson(person)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  remove
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Add person"
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
            />
            <button
              type="button"
              onClick={addPerson}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Add
            </button>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-amber-100/30">
          <h2 className="text-lg font-semibold text-slate-900">Add expense</h2>
          <label className="grid gap-2 text-sm text-slate-700">
            Title
            <input
              className="rounded-xl border border-slate-200 px-3 py-2"
              value={expenseForm.title}
              onChange={(event) =>
                setExpenseForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Lunch"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-700">
              Payer
              <select
                className="rounded-xl border border-slate-200 px-3 py-2"
                value={expenseForm.payer}
                onChange={(event) =>
                  setExpenseForm((prev) => ({ ...prev, payer: event.target.value }))
                }
              >
                {people.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Amount (NPR)
              <input
                type="number"
                step="0.01"
                className="rounded-xl border border-slate-200 px-3 py-2"
                value={expenseForm.amount}
                onChange={(event) =>
                  setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))
                }
              />
            </label>
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Participants</span>
            <div className="flex flex-wrap gap-2">
              {people.map((person) => (
                <label
                  key={person}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                    expenseForm.participants.includes(person)
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={expenseForm.participants.includes(person)}
                    onChange={() => toggleParticipant(person)}
                  />
                  {person}
                </label>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={addExpense}
            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Add expense
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-amber-100/30">
          <h2 className="text-lg font-semibold text-slate-900">Expenses</h2>
          {expenses.length === 0 ? (
            <p className="text-sm text-slate-500">No expenses yet.</p>
          ) : (
            <div className="grid gap-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{expense.title}</div>
                    <div className="text-xs text-slate-500">
                      {expense.payer} paid NPR {expense.amount.toFixed(2)} for {" "}
                      {expense.participants.join(", ")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExpense(expense.id)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-amber-100/30">
          <h2 className="text-lg font-semibold text-slate-900">Balances</h2>
          <div className="grid gap-2">
            {people.map((person) => {
              const value = balances[person] ?? 0;
              return (
                <div
                  key={person}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <span>{person}</span>
                  <span
                    className={
                      value >= 0
                        ? "font-semibold text-emerald-600"
                        : "font-semibold text-rose-600"
                    }
                  >
                    {value >= 0 ? "+" : "-"}NPR {Math.abs(value).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs text-amber-900">
            <div className="font-semibold">Settlements</div>
            {settlements.length === 0 ? (
              <div>All settled.</div>
            ) : (
              <ul className="mt-2 grid gap-1">
                {settlements.map((settlement, index) => (
                  <li key={`${settlement.from}-${settlement.to}-${index}`}>
                    {settlement.from} pays {settlement.to} NPR {settlement.amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid gap-2">
            <textarea
              readOnly
              className="min-h-[140px] rounded-xl border border-slate-200 bg-white p-3 text-xs"
              value={exportText()}
            />
            <button
              type="button"
              onClick={copySummary}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              {copied ? "Copied" : "Copy summary"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
