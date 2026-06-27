import React, { useState } from "react";
import { motion } from "motion/react";
import { Trash2, Edit3, Check, X, Calendar, AlertCircle, Flag, ChevronDown, ChevronUp } from "lucide-react";
import { Priority, Todo } from "../types";

interface TodoItemProps {
  todo: Todo;
  categories: string[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedFields: Partial<Todo>) => void;
}

export default function TodoItem({
  todo,
  categories,
  onToggleComplete,
  onDelete,
  onUpdate,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || "");
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || "");
  const [editCategory, setEditCategory] = useState(todo.category);
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine date status
  const getDueDateStatus = () => {
    if (!todo.dueDate || todo.completed) return { label: "", style: "text-slate-400" };

    const todayStr = new Date().toISOString().split("T")[0];
    if (todo.dueDate === todayStr) {
      return { label: "Today", style: "bg-amber-50 text-amber-700 border-amber-100 font-semibold" };
    }
    if (todo.dueDate < todayStr) {
      return { label: "Overdue", style: "bg-rose-50 text-rose-700 border-rose-200 font-semibold animate-pulse" };
    }

    // Tomorrow status
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    if (todo.dueDate === tomorrowStr) {
      return { label: "Tomorrow", style: "bg-blue-50 text-blue-700 border-blue-100 font-medium" };
    }

    // Standard future date
    const dateObj = new Date(todo.dueDate + "T00:00:00");
    const formatted = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return { label: formatted, style: "bg-slate-50 text-slate-600 border-slate-100" };
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onUpdate(todo.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      dueDate: editDueDate || undefined,
      category: editCategory,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate || "");
    setEditCategory(todo.category);
    setIsEditing(false);
  };

  const priorityStyles = {
    [Priority.HIGH]: {
      badge: "bg-rose-50 text-rose-700 border-rose-100",
      dot: "bg-rose-500",
    },
    [Priority.MEDIUM]: {
      badge: "bg-amber-50 text-amber-700 border-amber-100",
      dot: "bg-amber-500",
    },
    [Priority.LOW]: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      dot: "bg-emerald-500",
    },
  };

  const dateStatus = getDueDateStatus();

  return (
    <motion.div
      id={`todo-card-${todo.id}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden bg-white border rounded-2xl transition-all duration-200 ${
        todo.completed
          ? "border-slate-100 opacity-60 bg-slate-50/50"
          : isEditing
          ? "border-indigo-300 ring-4 ring-indigo-50"
          : "border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Visual Priority Ribbon on high priority */}
      {!todo.completed && todo.priority === Priority.HIGH && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
      )}
      {!todo.completed && todo.priority === Priority.MEDIUM && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
      )}
      {!todo.completed && todo.priority === Priority.LOW && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
      )}

      {isEditing ? (
        // EDIT MODE LAYOUT
        <div className="p-5 space-y-4" id={`todo-edit-form-${todo.id}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor={`edit-title-${todo.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Task Title
              </label>
              <input
                id={`edit-title-${todo.id}`}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor={`edit-desc-${todo.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </label>
              <input
                id={`edit-desc-${todo.id}`}
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor={`edit-priority-${todo.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                id={`edit-priority-${todo.id}`}
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
              </select>
            </div>

            <div>
              <label htmlFor={`edit-date-${todo.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                id={`edit-date-${todo.id}`}
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label htmlFor={`edit-category-${todo.id}`} className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                id={`edit-category-${todo.id}`}
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-indigo-500 font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1" id="edit-mode-actions">
            <button
              id={`cancel-edit-${todo.id}`}
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              id={`save-edit-${todo.id}`}
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>
      ) : (
        // STATIC / DISPLAY VIEW
        <div className="p-4 md:p-5 flex items-start gap-4">
          {/* Circular checkbox wrapper */}
          <div className="flex items-center justify-center mt-1">
            <button
              id={`toggle-complete-btn-${todo.id}`}
              type="button"
              onClick={() => onToggleComplete(todo.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                todo.completed
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-slate-300 hover:border-indigo-500 hover:bg-slate-50"
              }`}
            >
              {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
            </button>
          </div>

          {/* Core Content */}
          <div className="flex-1 min-w-0 pr-12">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {/* Category / Tag badge */}
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/50 rounded-full text-[10px] font-bold tracking-wide uppercase">
                {todo.category}
              </span>

              {/* Priority badge */}
              <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 ${priorityStyles[todo.priority].badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityStyles[todo.priority].dot}`} />
                {todo.priority}
              </span>

              {/* Due Date tag */}
              {todo.dueDate && (
                <span className={`px-2 py-0.5 border rounded-full text-[10px] flex items-center gap-1 ${dateStatus.style}`}>
                  <Calendar className="w-3 h-3" />
                  {dateStatus.label}
                  {dateStatus.label === "Overdue" && <AlertCircle className="w-3 h-3 text-rose-500 inline" />}
                </span>
              )}
            </div>

            {/* Todo Title & Description */}
            <div>
              <h3
                id={`todo-title-text-${todo.id}`}
                className={`text-sm md:text-base font-bold text-slate-800 break-words leading-snug ${
                  todo.completed ? "line-through text-slate-400 font-medium" : ""
                }`}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <div className="mt-1">
                  {/* Collapsible description block if long or toggleable */}
                  <p
                    id={`todo-desc-text-${todo.id}`}
                    className={`text-xs text-slate-500 leading-relaxed ${
                      todo.completed ? "text-slate-400/80" : ""
                    } ${!isExpanded ? "line-clamp-2" : ""}`}
                  >
                    {todo.description}
                  </p>
                  {todo.description.length > 100 && (
                    <button
                      id={`expand-desc-btn-${todo.id}`}
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Show Less <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          Show More <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions panel (absolute positioned or clean right aligned) */}
          <div className="absolute right-3 top-3 md:right-4 md:top-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white/90 backdrop-blur-sm pl-2 py-1 rounded-lg">
            <button
              id={`edit-btn-${todo.id}`}
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id={`delete-btn-${todo.id}`}
              type="button"
              onClick={() => onDelete(todo.id)}
              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
