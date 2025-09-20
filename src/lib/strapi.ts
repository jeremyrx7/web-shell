import axios from 'axios';

const strapiUrl = process.env.STRAPI_API_URL || 'http://localhost:1337';
const strapiToken = process.env.STRAPI_API_TOKEN;

// Create axios instance for Strapi
export const strapiClient = axios.create({
  baseURL: `${strapiUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(strapiToken && { Authorization: `Bearer ${strapiToken}` }),
  },
});

// Strapi response wrapper
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Widget types
export interface Widget {
  id: number;
  attributes: {
    name: string;
    description: string;
    packageName: string;
    version: string;
    category: string;
    tags: string[];
    isActive: boolean;
    configuration: Record<string, any>;
    preview: {
      data?: {
        id: number;
        attributes: {
          url: string;
          name: string;
          alternativeText?: string;
        };
      };
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    localizations?: {
      data: Widget[];
    };
  };
}

// Page types
export interface Page {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: any; // Rich text content
    seo: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string;
    };
    widgets: {
      data: Widget[];
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
    localizations?: {
      data: Page[];
    };
  };
}

// Widget Island types
export interface WidgetIsland {
  id: number;
  attributes: {
    name: string;
    identifier: string;
    description: string;
    allowedWidgets: string[];
    maxWidgets: number;
    layout: 'grid' | 'stack' | 'carousel' | 'fullpage';
    configuration: Record<string, any>;
    widgets: {
      data: Widget[];
    };
    page: {
      data: Page;
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

// API Functions
export class StrapiAPI {
  // Widget operations
  static async getWidgets(locale?: string): Promise<Widget[]> {
    try {
      const params = new URLSearchParams();
      if (locale) params.append('locale', locale);
      params.append('populate', 'preview,localizations');
      params.append('sort', 'name:asc');

      const response = await strapiClient.get<StrapiResponse<Widget[]>>(
        `/widgets?${params}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching widgets:', error);
      throw error;
    }
  }

  static async getWidget(id: number, locale?: string): Promise<Widget | null> {
    try {
      const params = new URLSearchParams();
      if (locale) params.append('locale', locale);
      params.append('populate', 'preview,localizations');

      const response = await strapiClient.get<StrapiResponse<Widget>>(
        `/widgets/${id}?${params}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching widget:', error);
      return null;
    }
  }

  static async createWidget(widget: Partial<Widget['attributes']>): Promise<Widget> {
    try {
      const response = await strapiClient.post<StrapiResponse<Widget>>(
        '/widgets',
        { data: widget }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating widget:', error);
      throw error;
    }
  }

  static async updateWidget(
    id: number,
    widget: Partial<Widget['attributes']>
  ): Promise<Widget> {
    try {
      const response = await strapiClient.put<StrapiResponse<Widget>>(
        `/widgets/${id}`,
        { data: widget }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating widget:', error);
      throw error;
    }
  }

  static async deleteWidget(id: number): Promise<void> {
    try {
      await strapiClient.delete(`/widgets/${id}`);
    } catch (error) {
      console.error('Error deleting widget:', error);
      throw error;
    }
  }

  // Page operations
  static async getPages(locale?: string): Promise<Page[]> {
    try {
      const params = new URLSearchParams();
      if (locale) params.append('locale', locale);
      params.append('populate', 'widgets,localizations');
      params.append('sort', 'title:asc');

      const response = await strapiClient.get<StrapiResponse<Page[]>>(
        `/pages?${params}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  static async getPage(slug: string, locale?: string): Promise<Page | null> {
    try {
      const params = new URLSearchParams();
      params.append('filters[slug][$eq]', slug);
      if (locale) params.append('locale', locale);
      params.append('populate', 'widgets.preview,localizations');

      const response = await strapiClient.get<StrapiResponse<Page[]>>(
        `/pages?${params}`
      );
      return response.data.data[0] || null;
    } catch (error) {
      console.error('Error fetching page:', error);
      return null;
    }
  }

  // Widget Island operations
  static async getWidgetIslands(): Promise<WidgetIsland[]> {
    try {
      const response = await strapiClient.get<StrapiResponse<WidgetIsland[]>>(
        '/widget-islands?populate=widgets,page'
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching widget islands:', error);
      throw error;
    }
  }

  static async getWidgetIsland(identifier: string): Promise<WidgetIsland | null> {
    try {
      const response = await strapiClient.get<StrapiResponse<WidgetIsland[]>>(
        `/widget-islands?filters[identifier][$eq]=${identifier}&populate=widgets.preview,page`
      );
      return response.data.data[0] || null;
    } catch (error) {
      console.error('Error fetching widget island:', error);
      return null;
    }
  }

  static async updateWidgetIsland(
    id: number,
    island: Partial<WidgetIsland['attributes']>
  ): Promise<WidgetIsland> {
    try {
      const response = await strapiClient.put<StrapiResponse<WidgetIsland>>(
        `/widget-islands/${id}`,
        { data: island }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating widget island:', error);
      throw error;
    }
  }

  // Upload operations
  static async uploadFile(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await axios.post(`${strapiUrl}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(strapiToken && { Authorization: `Bearer ${strapiToken}` }),
        },
      });

      return response.data[0];
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}

// Utility functions
export const getStrapiMediaUrl = (url: string): string => {
  if (url.startsWith('http')) return url;
  return `${strapiUrl}${url}`;
};

export const formatStrapiDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const getLocalizedContent = <T extends { localizations?: { data: T[] } }>(
  content: T,
  targetLocale: string
): T => {
  if (!content.localizations?.data) return content;

  const localized = content.localizations.data.find(
    (item: any) => item.attributes?.locale === targetLocale
  );

  return localized || content;
};
