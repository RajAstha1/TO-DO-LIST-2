import React, { useState, useEffect, useMemo } from "react";
import { CheckSquare, Sparkles, AlertCircle, RefreshCw, Calendar, Tag, ArrowUpDown, Filter, ChevronRight, TrendingUp, Search, Plus } from "lucide-react";
import { Priority, Todo, SortOption } from "./types";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";
import UndoToast from "./components/UndoToast";

const DEFAULT_CATEGORIES = ["General", "Work", "Personal", "Health", "Finance", "Groceries", "Ideas"];

const getInitialTodos = (): Todo[] => {
  const stored = localStorage.getItem("todo_app_tasks");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored todos", e);
    }
  }

  // Seed default items for first-time premium layout experience
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const initialItems: Todo[] = [
    {
      id: "seed-1",
      title: "Review quarterly project roadmap & key metrics",
      description: "Ensure that Q3 milestones align perfectly with team bandwidth and budget estimates.",
      completed: false,
      priority: Priority.HIGH,
      dueDate: today,
      category: "Work",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "seed-2",
      title: "Weekly running session & stretching exercises",
      description: "Targeting a comfortable 5k tempo run around the neighborhood park followed by core stretching.",
      completed: false,
      priority: Priority.MEDIUM,
      dueDate: tomorrowStr,
      category: "Health",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "seed-3",
      title: "Research modular UI layouts and color patterns",
      description: "Collect high-contrast light slate color pallets and elegant fluid typography styles.",
      completed: false,
      priority: Priority.LOW,
      category: "Ideas",
      createdAt: new Date().toISOString(),
    },
    {
      id: "seed-4",
      title: "Restock whole grain loaves & fresh organic fruits",
      completed: true,
      priority: Priority.LOW,
      dueDate: today,
      category: "Groceries",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];

  localStorage.setItem("todo_app_tasks", JSON.stringify(initialItems));
  return initialItems;
};

const getInitialCategories = (): string[] => {
  const stored = localStorage.getItem("todo_app_categories");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored categories", e);
    }
  }
  localStorage.setItem("todo_app_categories", JSON.stringify(DEFAULT_CATEGORIES));
  return DEFAULT_CATEGORIES;
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(getInitialTodos);
  const [categories, setCategories] = useState<string[]>(getInitialCategories);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("dueDate");

  // Undo deletion state
  const [lastDeletedTodo, setLastDeletedTodo] = useState<Todo | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Save tasks and categories to localStorage on change
  useEffect(() => {
    localStorage.setItem("todo_app_tasks", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("todo_app_categories", JSON.stringify(categories));
  }, [categories]);

  // Clean toast timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showUndoToast) {
      timer = setTimeout(() => {
        setShowUndoToast(false);
        setLastDeletedTodo(null);
      }, 6000);
    }
    return () => clearTimeout(timer);
  }, [showUndoToast]);

  // Handle Operations
  const handleAddTodo = (newTodoFields: Omit<Todo, "id" | "completed" | "createdAt">) => {
    const newTodo: Todo = {
      ...newTodoFields,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleToggleComplete = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleUpdateTodo = (id: string, updatedFields: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    const todoToDelete = todos.find((t) => t.id === id);
    if (!todoToDelete) return;

    setLastDeletedTodo(todoToDelete);
    setToastMessage(`"${todoToDelete.title}" deleted.`);
    setShowUndoToast(true);

    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUndoDelete = () => {
    if (lastDeletedTodo) {
      setTodos((prev) => [lastDeletedTodo, ...prev]);
      setShowUndoToast(false);
      setLastDeletedTodo(null);
    }
  };

  const handleAddCategory = (newCat: string) => {
    if (newCat && !categories.includes(newCat)) {
      setCategories((prev) => [...prev, newCat]);
    }
  };

  const handleResetApp = () => {
    if (window.confirm("Are you sure you want to reset the todo list and categories to default defaults?")) {
      localStorage.removeItem("todo_app_tasks");
      localStorage.removeItem("todo_app_categories");
      setTodos([]);
      setCategories(DEFAULT_CATEGORIES);
      setTimeout(() => {
        setTodos(getInitialTodos());
      }, 100);
    }
  };

  // Filter & Sort Logic
  const processedTodos = useMemo(() => {
    let list = [...todos];

    // 1. Text Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    // 2. Status filter
    if (statusFilter === "active") {
      list = list.filter((t) => !t.completed);
    } else if (statusFilter === "completed") {
      list = list.filter((t) => t.completed);
    }

    // 3. Priority filter
    if (priorityFilter !== "all") {
      list = list.filter((t) => t.priority === priorityFilter);
    }

    // 4. Category filter
    if (categoryFilter !== "all") {
      list = list.filter((t) => t.category === categoryFilter);
    }

    // 5. Sorting
    list.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }

      if (sortBy === "priority") {
        const priorityWeight = {
          [Priority.HIGH]: 3,
          [Priority.MEDIUM]: 2,
          [Priority.LOW]: 1,
        };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }

      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }

      // Default to "createdAt" (newest first)
      return b.createdAt.localeCompare(a.createdAt);
    });

    return list;
  }, [todos, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  // Statistics derived states
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const productivityPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Priority specific counts for the bar graph
  const highPriorityCount = todos.filter((t) => !t.completed && t.priority === Priority.HIGH).length;
  const medPriorityCount = todos.filter((t) => !t.completed && t.priority === Priority.MEDIUM).length;
  const lowPriorityCount = todos.filter((t) => !t.completed && t.priority === Priority.LOW).length;
  const maxPriorityCount = Math.max(highPriorityCount, medPriorityCount, lowPriorityCount, 1);

  // Category task distribution map
  const categoryTaskDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    categories.forEach((cat) => {
      counts[cat] = todos.filter((t) => !t.completed && t.category === cat).length;
    });
    return counts;
  }, [todos, categories]);

  // Upcoming soonest deadlines
  const upcomingDeadlines = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return todos
      .filter((t) => !t.completed && t.dueDate)
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
      .slice(0, 3);
  }, [todos]);

  // Format today's date elegantly
  const formattedToday = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Category row color styling palette
  const getCategoryTheme = (cat: string) => {
    const themes: { [key: string]: { bg: string; text: string; dot: string } } = {
      Work: { bg: "bg-blue-50/70 hover:bg-blue-50 text-blue-900", text: "text-blue-500", dot: "bg-blue-500" },
      Personal: { bg: "bg-rose-50/70 hover:bg-rose-50 text-rose-900", text: "text-rose-500", dot: "bg-rose-500" },
      Health: { bg: "bg-emerald-50/70 hover:bg-emerald-50 text-emerald-900", text: "text-emerald-500", dot: "bg-emerald-500" },
      Finance: { bg: "bg-amber-50/70 hover:bg-amber-50 text-amber-900", text: "text-amber-500", dot: "bg-amber-500" },
      Groceries: { bg: "bg-purple-50/70 hover:bg-purple-50 text-purple-900", text: "text-purple-500", dot: "bg-purple-500" },
      Ideas: { bg: "bg-teal-50/70 hover:bg-teal-50 text-teal-900", text: "text-teal-500", dot: "bg-teal-500" },
      General: { bg: "bg-slate-100 hover:bg-slate-200 text-slate-800", text: "text-slate-500", dot: "bg-slate-500" },
    };
    return themes[cat] || { bg: "bg-slate-50 hover:bg-slate-100 text-slate-700", text: "text-slate-400", dot: "bg-slate-400" };
  };

  return (
    <div id="todo-app-root" className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-950">
      
      {/* Premium Header Bar */}
      <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100" id="app-logo">
            <CheckSquare className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <div>
            <h1 id="main-title" className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-1.5">
              DoFlow <Sparkles className="w-4 h-4 text-indigo-500" />
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">{formattedToday}</p>
          </div>
        </div>

        {/* Top Header Quick Actions & Reset button */}
        <div className="flex items-center gap-4">
          <button
            id="reset-app-btn"
            type="button"
            onClick={handleResetApp}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 shadow-sm transition-all cursor-pointer"
            title="Reset template tasks"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Reset Template
          </button>
        </div>
      </header>

      {/* Bento Grid Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Focus Task List (Large Bento) */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col space-y-6">
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
              Today's Focus
            </h2>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
              {activeCount} active tasks
            </span>
          </div>

          {/* Integrated Search Bar */}
          <div className="relative">
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions, or tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            {searchQuery && (
              <button
                id="clear-search-btn"
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 px-2 py-0.5 rounded transition-all"
              >
                Clear
              </button>
            )}
          </div>

          {/* Integrated Quick Status Segmented Filters */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex bg-slate-50 p-1 border border-slate-200 rounded-xl max-w-xs flex-1">
              {(["all", "active", "completed"] as const).map((status) => {
                const isActive = statusFilter === status;
                return (
                  <button
                    id={`filter-status-btn-${status}`}
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>

            {/* Total items found count */}
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
              Found {processedTodos.length} of {totalCount}
            </span>
          </div>

          {/* Core Scrollable Tasks Container */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent" id="todos-list-container">
            {processedTodos.length > 0 ? (
              processedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  categories={categories}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTodo}
                  onUpdate={handleUpdateTodo}
                />
              ))
            ) : (
              // Empty State representation
              <div
                id="empty-state-card"
                className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-12 h-12 bg-white border border-slate-100 text-slate-400 rounded-full flex items-center justify-center shadow-inner">
                  <AlertCircle className="w-6 h-6 stroke-[1.5px]" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h4 className="text-sm font-bold text-slate-700">No matching tasks found</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Try adjusting your tags, sorting, priority filters, or add a new task below.
                  </p>
                </div>
                {(searchQuery || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all") && (
                  <button
                    id="clear-all-filters-btn"
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setPriorityFilter("all");
                      setCategoryFilter("all");
                    }}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl text-xs font-bold text-indigo-700 transition-all cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Integrated Creator Form at the bottom */}
          <div className="pt-4 border-t border-slate-100 mt-auto">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Add New Task</h4>
            <TodoForm
              onAddTodo={handleAddTodo}
              categories={categories}
              onAddCategory={handleAddCategory}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Bento stats and custom controls */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-4 space-y-6 flex flex-col">
          
          {/* Card 1: Productivity / Progress Bento (Dark themed card) */}
          <div className="bg-slate-900 rounded-3xl shadow-xl p-6 text-white flex flex-col justify-between h-[230px] relative overflow-hidden" id="productivity-bento-card">
            {/* Background design accents */}
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
            <div className="absolute -left-6 -top-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />

            <div className="z-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Productivity Score
              </p>
              <h3 className="text-4xl font-extrabold font-display">{productivityPercentage}%</h3>
            </div>

            {/* Dynamic CSS priority graph */}
            <div className="h-24 flex items-end gap-3 px-1 z-10" id="bento-priority-bars">
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full bg-rose-500 rounded-t-lg shadow-lg shadow-rose-500/20 transition-all duration-500"
                  style={{ height: `${Math.round((highPriorityCount / maxPriorityCount) * 100) || 5}%`, minHeight: "8px" }}
                />
                <span className="text-[9px] font-bold text-slate-400 uppercase">High</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full bg-amber-500 rounded-t-lg shadow-lg shadow-amber-500/20 transition-all duration-500"
                  style={{ height: `${Math.round((medPriorityCount / maxPriorityCount) * 100) || 5}%`, minHeight: "8px" }}
                />
                <span className="text-[9px] font-bold text-slate-400 uppercase">Med</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full bg-emerald-500 rounded-t-lg shadow-lg shadow-emerald-500/20 transition-all duration-500"
                  style={{ height: `${Math.round((lowPriorityCount / maxPriorityCount) * 100) || 5}%`, minHeight: "8px" }}
                />
                <span className="text-[9px] font-bold text-slate-400 uppercase">Low</span>
              </div>
            </div>

            <div className="flex justify-between items-center z-10 pt-1 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-300">{activeCount} tasks left today</p>
              <div className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center text-xs font-bold text-slate-200">
                ↗
              </div>
            </div>
          </div>

          {/* Card 2: Categories List Bento (Interactive Filter Sidebar) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm" id="categories-bento-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-950 font-display text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-500" /> Categories / Tags
              </h3>
              {categoryFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Clear filter
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {/* Reset to show all categories */}
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                  categoryFilter === "all"
                    ? "bg-slate-900 text-white border-slate-900 font-bold"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700 font-semibold"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${categoryFilter === "all" ? "bg-white" : "bg-slate-400"}`} />
                  <span className="text-xs">All Categories</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${categoryFilter === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {todos.filter((t) => !t.completed).length}
                </span>
              </button>

              {/* Individual categories */}
              {categories.map((cat) => {
                const count = categoryTaskDistribution[cat] || 0;
                const isSelected = categoryFilter === cat;
                const style = getCategoryTheme(cat);

                return (
                  <button
                    id={`bento-category-row-${cat}`}
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm shadow-indigo-100"
                        : `${style.bg} border-transparent`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : style.dot}`} />
                      <span className="text-xs font-semibold">{cat}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20 text-white" : "bg-slate-200/50 text-slate-700"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Advanced Sorts and Priority filters */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm space-y-4" id="advanced-filters-bento">
            <h3 className="font-bold text-slate-950 font-display text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-500" /> Sort & Prioritize
            </h3>

            {/* Priority filter */}
            <div>
              <label htmlFor="filter-priority-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Priority filter
              </label>
              <select
                id="filter-priority-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as "all" | Priority)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
              >
                <option value="all">All Priorities</option>
                <option value={Priority.HIGH}>🔴 High Priority</option>
                <option value={Priority.MEDIUM}>🟡 Medium Priority</option>
                <option value={Priority.LOW}>🟢 Low Priority</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label htmlFor="sort-by-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Order by
              </label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-semibold"
              >
                <option value="dueDate">📅 Due Date (Soonest first)</option>
                <option value="priority">🔥 Priority (High to Low)</option>
                <option value="createdAt">🆕 Date Created (Newest first)</option>
                <option value="alphabetical">🔤 Title (A - Z)</option>
              </select>
            </div>
          </div>

          {/* Card 4: Upcoming Deadlines List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm space-y-4" id="upcoming-bento-card">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-950 font-display text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" /> Upcoming Deadlines
              </h3>
            </div>
            
            <div className="space-y-3">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((t) => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const isOverdue = !t.completed && t.dueDate && t.dueDate < todayStr;
                  const dateObj = new Date(t.dueDate + "T00:00:00");
                  const formatted = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                  return (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isOverdue
                          ? "bg-rose-50/50 border-rose-100 text-rose-950"
                          : "bg-slate-50 border-slate-100 text-slate-800"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className={`text-xs font-bold truncate ${t.completed ? "line-through opacity-60" : ""}`}>
                          {t.title}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {t.category}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        isOverdue ? "bg-rose-100 text-rose-700 font-extrabold animate-pulse" : "bg-white text-slate-600 border border-slate-200"
                      }`}>
                        {formatted}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 bg-slate-50/50 border border-dashed border-slate-100 rounded-2xl">
                  <span className="text-slate-400 text-xs font-semibold">No upcoming deadlines</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Persistent Undo deletion toast notification */}
      <UndoToast
        isVisible={showUndoToast}
        message={toastMessage}
        onUndo={handleUndoDelete}
        onDismiss={() => setShowUndoToast(false)}
      />

    </div>
  );
}
