"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Widget, StrapiAPI } from "@/lib/strapi";
import WidgetRenderer from "@/components/widgets/WidgetRenderer";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

export default function WidgetsPage() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [filteredWidgets, setFilteredWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "category">("name");

  // Load widgets on mount
  useEffect(() => {
    const loadWidgets = async () => {
      try {
        setLoading(true);
        const fetchedWidgets = await StrapiAPI.getWidgets(locale);
        const activeWidgets = fetchedWidgets.filter(
          (w) => w.attributes.isActive,
        );
        setWidgets(activeWidgets);
        setFilteredWidgets(activeWidgets);
        setError(null);
      } catch (err) {
        console.error("Failed to load widgets:", err);
        setError("Failed to load widgets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadWidgets();
  }, [locale]);

  // Filter and sort widgets
  useEffect(() => {
    const filtered = widgets.filter((widget) => {
      const matchesSearch =
        widget.attributes.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        widget.attributes.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        widget.attributes.packageName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        widget.attributes.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort widgets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.attributes.name.localeCompare(b.attributes.name);
        case "date":
          return (
            new Date(b.attributes.updatedAt).getTime() -
            new Date(a.attributes.updatedAt).getTime()
          );
        case "category":
          return a.attributes.category.localeCompare(b.attributes.category);
        default:
          return 0;
      }
    });

    setFilteredWidgets(filtered);
  }, [widgets, searchTerm, selectedCategory, sortBy]);

  // Get unique categories
  const categories = Array.from(
    new Set(widgets.map((w) => w.attributes.category)),
  ).filter(Boolean);

  const handleWidgetError = (error: Error) => {
    console.error("Widget error:", error);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="flex space-x-4 mb-6">
              <div className="h-10 bg-gray-200 rounded w-64"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Widgets
        </h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("pages.widgets.title")}
        </h1>
        <p className="text-gray-600 mb-6">{t("pages.widgets.description")}</p>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search widgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <FunnelIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
                <option value="category">Sort by Category</option>
              </select>
              <AdjustmentsHorizontalIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } transition-colors`}
              >
                <ViewColumnsIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } transition-colors border-l border-gray-300`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredWidgets.length} of {widgets.length} widgets
        </div>
      </div>

      {/* Widgets Grid/List */}
      {filteredWidgets.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <div className="max-w-md mx-auto">
            <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No widgets found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "No widgets are currently available."}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6"
          }
        >
          {filteredWidgets.map((widget) => (
            <div
              key={widget.id}
              className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow ${
                viewMode === "list" ? "p-6" : "overflow-hidden"
              }`}
            >
              {viewMode === "grid" ? (
                // Grid View
                <>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {widget.attributes.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {widget.attributes.packageName}@
                          {widget.attributes.version}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          {widget.attributes.description}
                        </p>

                        {/* Category Badge */}
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {widget.attributes.category}
                          </span>
                        </div>

                        {/* Tags */}
                        {widget.attributes.tags &&
                          widget.attributes.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {widget.attributes.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {widget.attributes.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{widget.attributes.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Widget Preview */}
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="text-xs text-gray-500 mb-2">Preview:</div>
                    <div className="bg-white border border-gray-200 rounded p-2 min-h-[120px] flex items-center justify-center">
                      <WidgetRenderer
                        widget={widget}
                        locale={locale}
                        onError={handleWidgetError}
                        className="widget-preview"
                      />
                    </div>
                  </div>
                </>
              ) : (
                // List View
                <div className="flex items-start space-x-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {widget.attributes.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {widget.attributes.category}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                      {widget.attributes.packageName}@
                      {widget.attributes.version}
                    </p>

                    <p className="text-gray-600 mb-3">
                      {widget.attributes.description}
                    </p>

                    {/* Tags */}
                    {widget.attributes.tags &&
                      widget.attributes.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {widget.attributes.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="flex-shrink-0 w-48">
                    <div className="text-xs text-gray-500 mb-1">Preview:</div>
                    <div className="bg-gray-50 border border-gray-200 rounded p-2 h-24 flex items-center justify-center">
                      <WidgetRenderer
                        widget={widget}
                        locale={locale}
                        onError={handleWidgetError}
                        className="widget-preview-small"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
