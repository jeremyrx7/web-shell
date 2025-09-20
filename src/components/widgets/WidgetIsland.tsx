"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  WidgetIsland as WidgetIslandType,
  Widget,
  StrapiAPI,
} from "@/lib/strapi";
import WidgetRenderer from "./WidgetRenderer";
import {
  PlusIcon,
  TrashIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";

interface WidgetIslandProps {
  island: WidgetIslandType;
  editable?: boolean;
  locale?: string;
  className?: string;
  onWidgetAdd?: (widget: Widget) => void;
  onWidgetRemove?: (widgetId: number) => void;
  onWidgetReorder?: (widgets: Widget[]) => void;
  onConfigurationChange?: (configuration: Record<string, any>) => void;
}

interface WidgetItemProps {
  widget: Widget;
  editable: boolean;
  locale: string;
  onRemove: (widgetId: number) => void;
  onConfigChange: (widgetId: number, config: Record<string, any>) => void;
}

const SortableWidgetItem: React.FC<WidgetItemProps> = ({
  widget,
  editable,
  locale,
  onRemove,
  onConfigChange,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(widget.attributes.isActive);
  const [localConfig, setLocalConfig] = useState(
    widget.attributes.configuration || {},
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id.toString(), disabled: !editable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleConfigSave = () => {
    onConfigChange(widget.id, localConfig);
    setIsConfigOpen(false);
  };

  const handleVisibilityToggle = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onConfigChange(widget.id, { ...localConfig, isVisible: newVisibility });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`widget-item relative group ${
        isDragging ? "opacity-50" : ""
      } ${!isVisible ? "opacity-60" : ""}`}
    >
      {editable && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-1 bg-white rounded-md shadow-sm border border-gray-200 p-1">
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Configure widget"
            >
              <Cog6ToothIcon className="h-4 w-4" />
            </button>
            <button
              onClick={handleVisibilityToggle}
              className={`p-1 ${isVisible ? "text-green-500 hover:text-green-600" : "text-gray-400 hover:text-gray-600"}`}
              title={isVisible ? "Hide widget" : "Show widget"}
            >
              {isVisible ? (
                <EyeIcon className="h-4 w-4" />
              ) : (
                <EyeSlashIcon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => onRemove(widget.id)}
              className="p-1 text-red-400 hover:text-red-600"
              title="Remove widget"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isVisible && (
        <WidgetRenderer
          widget={widget}
          configuration={localConfig}
          locale={locale}
          className="widget-in-island"
        />
      )}

      {/* Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={() => setIsConfigOpen(false)}
              ></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Configure Widget: {widget.attributes.name}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuration JSON
                    </label>
                    <textarea
                      value={JSON.stringify(localConfig, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setLocalConfig(parsed);
                        } catch (error) {
                          // Invalid JSON, keep the text as is for editing
                        }
                      }}
                      rows={8}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="Enter widget configuration..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfigSave}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WidgetIsland: React.FC<WidgetIslandProps> = ({
  island,
  editable = false,
  locale = "en",
  className = "",
  onWidgetAdd,
  onWidgetRemove,
  onWidgetReorder,
  onConfigurationChange,
}) => {
  const t = useTranslations("widgets");
  const [widgets, setWidgets] = useState<Widget[]>(
    island.attributes.widgets.data || [],
  );
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>([]);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Load available widgets for selection
  useEffect(() => {
    const loadAvailableWidgets = async () => {
      try {
        const allWidgets = await StrapiAPI.getWidgets(locale);
        setAvailableWidgets(allWidgets.filter((w) => w.attributes.isActive));
      } catch (error) {
        console.error("Failed to load available widgets:", error);
      }
    };

    if (isAddingWidget) {
      loadAvailableWidgets();
    }
  }, [isAddingWidget, locale]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = widgets.findIndex(
          (widget) => widget.id.toString() === active.id,
        );
        const newIndex = widgets.findIndex(
          (widget) => widget.id.toString() === over.id,
        );

        const newWidgets = arrayMove(widgets, oldIndex, newIndex);
        setWidgets(newWidgets);
        onWidgetReorder?.(newWidgets);
      }
    },
    [widgets, onWidgetReorder],
  );

  const handleWidgetAdd = useCallback(
    async (widget: Widget) => {
      setIsLoading(true);
      try {
        const newWidgets = [...widgets, widget];
        setWidgets(newWidgets);
        onWidgetAdd?.(widget);
        setIsAddingWidget(false);
      } catch (error) {
        console.error("Failed to add widget:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [widgets, onWidgetAdd],
  );

  const handleWidgetRemove = useCallback(
    (widgetId: number) => {
      const newWidgets = widgets.filter((w) => w.id !== widgetId);
      setWidgets(newWidgets);
      onWidgetRemove?.(widgetId);
    },
    [widgets, onWidgetRemove],
  );

  const handleWidgetConfigChange = useCallback(
    (widgetId: number, config: Record<string, any>) => {
      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === widgetId
            ? {
                ...widget,
                attributes: { ...widget.attributes, configuration: config },
              }
            : widget,
        ),
      );
    },
    [],
  );

  const getIslandLayoutClass = () => {
    switch (island.attributes.layout) {
      case "grid":
        return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
      case "stack":
        return "space-y-6";
      case "carousel":
        return "flex space-x-6 overflow-x-auto pb-4";
      case "fullpage":
        return "min-h-screen";
      default:
        return "space-y-6";
    }
  };

  return (
    <div
      className={`widget-island ${className}`}
      data-island-id={island.id}
      data-island-identifier={island.attributes.identifier}
    >
      {/* Island Header */}
      <div className="widget-island-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {island.attributes.name}
            </h2>
            <p className="text-gray-600 mt-1">
              {island.attributes.description}
            </p>
          </div>

          {editable && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {widgets.length} / {island.attributes.maxWidgets || "∞"} widgets
              </span>
              {(!island.attributes.maxWidgets ||
                widgets.length < island.attributes.maxWidgets) && (
                <button
                  onClick={() => setIsAddingWidget(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Widget
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Widget Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map((w) => w.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className={`widget-island-content ${getIslandLayoutClass()}`}>
            {widgets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <PlusIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No widgets in this island</p>
                <p className="text-sm mt-1">
                  {editable
                    ? 'Click "Add Widget" to get started'
                    : "This island is empty"}
                </p>
              </div>
            ) : (
              widgets.map((widget) => (
                <SortableWidgetItem
                  key={widget.id}
                  widget={widget}
                  editable={editable}
                  locale={locale}
                  onRemove={handleWidgetRemove}
                  onConfigChange={handleWidgetConfigChange}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Widget Selection Modal */}
      {isAddingWidget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={() => setIsAddingWidget(false)}
              ></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Add Widget to {island.attributes.name}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {availableWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => handleWidgetAdd(widget)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {widget.attributes.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {widget.attributes.packageName}@
                            {widget.attributes.version}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            {widget.attributes.description}
                          </p>
                          {widget.attributes.tags &&
                            widget.attributes.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
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
                        <PlusIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setIsAddingWidget(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetIsland;
