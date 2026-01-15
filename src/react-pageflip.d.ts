declare module "react-pageflip" {
    import * as React from "react";
  
    export interface PageFlip {
      flipNext(): void;
      flipPrev(): void;
      flip(page: number): void;
    }
  
    export interface FlipBookProps {
      width: number;
      height: number;
      size?: "fixed" | "stretch";
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
      maxShadowOpacity?: number;
      showCover?: boolean;
      mobileScrollSupport?: boolean;
      drawShadow?: boolean;
      useMouseEvents?: boolean;
      flippingTime?: number;
      className?: string;
      style?: React.CSSProperties;
      children: React.ReactNode;
    }
  
    export default class HTMLFlipBook extends React.Component<FlipBookProps> {
      pageFlip(): PageFlip;
    }
  }
  