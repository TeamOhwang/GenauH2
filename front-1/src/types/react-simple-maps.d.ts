// src/types/react-simple-maps.d.ts
declare module "react-simple-maps" {
  import * as React from "react";
  import type { FeatureCollection } from "geojson";

  export interface ComposableMapProps extends React.SVGProps<SVGSVGElement> {
    projection?: string | ((width: number, height: number) => any);
    projectionConfig?: Record<string, any>;
    width?: number;
    height?: number;
  }
  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface GeographiesProps {
    geography: string | FeatureCollection | object;
    children?: (args: { geographies: any[]; outline?: any }) => React.ReactNode;
  }
  export const Geographies: React.FC<GeographiesProps>;

  export interface GeographyProps extends React.SVGProps<SVGPathElement> {
    geography: any;
  }
  export const Geography: React.FC<GeographyProps>;
}
