import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

axios.defaults.withCredentials = true;
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const socket = io(`${API_BASE_URL}`);

const Messages = () => {
  const [activeTab, setActiveTab] = useState("Messenger"); // "Messenger" or "Instagram"
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchConversations();
  }, [activeTab]);

  const fetchConversations = () => {
    const endpoint =
      activeTab === "Messenger"
        ? `${API_BASE_URL}/api/messages/conversations`
        : `${API_BASE_URL}/api/instagram/conversations`;

    axios
      .get(endpoint)
      .then((response) => {
        setConversations(response.data?.data || []);
      })
      .catch((error) => {
        console.error(`Error fetching ${activeTab} conversations:`, error);
        setConversations([]);
      });
  };

  const loadMessages = (conversationId) => {
    setSelectedChat(conversationId);
    const endpoint =
      activeTab === "Messenger"
        ? `${API_BASE_URL}/api/messages/messages/${conversationId}`
        : `${API_BASE_URL}/api/instagram/messages/${conversationId}`;

    axios
      .get(endpoint)
      .then((response) => {
        const sortedMessages =
          response.data?.data.sort((a, b) => new Date(a.created_time) - new Date(b.created_time)) || [];
        const conversation = conversations.find((conv) => conv.id === conversationId);
        const otherUser =
          conversation?.participants?.data?.find((p) => p.id !== conversation?.participants?.data?.[1]?.id)?.name ||
          "Unknown";
        const enrichedMessages = sortedMessages.map((msg) => ({
          ...msg,
          from: msg.from || { name: otherUser },
        }));
        setMessages(enrichedMessages);
      })
      .catch((error) => console.error(`Error fetching ${activeTab} messages:`, error));
  };

  useEffect(() => {
    socket.on("messageReceived", (newMessage) => {
      setMessages((prevMessages) => {
        if (!prevMessages.some((msg) => msg.created_time === newMessage.created_time)) {
          return [...prevMessages, newMessage].sort((a, b) => new Date(a.created_time) - new Date(b.created_time));
        }
        return prevMessages;
      });

      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    });

    return () => {
      socket.off("messageReceived");
    };
  }, []);

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
  
    // Log participants to confirm structure
    console.log("Participants:", participants);
  
    // Filter out your Instagram Account ID to get the user's ID
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
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search conversations..." className="pl-10 py-2 border rounded-full" />
        </div>

        {conversations.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No conversations found</p>
        ) : (
          conversations.map((conv) => (
            <Card
              key={conv.id}
              className="p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-200 transition flex items-center"
              onClick={() => loadMessages(conv.id)}
            >
              <Avatar className="h-10 w-10 bg-gray-300 rounded-full text-sm font-semibold">
                <AvatarFallback className="bg-brand-black text-white w-full h-full flex items-center justify-center rounded-full">
                  {conv.participants?.data?.[0]?.name?.slice(0, 2) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <h3 className="font-medium text-sm">{conv.participants?.data?.[0]?.name || "Unknown"}</h3>
                <p className="text-xs text-gray-500">Messages: {conv.message_count}</p>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="w-2/3 flex flex-col">
        {selectedChat ? (
          <>
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