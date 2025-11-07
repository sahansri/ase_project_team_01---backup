import React, { createContext, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../config";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // ✅ Add unique notification helper
  const addUniqueNotification = (notif) => {
    setNotifications((prev) => {
      const exists = prev.some(
        (n) =>
          (n._id && notif._id && n._id === notif._id) ||
          (n.id && notif.id && n.id === notif.id)
      );
      if (exists) return prev;

      return [
        {
          ...notif,
          id: notif.id || notif._id || `notif-${Date.now()}-${Math.random()}`,
          _id: notif._id || notif.id,
          createdAt: notif.createdAt || new Date().toISOString(),
          isRead: notif.isRead || false,
        },
        ...prev,
      ];
    });
  };

  useEffect(() => {
    const username = localStorage.getItem("username");
    let userRole = localStorage.getItem("roles");
    const token = localStorage.getItem("token");

    // ✅ Don’t connect if auth info missing
    if (!userRole || !username || !token) {
      console.warn("🔒 Missing auth info. Skipping WebSocket connection.");
      setConnectionStatus("not-logged-in");
      return;
    }

    // ✅ Normalize role name
    if (userRole.startsWith("ROLE_")) {
      userRole = userRole.replace("ROLE_", "");
    }
    userRole = userRole.toUpperCase();

    const socket = new SockJS(import.meta.env.VITE_API_URL+"/ws");

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: () => {},

      // ✅ Include token so backend can validate
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      onConnect: () => {
        console.log("✅ Connected to WebSocket");
        setConnectionStatus("connected");

        // Subscribe to topics based on role
        const handleMessage = (msg) => {
          try {
            const notif =
              typeof msg.body === "string" ? JSON.parse(msg.body) : msg.body;
            addUniqueNotification(notif);
          } catch (error) {
            console.error("❌ Error parsing message:", error);
          }
        };

        if (userRole.includes("ADMIN")) {
          client.subscribe("/topic/admin/notifications", handleMessage);
        } else if (userRole.includes("DRIVER")) {
          client.subscribe(`/topic/driver/${username}/notifications`, handleMessage);
        }

        // General broadcast channel
        client.subscribe("/topic/notifications/broadcast", handleMessage);
      },

      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame);
        setConnectionStatus("error");
      },
      onWebSocketClose: () => {
        console.warn("🔌 WebSocket closed");
        setConnectionStatus("disconnected");
      },
      onWebSocketError: (error) => {
        console.error("❌ WebSocket error:", error);
        setConnectionStatus("error");
      },
    });

    client.activate();
    setStompClient(client);

    // ✅ Cleanup on unmount
    return () => {
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, []);

  // ✅ Add notifications with duplicate checking
  const addNotifications = (newNotifications) => {
    if (!Array.isArray(newNotifications)) return;

    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n._id || n.id));
      const uniqueNew = newNotifications.filter((n) => {
        const id = n._id || n.id;
        return !existingIds.has(id);
      });

      const normalizedNew = uniqueNew.map((n) => ({
        ...n,
        id: n.id || n._id,
        _id: n._id || n.id,
      }));

      return [...prev, ...normalizedNew];
    });
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      const username = localStorage.getItem("username");
      await api.put(`notifications/user/${username}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // ✅ Mark one as read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId || n._id === notificationId
          ? { ...n, isRead: true }
          : n
      )
    );
  };

  // ✅ Remove one
  const removeNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter(
        (n) => n.id !== notificationId && n._id !== notificationId
      )
    );
  };

  // ✅ Clear all
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // ✅ Unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotifications,
        setNotifications,
        markAllAsRead,
        markAsRead,
        clearAllNotifications,
        removeNotification,
        unreadCount,
        stompClient,
        connectionStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
