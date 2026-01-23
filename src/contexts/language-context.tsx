"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.workflow": "Workflow",
    "nav.viewer": "3D Viewer",
    
    // Hero
    "hero.title": "Digital Twin BIM",
    "hero.subtitle": "Platform",
    "hero.description": "Revolutionize your building lifecycle management with our advanced Digital Twin BIM solution. Integrate, visualize, and optimize your built environment.",
    "hero.exploreProjects": "Explore Projects",
    "hero.viewer": "3D Viewer Demo",
    "hero.workflows": "Workflows",
    
    // Features
    "features.title": "Powerful BIM Features",
    "features.description": "Everything you need to create, manage, and optimize your digital twin ecosystem",
    "features.bim.title": "BIM Models",
    "features.bim.description": "Import and visualize IFC files with complete building information",
    "features.3d.title": "3D Visualization",
    "features.3d.description": "Interactive 3D viewer with advanced rendering capabilities",
    "features.data.title": "Data Integration",
    "features.data.description": "Connect real-time IoT data with your digital twin models",
    "features.workflow.title": "Workflow Automation",
    "features.workflow.description": "Automate processes and integrate with external systems",
    "features.monitoring.title": "Real-time Monitoring",
    "features.monitoring.description": "Monitor building performance and analytics in real-time",
    "features.gis.title": "GIS Integration",
    "features.gis.description": "Combine BIM with GIS for comprehensive spatial analysis",
    
    // CTA
    "cta.title": "Ready to Get Started?",
    "cta.description": "Transform your building data into actionable insights with our Digital Twin BIM platform",
    "cta.button": "Start Your First Project",
  },
  vi: {
    // Navigation
    "nav.home": "Trang Chủ",
    "nav.projects": "Dự Án",
    "nav.workflow": "Quy Trình",
    "nav.viewer": "Xem 3D",
    
    // Hero
    "hero.title": "Digital Twin BIM",
    "hero.subtitle": "Nền tảng",
    "hero.description": "Cách mạng hóa quản lý vòng đời công trình với giải pháp Digital Twin BIM tiên tiến. Tích hợp, trực quan hóa và tối ưu hóa môi trường xây dựng của bạn.",
    "hero.exploreProjects": "Khám Phá Dự Án",
    "hero.viewer": "Demo Xem 3D",
    "hero.workflows": "Quy Trình",
    
    // Features
    "features.title": "Tính Năng BIM Mạnh Mẽ",
    "features.description": "Mọi thứ bạn cần để tạo, quản lý và tối ưu hóa hệ sinh thái digital twin",
    "features.bim.title": "Mô Hình BIM",
    "features.bim.description": "Nhập và trực quan hóa file IFC với đầy đủ thông tin công trình",
    "features.3d.title": "Trực Quan 3D",
    "features.3d.description": "Công cụ xem 3D tương tác với khả năng render tiên tiến",
    "features.data.title": "Tích Hợp Dữ Liệu",
    "features.data.description": "Kết nối dữ liệu IoT thời gian thực với mô hình digital twin",
    "features.workflow.title": "Tự Động Hóa Quy Trình",
    "features.workflow.description": "Tự động hóa quy trình và tích hợp với hệ thống bên ngoài",
    "features.monitoring.title": "Giám Sát Thời Gian Thực",
    "features.monitoring.description": "Giám sát hiệu suất và phân tích công trình theo thời gian thực",
    "features.gis.title": "Tích Hợp GIS",
    "features.gis.description": "Kết hợp BIM với GIS cho phân tích không gian toàn diện",
    
    // CTA
    "cta.title": "Sẵn Sàng Bắt Đầu?",
    "cta.description": "Chuyển đổi dữ liệu công trình thành thông tin hữu ích với nền tảng Digital Twin BIM",
    "cta.button": "Bắt Đầu Dự Án Đầu Tiên",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
