import React from "react";
import { BaseWidgetConfig } from "@jeremyrx7/widget-core";

interface TestWidgetProps {
  title?: string;
}

export const TestWidget: React.FC<TestWidgetProps> = ({
  title = "Test Widget",
}) => {
  const widgetConfig: BaseWidgetConfig = {
    id: "test-widget",
    name: title,
    version: "1.0.0",
    description: "A test widget to verify React compatibility",
    author: "Test Author",
    category: "test",
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-2">{widgetConfig.name}</h2>
      <p className="text-gray-600 mb-2">{widgetConfig.description}</p>
      <div className="text-sm text-gray-500">
        <p>ID: {widgetConfig.id}</p>
        <p>Version: {widgetConfig.version}</p>
        <p>Category: {widgetConfig.category}</p>
        <p>React Version: {React.version}</p>
      </div>
    </div>
  );
};

export default TestWidget;
