import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

axios.defaults.withCredentials = true;
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const socket = io(`${API_BASE_URL}`);

const Messages = () => {
  const [activeTab, setActiveTab] = useState("Messenger"); // "Messenger" or "Instagram"
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadConversations, setUnreadConversations] = useState(new Set()); // Track conversations with unread messages

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.log("Notification permission denied.");
        }
      });
    }
  }, []);

  // Fetch conversations with polling
  useEffect(() => {
    const fetchConversations = () => {
      const endpoint =
        activeTab === "Messenger"
          ? `${API_BASE_URL}/api/messages/conversations`
          : `${API_BASE_URL}/api/instagram/conversations`;

      axios
        .get(endpoint)
        .then((response) => {
          console.log(`Fetched ${activeTab} Conversations:`, response.data);
          setConversations(response.data?.data || []);
        })
        .catch((error) => {
          console.error(`Error fetching ${activeTab} conversations:`, error);
          setConversations([]);
        });
    };

    fetchConversations();
    const intervalId = setInterval(fetchConversations, 10000);
    return () => clearInterval(intervalId);
  }, [activeTab]);

  // Load messages for the selected conversation
  const loadMessages = (conversationId) => {
    setSelectedChat(conversationId);
    const endpoint =
      activeTab === "Messenger"
        ? `${API_BASE_URL}/api/messages/messages/${conversationId}`
        : `${API_BASE_URL}/api/instagram/messages/${conversationId}`;

    axios
      .get(endpoint)
      .then((response) => {
        console.log(`Fetched ${activeTab} Messages:`, response.data);
        const sortedMessages =
          response.data?.data.sort((a, b) => new Date(a.created_time) - new Date(b.created_time)) || [];
        const conversation = conversations.find((conv) => conv.id === conversationId);
        const otherUser =
          conversation?.participants?.data?.find((p) => p.id !== "17841472715802584")?.name || "Unknown";
        const enrichedMessages = sortedMessages.map((msg) => ({
          ...msg,
          from: msg.from || { name: otherUser },
        }));
        setMessages(enrichedMessages);

        // Mark the conversation as read when opened
        setUnreadConversations((prev) => {
          const updated = new Set(prev);
          updated.delete(conversationId);
          return updated;
        });
      })
      .catch((error) => console.error(`Error fetching ${activeTab} messages:`, error));
  };

  // Handle incoming messages via Socket.IO
  useEffect(() => {
    socket.on("messageReceived", (newMessage) => {
      // Determine the platform (Messenger or Instagram) based on the message context
      const platform = activeTab; // This assumes the message is from the active tab; adjust if backend provides platform info
      const conversationId = newMessage.thread_id || newMessage.sender?.id;

      // Update messages if the message belongs to the currently selected chat
      if (selectedChat === conversationId) {
        setMessages((prevMessages) => {
          if (!prevMessages.some((msg) => msg.created_time === newMessage.created_time)) {
            return [...prevMessages, newMessage].sort((a, b) => new Date(a.created_time) - new Date(b.created_time));
          }
          return prevMessages;
        });

        const chatContainer = document.getElementById("chat-container");
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      } else {
        // Mark the conversation as unread if it's not the currently selected chat
        setUnreadConversations((prev) => new Set(prev).add(conversationId));
      }

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        const senderName = newMessage.from?.name || "Unknown";
        new Notification(`New ${platform} Message`, {
          body: `${senderName}: ${newMessage.message}`,
          icon: "/path/to/icon.png", // Optional: Add an icon for the notification
        });
      }
    });

    return () => {
      socket.off("messageReceived");
    };
  }, [selectedChat, activeTab]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) {
      console.error("Missing conversation ID or message content");
      return;
    }

    const conversation = conversations.find((conv) => conv.id === selectedChat);
    const participants = conversation?.participants?.data;
    if (!participants || participants.length < 2) {
      console.error("Invalid participants data:", participants);
      return;
    }

    console.log("Participants:", participants);

    const recipientId = participants.find((p) => p.id !== "17841472715802584")?.id;

    if (!recipientId) {
      console.error("Recipient ID not found in participants:", participants);
      return;
    }

    const messageData = {
      recipientId,
      message: newMessage.trim(),
      from: { name: "You" },
      created_time: new Date().toISOString(),
    };

    socket.emit("newMessage", messageData);

    const endpoint =
      activeTab === "Messenger" ? `${API_BASE_URL}/api/messages/send` : `${API_BASE_URL}/api/instagram/send`;

    axios
      .post(endpoint, {
        recipientId,
        message: newMessage.trim(),
      })
      .then((response) => {
        console.log(`${activeTab} message sent successfully:`, response.data);
        loadMessages(selectedChat);
      })
      .catch((error) => {
        console.error(`Error sending ${activeTab} message:`, error.response?.data || error.message);
      });

    setNewMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 border-r bg-white p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>

        {/* Tabs for Messenger and Instagram */}
        <div className="flex mb-4">
          <button
            className={`w-1/2 p-2 text-center ${
              activeTab === "Messenger" ? "border-b-2 border-brand-black font-bold" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("Messenger")}
          >
            Messenger
          </button>
          <button
            className={`w-1/2 p-2 text-center ${
              activeTab === "Instagram" ? "border-b-2 border-brand-black font-bold" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("Instagram")}
          >
            Instagram
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input placeholder="Search conversations..." className="pl-10 py-2 border rounded-full" />
        </div>

        {conversations.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No conversations found</p>
        ) : (
          conversations.map((conv) => {
            const participant = conv.participants?.data?.find((p) => p.id !== "17841472715802584") || {
              name: "Unknown",
              profile_pic: null,
            };
            const isUnread = unreadConversations.has(conv.id);
            return (
              <Card
                key={conv.id}
                className={`p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-200 transition flex items-center ${
                  isUnread ? "bg-blue-50" : ""
                }`}
                onClick={() => loadMessages(conv.id)}
              >
                <Avatar className="h-10 w-10 rounded-full">
                  {participant.profile_pic ? (
                    <AvatarImage src={participant.profile_pic} alt={participant.name} />
                  ) : (
                    <AvatarFallback className="bg-brand-black text-white w-full h-full flex items-center justify-center rounded-full">
                      {participant.name.slice(0, 2) || "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <h3 className={`font-medium text-sm ${isUnread ? "text-blue-600" : ""}`}>
                      {participant.name}
                    </h3>
                    {isUnread && <span className="ml-2 w-3 h-3 bg-blue-500 rounded-full"></span>}
                  </div>
                  <p className="text-xs text-gray-500">Messages: {conv.message_count || 0}</p>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="w-2/3 flex flex-col">
        {selectedChat ? (
          <>
            <div className="flex justify-end p-2">
              <Button onClick={() => loadMessages(selectedChat)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                Refresh Messages
              </Button>
            </div>
            <div id="chat-container" className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-start mb-3 ${msg.from.name === "You" ? "items-end" : "items-start"}`}
                >
                  <span className="text-xs text-gray-500 mb-1">{msg.from.name}</span>
                  <div
                    className={`rounded-lg p-3 max-w-xs ${
                      msg.from.name === "You" ? "bg-brand-black text-white" : "bg-gray-200 text-black"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <span className="text-xs block mt-1 opacity-70">
                      {new Date(msg.created_time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t flex items-center space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-full"
              />
              <Button onClick={sendMessage} className="bg-brand-black text-white px-4 py-2 rounded-lg">
                Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 justify-center items-center text-gray-500">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;