import React from "react";
import {
  ChevronLeft,
  Settings,
  ChevronRight,
  User,
  Target,
  Users,
  Globe,
  Bell,
  ShieldCheck,
  HelpCircle,
  LogOut,
} from "lucide-react";

const menuItems = [
  { icon: User, label: "Personal Information" },
  { icon: Target, label: "My Goals" },
  { icon: Users, label: "Activity Level", value: "Moderate" },
  { icon: Globe, label: "Units", value: "Metric (kg, cm)" },
  { icon: Bell, label: "Notifications" },
  { icon: ShieldCheck, label: "Privacy Policy" },
  { icon: HelpCircle, label: "Help & Support" },
];

export default function ProfileSettings() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#eef1f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: 300,
          background: "#ffffff",
          borderRadius: 28,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          padding: "20px 16px 24px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <ChevronLeft size={22} color="#1a1a1a" />
          <Settings size={19} color="#1a1a1a" />
        </div>

        {/* Avatar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#f2ece1",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=faces"
              alt="Alex Sharma"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <p
            style={{
              marginTop: 10,
              marginBottom: 2,
              fontSize: 16,
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            Alex Sharma
          </p>
          <p style={{ fontSize: 12, color: "#9a9a9a", margin: 0 }}>
            alex.sharma@email.com
          </p>
        </div>

        {/* Settings list */}
        <div
          style={{
            background: "#fafafa",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "13px 14px",
                  borderBottom:
                    i !== menuItems.length - 1 ? "1px solid #efefef" : "none",
                }}
              >
                <Icon size={17} color="#5f5f5f" style={{ flexShrink: 0 }} />
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1a1a1a",
                  }}
                >
                  {item.label}
                </span>
                {item.value && (
                  <span
                    style={{ fontSize: 12, color: "#9a9a9a", marginRight: 4 }}
                  >
                    {item.value}
                  </span>
                )}
                <ChevronRight size={14} color="#c4c4c4" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>

        {/* Log out */}
        <div
          style={{
            background: "#fafafa",
            borderRadius: 16,
            marginTop: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px",
            }}
          >
            <LogOut size={16} color="#e6453a" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e6453a" }}>
              Log Out
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}