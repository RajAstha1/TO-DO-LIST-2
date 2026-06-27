import React, { useState } from "react";
import { Plus, Calendar, Tag, AlertCircle, Flag } from "lucide-react";
import { Priority, Todo } from "../types";

interface TodoFormProps {
  onAddTodo: (todo: Omit<Todo, "id" | "completed" | "createdAt">) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
}

export default function TodoForm({ onAddTodo, categories, onAddCategory }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTodo({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      category: category || "General",
    });

    setTitle("");
    setDescription("");
    setPriority(Priority.MEDIUM);
    setDueDate("");
    setCategory(categories[0] || "General");
  };

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      onAddCategory(trimmed);
      setCategory(trimmed);
      setNewCatName("");
      setShowNewCatInput(false);
    }
  };

  // Set default category on mount/load if empty
  React.useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  return (
    <form
      id="todo-form"
      onSubmit={handleSubmit}
      className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="todo-title-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Task Name
          </label>
          <input
            id="todo-title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Review quarter plans, Water the plants..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="todo-desc-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Description <span className="text-slate-300 font-normal">(Optional)</span>
          </label>
          <textarea
            id="todo-desc-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add specific notes, links, or sub-steps..."
            rows={2}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
          />
        </div>

        {/* Priority, Date & Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Priority selector */}
          <div id="priority-selector-container">
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-slate-400" /> Priority
            </span>
            <div id="priority-options-group" className="flex bg-slate-50 p-1 border border-slate-200 rounded-xl">
              {(Object.keys(Priority) as Array<keyof typeof Priority>).map((key) => {
                const val = Priority[key];
                const isActive = priority === val;
                let activeStyle = "bg-white text-slate-800 shadow-sm";
                if (isActive) {
                  if (val === Priority.HIGH) activeStyle = "bg-rose-50 text-rose-700 shadow-sm border border-rose-100";
                  if (val === Priority.MEDIUM) activeStyle = "bg-amber-50 text-amber-700 shadow-sm border border-amber-100";
                  if (val === Priority.LOW) activeStyle = "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100";
                }

                return (
                  <button
                    id={`priority-btn-${val}`}
                    key={val}
                    type="button"
                    onClick={() => setPriority(val)}
                    className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                      isActive ? activeStyle : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due date picker */}
          <div>
            <label htmlFor="todo-due-date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due Date
            </label>
            <div className="relative">
              <input
                id="todo-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Category Dropdown & Custom Adder */}
          <div>
            <label htmlFor="todo-category-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
            </label>
            {!showNewCatInput ? (
              <div className="flex gap-2">
                <select
                  id="todo-category-select"
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setShowNewCatInput(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__add_new__" className="text-indigo-600 font-semibold">
                    + Add Custom Tag
                  </option>
                </select>
              </div>
            ) : (
              <div className="flex gap-1.5" id="new-category-input-group">
                <input
                  id="new-category-input"
                  type="text"
                  placeholder="Tag name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-medium"
                />
                <button
                  id="save-new-category-btn"
                  type="button"
                  onClick={handleAddCategory}
                  className="px-2.5 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  Save
                </button>
                <button
                  id="cancel-new-category-btn"
                  type="button"
                  onClick={() => setShowNewCatInput(false)}
                  className="px-2.5 py-2 bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2 flex justify-end">
          <button
            id="todo-submit-btn"
            type="submit"
            disabled={!title.trim()}
            className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
              title.trim()
                ? "bg-slate-900 hover:bg-slate-800 text-white hover:shadow-md cursor-pointer active:scale-[0.98]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>
    </form>
  );
}
